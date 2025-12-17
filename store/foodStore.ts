import { create } from "zustand";
import { FoodItem } from "../lib/models/food";

type MealType = FoodItem["mealType"];
import {
  getAllFoodItems,
  insertFoodItem,
  deleteFoodItem as dbDeleteFoodItem,
  updateFoodItem as dbUpdateFoodItem,
  clearAllFoodItems,
  getDailyGoals,
  updateDailyGoals as dbUpdateDailyGoals,
  DailyGoals,
} from "../lib/database";

interface FoodState {
  foodItems: FoodItem[];
  goals: DailyGoals;
  isLoading: boolean;

  // Computed values
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  // Actions
  loadFoodItems: () => Promise<void>;
  loadGoals: () => Promise<void>;
  addFoodItem: (item: Omit<FoodItem, "id" | "timestamp">) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  updateFoodItem: (item: FoodItem) => Promise<void>;
  clearTodaysFoodItems: () => Promise<void>;
  updateGoals: (goals: DailyGoals) => Promise<void>;

  // Selectors
  getFoodItemsByMeal: (mealType: MealType) => FoodItem[];
}

const calculateTotals = (items: FoodItem[]) => ({
  calories: items.reduce((sum, item) => sum + item.calories, 0),
  protein: items.reduce((sum, item) => sum + item.protein, 0),
  carbs: items.reduce((sum, item) => sum + item.carbs, 0),
  fat: items.reduce((sum, item) => sum + item.fat, 0),
});

export const useFoodStore = create<FoodState>((set, get) => ({
  foodItems: [],
  goals: { calorieGoal: 2000, proteinGoal: 120, carbsGoal: 250, fatGoal: 65 },
  isLoading: false,
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },

  loadFoodItems: async () => {
    set({ isLoading: true });
    try {
      const items = await getAllFoodItems();
      set({
        foodItems: items,
        totals: calculateTotals(items),
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load food items:", error);
      set({ isLoading: false });
    }
  },

  loadGoals: async () => {
    try {
      const goals = await getDailyGoals();
      set({ goals });
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
  },

  addFoodItem: async (item) => {
    const newItem: FoodItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    try {
      await insertFoodItem(newItem);
      const { foodItems } = get();
      const newItems = [...foodItems, newItem];
      set({
        foodItems: newItems,
        totals: calculateTotals(newItems),
      });
    } catch (error) {
      console.error("Failed to add food item:", error);
      throw error;
    }
  },

  deleteFoodItem: async (id) => {
    try {
      await dbDeleteFoodItem(id);
      const { foodItems } = get();
      const newItems = foodItems.filter((item) => item.id !== id);
      set({
        foodItems: newItems,
        totals: calculateTotals(newItems),
      });
    } catch (error) {
      console.error("Failed to delete food item:", error);
      throw error;
    }
  },

  updateFoodItem: async (item) => {
    try {
      await dbUpdateFoodItem(item);
      const { foodItems } = get();
      const newItems = foodItems.map((i) => (i.id === item.id ? item : i));
      set({
        foodItems: newItems,
        totals: calculateTotals(newItems),
      });
    } catch (error) {
      console.error("Failed to update food item:", error);
      throw error;
    }
  },

  clearTodaysFoodItems: async () => {
    try {
      await clearAllFoodItems();
      set({
        foodItems: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      });
    } catch (error) {
      console.error("Failed to clear food items:", error);
      throw error;
    }
  },

  updateGoals: async (goals) => {
    try {
      await dbUpdateDailyGoals(goals);
      set({ goals });
    } catch (error) {
      console.error("Failed to update goals:", error);
      throw error;
    }
  },

  getFoodItemsByMeal: (mealType) => {
    return get().foodItems.filter((item) => item.mealType === mealType);
  },
}));
