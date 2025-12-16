import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { FoodItem, DailyStats, getMockDailyStats } from "./models/food";
import {
  getAllFoodItems,
  insertFoodItem,
  deleteFoodItem,
  updateFoodItem as updateFoodItemDb,
  clearAllFoodItems,
  getDailyGoals,
} from "./database";

interface FoodContextType {
  foodItems: FoodItem[];
  dailyStats: DailyStats;
  addFoodItem: (item: FoodItem) => Promise<void>;
  updateFoodItem: (item: FoodItem) => Promise<void>;
  removeFoodItem: (id: string) => Promise<void>;
  clearFoodItems: () => Promise<void>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>(getMockDailyStats());
  const [isLoading, setIsLoading] = useState(true);

  // Calculate daily stats from food items
  const calculateDailyStats = useCallback(
    (items: FoodItem[], goals: DailyStats): DailyStats => {
      const totals = items.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fat: acc.fat + item.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      return {
        ...goals,
        caloriesTotal: totals.calories,
        proteinTotal: Math.round(totals.protein),
        carbsTotal: Math.round(totals.carbs),
        fatTotal: Math.round(totals.fat),
      };
    },
    []
  );

  // Load data from database
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [items, goals] = await Promise.all([
        getAllFoodItems(),
        getDailyGoals(),
      ]);

      const baseStats = getMockDailyStats();
      const statsWithGoals: DailyStats = {
        ...baseStats,
        calorieGoal: goals.calorieGoal,
        proteinGoal: goals.proteinGoal,
        carbsGoal: goals.carbsGoal,
        fatGoal: goals.fatGoal,
      };

      setFoodItems(items);
      setDailyStats(calculateDailyStats(items, statsWithGoals));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateDailyStats]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const addFoodItem = useCallback(
    async (item: FoodItem) => {
      try {
        await insertFoodItem(item);
        setFoodItems((prev) => {
          const newItems = [...prev, item];
          setDailyStats((currentStats) =>
            calculateDailyStats(newItems, currentStats)
          );
          return newItems;
        });
      } catch (error) {
        console.error("Error adding food item:", error);
        throw error;
      }
    },
    [calculateDailyStats]
  );

  const updateFoodItem = useCallback(
    async (item: FoodItem) => {
      try {
        await updateFoodItemDb(item);
        setFoodItems((prev) => {
          const newItems = prev.map((i) => (i.id === item.id ? item : i));
          setDailyStats((currentStats) =>
            calculateDailyStats(newItems, currentStats)
          );
          return newItems;
        });
      } catch (error) {
        console.error("Error updating food item:", error);
        throw error;
      }
    },
    [calculateDailyStats]
  );

  const removeFoodItem = useCallback(
    async (id: string) => {
      try {
        await deleteFoodItem(id);
        setFoodItems((prev) => {
          const newItems = prev.filter((item) => item.id !== id);
          setDailyStats((currentStats) =>
            calculateDailyStats(newItems, currentStats)
          );
          return newItems;
        });
      } catch (error) {
        console.error("Error removing food item:", error);
        throw error;
      }
    },
    [calculateDailyStats]
  );

  const clearFoodItemsHandler = useCallback(async () => {
    try {
      await clearAllFoodItems();
      setFoodItems([]);
      setDailyStats((currentStats) => calculateDailyStats([], currentStats));
    } catch (error) {
      console.error("Error clearing food items:", error);
      throw error;
    }
  }, [calculateDailyStats]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return (
    <FoodContext.Provider
      value={{
        foodItems,
        dailyStats,
        addFoodItem,
        updateFoodItem,
        removeFoodItem,
        clearFoodItems: clearFoodItemsHandler,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFoodContext() {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error("useFoodContext must be used within a FoodProvider");
  }
  return context;
}
