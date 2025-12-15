import { useEffect } from "react";
import { SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();

export { default } from "expo-router";

export function Root() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return null;
}
