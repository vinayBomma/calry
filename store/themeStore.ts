import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "../lib/theme";

type ThemeColors = typeof lightColors;

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      colors: lightColors,
      toggleTheme: () =>
        set((state) => ({
          isDark: !state.isDark,
          colors: !state.isDark ? darkColors : lightColors,
        })),
      setTheme: (isDark: boolean) =>
        set({
          isDark,
          colors: isDark ? darkColors : lightColors,
        }),
    }),
    {
      name: "snacktrack-theme",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isDark: state.isDark }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.colors = state.isDark ? darkColors : lightColors;
        }
      },
    }
  )
);
