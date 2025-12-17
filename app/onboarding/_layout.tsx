import { Stack } from "expo-router";
import { OnboardingProvider } from "../../lib/OnboardingContext";
import { colors } from "../../lib/theme";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="body" />
        <Stack.Screen name="activity" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="eating" />
        <Stack.Screen name="summary" />
      </Stack>
    </OnboardingProvider>
  );
}
