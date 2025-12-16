import * as SQLite from "expo-sqlite";
import { FoodItem } from "./models/food";

const DATABASE_NAME = "snacktrack.db";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  // Create food_items table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      calories INTEGER NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      mealType TEXT NOT NULL
    );
  `);

  // Create daily_goals table for storing user's goals
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_goals (
      id INTEGER PRIMARY KEY DEFAULT 1,
      calorieGoal INTEGER NOT NULL DEFAULT 2000,
      proteinGoal INTEGER NOT NULL DEFAULT 120,
      carbsGoal INTEGER NOT NULL DEFAULT 250,
      fatGoal INTEGER NOT NULL DEFAULT 65
    );
  `);

  // Insert default goals if not exists
  const goals = await database.getFirstAsync("SELECT * FROM daily_goals WHERE id = 1");
  if (!goals) {
    await database.runAsync(
      "INSERT INTO daily_goals (id, calorieGoal, proteinGoal, carbsGoal, fatGoal) VALUES (1, 2000, 120, 250, 65)"
    );
  }
}

// Food Items CRUD operations
export async function getAllFoodItems(): Promise<FoodItem[]> {
  const database = await getDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

  const result = await database.getAllAsync<FoodItem>(
    "SELECT * FROM food_items WHERE timestamp >= ? AND timestamp < ? ORDER BY timestamp ASC",
    [startOfDay, endOfDay]
  );
  return result;
}

export async function insertFoodItem(item: FoodItem): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO food_items (id, name, description, calories, protein, carbs, fat, timestamp, mealType) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [item.id, item.name, item.description, item.calories, item.protein, item.carbs, item.fat, item.timestamp, item.mealType]
  );
}

export async function deleteFoodItem(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM food_items WHERE id = ?", [id]);
}

export async function updateFoodItem(item: FoodItem): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE food_items SET name = ?, description = ?, calories = ?, protein = ?, carbs = ?, fat = ?, mealType = ? WHERE id = ?`,
    [item.name, item.description, item.calories, item.protein, item.carbs, item.fat, item.mealType, item.id]
  );
}

export async function clearAllFoodItems(): Promise<void> {
  const database = await getDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
  
  await database.runAsync(
    "DELETE FROM food_items WHERE timestamp >= ? AND timestamp < ?",
    [startOfDay, endOfDay]
  );
}

// Daily Goals operations
export interface DailyGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export async function getDailyGoals(): Promise<DailyGoals> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<DailyGoals>(
    "SELECT calorieGoal, proteinGoal, carbsGoal, fatGoal FROM daily_goals WHERE id = 1"
  );
  return result || { calorieGoal: 2000, proteinGoal: 120, carbsGoal: 250, fatGoal: 65 };
}

export async function updateDailyGoals(goals: DailyGoals): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE daily_goals SET calorieGoal = ?, proteinGoal = ?, carbsGoal = ?, fatGoal = ? WHERE id = 1",
    [goals.calorieGoal, goals.proteinGoal, goals.carbsGoal, goals.fatGoal]
  );
}
