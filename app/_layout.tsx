import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { FoodProvider } from "../lib/FoodContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <FoodProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "SnackTrack",
            headerLargeTitle: true,
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
      </Stack>
    </FoodProvider>
  );
}
