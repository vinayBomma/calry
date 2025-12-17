import * as SQLite from "expo-sqlite";
import { FoodItem } from "./models/food";
import { UserProfile, getDefaultProfile } from "./models/userProfile";

const DATABASE_NAME = "snacktrack.db";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
      useNewConnection: true
    });
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

  // Create user_profile table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      gender TEXT NOT NULL DEFAULT 'male',
      age INTEGER NOT NULL DEFAULT 25,
      heightCm REAL NOT NULL DEFAULT 170,
      weightKg REAL NOT NULL DEFAULT 70,
      targetWeightKg REAL NOT NULL DEFAULT 70,
      heightUnit TEXT NOT NULL DEFAULT 'cm',
      weightUnit TEXT NOT NULL DEFAULT 'kg',
      activityLevel TEXT NOT NULL DEFAULT 'moderately_active',
      weightGoal TEXT NOT NULL DEFAULT 'maintain',
      goalAggressiveness TEXT NOT NULL DEFAULT 'moderate',
      eatingType TEXT NOT NULL DEFAULT 'normal',
      onboardingCompleted INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  // Insert default profile if not exists
  const profile = await database.getFirstAsync("SELECT * FROM user_profile WHERE id = 1");
  if (!profile) {
    const defaultProfile = getDefaultProfile();
    await database.runAsync(
      `INSERT INTO user_profile (id, gender, age, heightCm, weightKg, targetWeightKg, heightUnit, weightUnit, activityLevel, weightGoal, goalAggressiveness, eatingType, onboardingCompleted, createdAt, updatedAt) 
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        defaultProfile.gender,
        defaultProfile.age,
        defaultProfile.heightCm,
        defaultProfile.weightKg,
        defaultProfile.targetWeightKg,
        defaultProfile.heightUnit,
        defaultProfile.weightUnit,
        defaultProfile.activityLevel,
        defaultProfile.weightGoal,
        defaultProfile.goalAggressiveness,
        defaultProfile.eatingType,
        defaultProfile.createdAt,
        defaultProfile.updatedAt,
      ]
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

// User Profile operations
export async function getUserProfile(): Promise<UserProfile | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    id: number;
    gender: string;
    age: number;
    heightCm: number;
    weightKg: number;
    targetWeightKg: number;
    heightUnit: string;
    weightUnit: string;
    activityLevel: string;
    weightGoal: string;
    goalAggressiveness: string;
    eatingType: string;
    onboardingCompleted: number;
    createdAt: number;
    updatedAt: number;
  }>("SELECT * FROM user_profile WHERE id = 1");
  
  if (!result) return null;
  
  return {
    ...result,
    onboardingCompleted: result.onboardingCompleted === 1,
  } as UserProfile;
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
  const database = await getDatabase();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (profile.gender !== undefined) {
    updates.push("gender = ?");
    values.push(profile.gender);
  }
  if (profile.age !== undefined) {
    updates.push("age = ?");
    values.push(profile.age);
  }
  if (profile.heightCm !== undefined) {
    updates.push("heightCm = ?");
    values.push(profile.heightCm);
  }
  if (profile.weightKg !== undefined) {
    updates.push("weightKg = ?");
    values.push(profile.weightKg);
  }
  if (profile.targetWeightKg !== undefined) {
    updates.push("targetWeightKg = ?");
    values.push(profile.targetWeightKg);
  }
  if (profile.heightUnit !== undefined) {
    updates.push("heightUnit = ?");
    values.push(profile.heightUnit);
  }
  if (profile.weightUnit !== undefined) {
    updates.push("weightUnit = ?");
    values.push(profile.weightUnit);
  }
  if (profile.activityLevel !== undefined) {
    updates.push("activityLevel = ?");
    values.push(profile.activityLevel);
  }
  if (profile.weightGoal !== undefined) {
    updates.push("weightGoal = ?");
    values.push(profile.weightGoal);
  }
  if (profile.goalAggressiveness !== undefined) {
    updates.push("goalAggressiveness = ?");
    values.push(profile.goalAggressiveness);
  }
  if (profile.eatingType !== undefined) {
    updates.push("eatingType = ?");
    values.push(profile.eatingType);
  }
  if (profile.onboardingCompleted !== undefined) {
    updates.push("onboardingCompleted = ?");
    values.push(profile.onboardingCompleted ? 1 : 0);
  }

  updates.push("updatedAt = ?");
  values.push(Date.now());

  if (updates.length > 0) {
    await database.runAsync(
      `UPDATE user_profile SET ${updates.join(", ")} WHERE id = 1`,
      values
    );
  }
}

export async function isOnboardingCompleted(): Promise<boolean> {
  const profile = await getUserProfile();
  return profile?.onboardingCompleted ?? false;
}
