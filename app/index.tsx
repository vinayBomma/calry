import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { isOnboardingCompleted } from "../lib/database";
import { colors } from "../lib/theme";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await isOnboardingCompleted();
        setOnboardingDone(completed);
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setOnboardingDone(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  if (isLoading) {
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

  if (onboardingDone) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
