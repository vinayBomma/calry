import { create } from "zustand";
import { FoodItem, DailyStats } from "../lib/models/food";

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
  getFavouriteMeals,
  addFavouriteMeal as dbAddFavouriteMeal,
  deleteFavouriteMeal as dbDeleteFavouriteMeal,
  FavouriteMeal,
} from "../lib/database";

interface FoodState {
  foodItems: FoodItem[];
  favourites: FavouriteMeal[];
  goals: DailyGoals;
  isLoading: boolean;
  selectedDate: string;

  // Computed values
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  // Actions
  loadData: () => Promise<void>;
  loadFoodItems: () => Promise<void>;
  loadGoals: () => Promise<void>;
  loadFavourites: () => Promise<void>;
  setSelectedDate: (date: string) => Promise<void>;
  addFoodItem: (item: Omit<FoodItem, "id" | "timestamp"> | FoodItem) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  updateFoodItem: (item: FoodItem) => Promise<void>;
  clearTodaysFoodItems: () => Promise<void>;
  updateGoals: (goals: DailyGoals) => Promise<void>;
  addFavourite: (meal: FavouriteMeal) => Promise<void>;
  deleteFavourite: (id: string) => Promise<void>;

  // Selectors
  getFoodItemsByMeal: (mealType: MealType) => FoodItem[];
  getDailyStats: () => DailyStats;
}

const calculateTotals = (items: FoodItem[]) => ({
  calories: items.reduce((sum, item) => sum + item.calories, 0),
  protein: items.reduce((sum, item) => sum + item.protein, 0),
  carbs: items.reduce((sum, item) => sum + item.carbs, 0),
  fat: items.reduce((sum, item) => sum + item.fat, 0),
});

export const useFoodStore = create<FoodState>((set, get) => ({
  foodItems: [],
  favourites: [],
  goals: { calorieGoal: 2000, proteinGoal: 120, carbsGoal: 250, fatGoal: 65 },
  isLoading: false,
  selectedDate: new Date().toISOString().split('T')[0], // Default to today YYYY-MM-DD
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },

  loadData: async () => {
    set({ isLoading: true });
    try {
      const { selectedDate } = get();
      const [items, goals, favourites] = await Promise.all([
        getAllFoodItems(selectedDate),
        getDailyGoals(),
        getFavouriteMeals(),
      ]);
      set({
        foodItems: items,
        goals,
        favourites,
        totals: calculateTotals(items),
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
      set({ isLoading: false });
    }
  },

  loadFoodItems: async () => {
    set({ isLoading: true });
    try {
      const { selectedDate } = get();
      const items = await getAllFoodItems(selectedDate);
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

  setSelectedDate: async (date: string) => {
    set({ selectedDate: date });
    await get().loadFoodItems();
  },

  loadGoals: async () => {
    try {
      const goals = await getDailyGoals();
      set({ goals });
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
  },

  loadFavourites: async () => {
    try {
      const favourites = await getFavouriteMeals();
      set({ favourites });
    } catch (error) {
      console.error("Failed to load favourites:", error);
    }
  },

  addFoodItem: async (item) => {
    // Support both full FoodItem and partial item without id/timestamp
    const newItem: FoodItem = 'id' in item && 'timestamp' in item
      ? item as FoodItem
      : {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      } as FoodItem;

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

  addFavourite: async (meal) => {
    try {
      await dbAddFavouriteMeal(meal);
      const { favourites } = get();
      set({ favourites: [...favourites, meal].sort((a, b) => a.name.localeCompare(b.name)) });
    } catch (error) {
      console.error("Failed to add favourite:", error);
      throw error;
    }
  },

  deleteFavourite: async (id) => {
    try {
      await dbDeleteFavouriteMeal(id);
      const { favourites } = get();
      set({ favourites: favourites.filter((f) => f.id !== id) });
    } catch (error) {
      console.error("Failed to delete favourite:", error);
      throw error;
    }
  },

  getFoodItemsByMeal: (mealType) => {
    return get().foodItems.filter((item) => item.mealType === mealType);
  },

  getDailyStats: () => {
    const { totals, goals } = get();
    const today = new Date().toISOString().split("T")[0];

    return {
      date: today,
      caloriesTotal: totals.calories,
      proteinTotal: Math.round(totals.protein),
      carbsTotal: Math.round(totals.carbs),
      fatTotal: Math.round(totals.fat),
      calorieGoal: goals.calorieGoal,
      proteinGoal: goals.proteinGoal,
      carbsGoal: goals.carbsGoal,
      fatGoal: goals.fatGoal,
    };
  },
}));
