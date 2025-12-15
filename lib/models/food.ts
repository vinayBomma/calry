export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number; // When the food was logged
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  caloriesTotal: number;
  proteinTotal: number;
  carbsTotal: number;
  fatTotal: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

// Mock data for the initial screen
export const getMockDailyStats = (): DailyStats => {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    date: today,
    caloriesTotal: 1250,
    proteinTotal: 65,
    carbsTotal: 120,
    fatTotal: 45,
    calorieGoal: 2000,
    proteinGoal: 120,
    carbsGoal: 200,
    fatGoal: 65,
  };
};

export const getMockFoodItems = (): FoodItem[] => {
  return [
    {
      id: '1',
      name: 'Oatmeal with Berries',
      calories: 320,
      protein: 12,
      carbs: 58,
      fat: 6,
      timestamp: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
      mealType: 'breakfast',
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      calories: 430,
      protein: 38,
      carbs: 12,
      fat: 24,
      timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
      mealType: 'lunch',
    },
    {
      id: '3',
      name: 'Protein Bar',
      calories: 220,
      protein: 15,
      carbs: 22,
      fat: 9,
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      mealType: 'snack',
    },
  ];
};