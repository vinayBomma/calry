import { Stack, usePathname } from "expo-router";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../lib/ThemeContext";
import { useFoodStore } from "../store";
import { lightColors } from "../lib/theme";

function RootLayoutContent() {
  const { colors, isDark } = useTheme();
  const loadData = useFoodStore((state) => state.loadData);
  const posthog = usePostHog();
  const pathname = usePathname();

  useEffect(() => {
    loadData();
    if (posthog) {
      posthog.capture("app_opened");
    }
  }, [loadData, posthog]);

  useEffect(() => {
    if (posthog && pathname) {
      posthog.screen(pathname);
    }
  }, [pathname, posthog]);

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

  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
      options={{
        host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            console: ["error", "warn"],
          },
        },
        // @ts-ignore - enableSessionRecording is provided by posthog-react-native-session-replay
        enableSessionRecording: true,
      }}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </PostHogProvider>
  );
}
