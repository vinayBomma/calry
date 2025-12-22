import { Stack, usePathname, useRouter } from "expo-router";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { ThemeProvider, useTheme } from "../lib/ThemeContext";
import { useFoodStore } from "../store/foodStore";
import { usePremiumStore } from "../store/premiumStore";
import { useProfileStore } from "../store/profileStore";
import { initializeRevenueCat } from "../lib/revenuecat";
import { lightColors } from "../lib/theme";

function RootLayoutContent() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const loadData = useFoodStore((state) => state.loadData);
  const loadPremiumState = usePremiumStore((state) => state.loadPremiumState);
  const { loadProfile, isOnboardingComplete } = useProfileStore();
  const posthog = usePostHog();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize app data and services
    const initialize = async () => {
      await loadData();
      await loadPremiumState();
      await loadProfile();
      initializeRevenueCat();

      if (posthog) {
        // Set device ID as the user ID for PostHog session replay
        const deviceId = `${Device.brand || "unknown"}-${
          Device.modelId || "device"
        }`;
        posthog.identify(deviceId, {
          deviceBrand: Device.brand,
          deviceName: Device.modelName,
          osVersion: Device.osVersion,
          osName: Device.osName,
        });
        posthog.capture("app_opened");
      }

      setIsInitializing(false);
    };

    initialize();
  }, [loadData, loadPremiumState, loadProfile, posthog]);

  // Redirect to onboarding if not completed (and not already on onboarding screen)
  useEffect(() => {
    if (
      !isInitializing &&
      !isOnboardingComplete &&
      !pathname.startsWith("/onboarding")
    ) {
      router.replace("/onboarding");
    }
  }, [isInitializing, isOnboardingComplete, pathname, router]);

  useEffect(() => {
    if (posthog && pathname) {
      posthog.screen(pathname);
    }
  }, [pathname, posthog]);

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-meal"
          options={{
            title: "Add Meal",
            presentation: "modal",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="upgrade"
          options={{
            title: "Upgrade",
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: lightColors.background,
        }}
      >
        <ActivityIndicator size="large" color={lightColors.primary} />
      </View>
    );
  }

  const posthogApiKey = Constants.expoConfig?.extra?.posthogApiKey;
  const posthogHost = Constants.expoConfig?.extra?.posthogHost;

  const content = (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );

  // Only wrap with PostHogProvider if API key is available
  if (!posthogApiKey) {
    return content;
  }

  return (
    <PostHogProvider
      apiKey={posthogApiKey}
      options={{
        host: posthogHost,
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            console: ["error", "warn"],
          },
        },
        // Enable session replay - requires posthog-react-native-session-replay package
        enableSessionReplay: true,
        sessionReplayConfig: {
          maskAllTextInputs: false,
        },
      }}
      autocapture={true}
    >
      {content}
    </PostHogProvider>
  );
}
