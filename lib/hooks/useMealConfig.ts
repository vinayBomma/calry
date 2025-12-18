import { Ionicons } from "@expo/vector-icons";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealTypeConfig {
  type: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  timeRange?: string;
}

export const MEAL_OPTIONS: MealTypeConfig[] = [
  { type: "breakfast", label: "Breakfast", icon: "sunny-outline", timeRange: "6 AM - 10 AM" },
  { type: "lunch", label: "Lunch", icon: "restaurant-outline", timeRange: "11 AM - 2 PM" },
  { type: "dinner", label: "Dinner", icon: "moon-outline", timeRange: "6 PM - 9 PM" },
  { type: "snack", label: "Snack", icon: "cafe-outline", timeRange: "Anytime" },
];

/**
 * Get meal type configuration with colors from theme
 */
export function getMealTypeConfig(colors: any) {
  return {
    breakfast: { color: colors.breakfast, icon: "sunny-outline" as const },
    lunch: { color: colors.lunch, icon: "restaurant-outline" as const },
    dinner: { color: colors.dinner, icon: "moon-outline" as const },
    snack: { color: colors.snack, icon: "cafe-outline" as const },
  };
}

/**
 * Suggest meal type based on current time of day
 */
export function getSuggestedMealType(): MealType {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) return "breakfast";
  if (hour >= 11 && hour < 14) return "lunch";
  if (hour >= 18 && hour < 21) return "dinner";
  return "snack";
}

/**
 * Format timestamp to readable time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Capitalize first letter of meal type
 */
export function formatMealType(mealType: MealType): string {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}
