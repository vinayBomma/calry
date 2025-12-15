import React, { createContext, useContext, useState, useCallback } from "react";
import {
  FoodItem,
  DailyStats,
  getMockFoodItems,
  getMockDailyStats,
} from "./models/food";

interface FoodContextType {
  foodItems: FoodItem[];
  dailyStats: DailyStats;
  addFoodItem: (item: FoodItem) => void;
  removeFoodItem: (id: string) => void;
  clearFoodItems: () => void;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() =>
    getMockFoodItems()
  );

  // Calculate daily stats from food items
  const calculateDailyStats = useCallback((items: FoodItem[]): DailyStats => {
    const baseStats = getMockDailyStats();

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
      ...baseStats,
      caloriesTotal: totals.calories,
      proteinTotal: totals.protein,
      carbsTotal: totals.carbs,
      fatTotal: totals.fat,
    };
  }, []);

  const [dailyStats, setDailyStats] = useState<DailyStats>(() =>
    calculateDailyStats(getMockFoodItems())
  );

  const addFoodItem = useCallback(
    (item: FoodItem) => {
      setFoodItems((prev) => {
        const newItems = [...prev, item];
        setDailyStats(calculateDailyStats(newItems));
        return newItems;
      });
    },
    [calculateDailyStats]
  );

  const removeFoodItem = useCallback(
    (id: string) => {
      setFoodItems((prev) => {
        const newItems = prev.filter((item) => item.id !== id);
        setDailyStats(calculateDailyStats(newItems));
        return newItems;
      });
    },
    [calculateDailyStats]
  );

  const clearFoodItems = useCallback(() => {
    setFoodItems([]);
    setDailyStats(calculateDailyStats([]));
  }, [calculateDailyStats]);

  return (
    <FoodContext.Provider
      value={{
        foodItems,
        dailyStats,
        addFoodItem,
        removeFoodItem,
        clearFoodItems,
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
