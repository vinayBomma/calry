export type Gender = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";
export type WeightGoal = "lose" | "maintain" | "gain";
export type GoalAggressiveness = "slow" | "moderate" | "fast";
export type EatingType = "light" | "normal" | "heavy";
export type HeightUnit = "cm" | "ft";
export type WeightUnit = "kg" | "lbs";

export interface UserProfile {
  id: number;
  gender: Gender;
  age: number;
  heightCm: number; // Always stored in cm
  weightKg: number; // Always stored in kg
  targetWeightKg: number; // Always stored in kg
  heightUnit: HeightUnit; // User's preferred unit
  weightUnit: WeightUnit; // User's preferred unit
  activityLevel: ActivityLevel;
  weightGoal: WeightGoal;
  goalAggressiveness: GoalAggressiveness;
  eatingType: EatingType;
  onboardingCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
  extremely_active: "Extremely Active",
};

export const activityLevelDescriptions: Record<ActivityLevel, string> = {
  sedentary: "Little or no exercise, desk job",
  lightly_active: "Light exercise 1-3 days/week",
  moderately_active: "Moderate exercise 3-5 days/week",
  very_active: "Hard exercise 6-7 days/week",
  extremely_active: "Very hard exercise, physical job",
};

export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

export const weightGoalLabels: Record<WeightGoal, string> = {
  lose: "Lose Weight",
  maintain: "Maintain Weight",
  gain: "Gain Weight",
};

export const goalAggressivenessLabels: Record<GoalAggressiveness, string> = {
  slow: "Slow & Steady",
  moderate: "Moderate",
  fast: "Aggressive",
};

export const goalAggressivenessDescriptions: Record<GoalAggressiveness, string> = {
  slow: "~0.25 kg/week",
  moderate: "~0.5 kg/week",
  fast: "~1 kg/week",
};

// Calorie adjustment per day based on aggressiveness
export const calorieAdjustments: Record<GoalAggressiveness, number> = {
  slow: 250, // ~0.25 kg/week
  moderate: 500, // ~0.5 kg/week
  fast: 1000, // ~1 kg/week
};

export const eatingTypeLabels: Record<EatingType, string> = {
  light: "Light Eater",
  normal: "Normal Eater",
  heavy: "Heavy Eater",
};

export const eatingTypeDescriptions: Record<EatingType, string> = {
  light: "I often feel full quickly and eat smaller portions",
  normal: "I eat average-sized meals and portions",
  heavy: "I have a big appetite and tend to eat larger portions",
};

// Protein multiplier per kg of body weight based on eating type and goal
export const getProteinMultiplier = (
  eatingType: EatingType,
  goal: WeightGoal
): number => {
  const baseMultipliers: Record<EatingType, number> = {
    light: 1.4,
    normal: 1.6,
    heavy: 1.8,
  };

  let multiplier = baseMultipliers[eatingType];

  // Increase protein for muscle preservation when losing weight
  if (goal === "lose") {
    multiplier += 0.2;
  }
  // Increase protein for muscle building when gaining
  if (goal === "gain") {
    multiplier += 0.4;
  }

  return multiplier;
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export const calculateBMR = (
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number => {
  // Base calculation (same for male/other)
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === "female") {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  return Math.round(bmr);
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

/**
 * Calculate daily calorie goal based on TDEE and weight goal
 */
export const calculateCalorieGoal = (
  tdee: number,
  weightGoal: WeightGoal,
  aggressiveness: GoalAggressiveness
): number => {
  if (weightGoal === "maintain") {
    return tdee;
  }

  const adjustment = calorieAdjustments[aggressiveness];

  if (weightGoal === "lose") {
    // Minimum 1200 calories for safety
    return Math.max(1200, tdee - adjustment);
  }

  // Gain weight
  return tdee + adjustment;
};

/**
 * Calculate all nutrition goals based on user profile
 */
export const calculateNutritionGoals = (profile: UserProfile) => {
  const bmr = calculateBMR(
    profile.gender,
    profile.weightKg,
    profile.heightCm,
    profile.age
  );

  const tdee = calculateTDEE(bmr, profile.activityLevel);

  const calorieGoal = calculateCalorieGoal(
    tdee,
    profile.weightGoal,
    profile.goalAggressiveness
  );

  // Protein: based on eating type and goal
  const proteinMultiplier = getProteinMultiplier(
    profile.eatingType,
    profile.weightGoal
  );
  const proteinGoal = Math.round(profile.weightKg * proteinMultiplier);

  // Fat: 25-30% of calories (using 27.5% as middle ground)
  // 1g fat = 9 calories
  const fatGoal = Math.round((calorieGoal * 0.275) / 9);

  // Carbs: remaining calories
  // 1g carbs = 4 calories, 1g protein = 4 calories
  const carbsGoal = Math.round(
    (calorieGoal - proteinGoal * 4 - fatGoal * 9) / 4
  );

  return {
    bmr,
    tdee,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
  };
};

// Unit conversion helpers
export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const feetInchesToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};

export const kgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462 * 10) / 10;
};

export const lbsToKg = (lbs: number): number => {
  return Math.round((lbs / 2.20462) * 10) / 10;
};

export const getDefaultProfile = (): Omit<UserProfile, "id"> => ({
  gender: "male",
  age: 25,
  heightCm: 170,
  weightKg: 70,
  targetWeightKg: 70,
  heightUnit: "cm",
  weightUnit: "kg",
  activityLevel: "moderately_active",
  weightGoal: "maintain",
  goalAggressiveness: "moderate",
  eatingType: "normal",
  onboardingCompleted: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
