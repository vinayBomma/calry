import { Stack } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
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
  );
}
