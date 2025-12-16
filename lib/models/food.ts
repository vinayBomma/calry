export interface FoodItem {
  id: string;
  name: string;
  description: string; // Original user input
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
    caloriesTotal: 0, // Will be calculated from food items
    proteinTotal: 0,
    carbsTotal: 0,
    fatTotal: 0,
    calorieGoal: 2000,
    proteinGoal: 120,
    carbsGoal: 250,
    fatGoal: 65,
  };
};

export const getMockFoodItems = (): FoodItem[] => {
  const now = new Date();
  const today7am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30).getTime();
  const today12pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 15).getTime();
  const today3pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).getTime();
  const today7pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 30).getTime();
  const today9pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0).getTime();

  return [
    {
      id: '1',
      name: 'Oatmeal with Berries & Honey',
      description: 'Oatmeal with berries and honey',
      calories: 320,
      protein: 12,
      carbs: 58,
      fat: 6,
      timestamp: today7am,
      mealType: 'breakfast',
    },
    {
      id: '2',
      name: 'Grilled Chicken Caesar Salad',
      description: 'Grilled chicken caesar salad',
      calories: 430,
      protein: 38,
      carbs: 12,
      fat: 24,
      timestamp: today12pm,
      mealType: 'lunch',
    },
    {
      id: '3',
      name: 'Greek Yogurt with Almonds',
      description: 'Greek yogurt with almonds',
      calories: 180,
      protein: 15,
      carbs: 12,
      fat: 8,
      timestamp: today3pm,
      mealType: 'snack',
    },
    {
      id: '4',
      name: 'Salmon with Roasted Vegetables',
      description: 'Salmon with roasted vegetables',
      calories: 520,
      protein: 42,
      carbs: 18,
      fat: 28,
      timestamp: today7pm,
      mealType: 'dinner',
    },
    {
      id: '5',
      name: 'Dark Chocolate & Mixed Nuts',
      description: 'Dark chocolate and mixed nuts',
      calories: 150,
      protein: 4,
      carbs: 10,
      fat: 11,
      timestamp: today9pm,
      mealType: 'snack',
    },
  ];
};