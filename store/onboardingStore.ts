import { create } from "zustand";
import {
  Gender,
  ActivityLevel,
  WeightGoal,
  GoalAggressiveness,
  EatingType,
  HeightUnit,
  WeightUnit,
  feetInchesToCm,
  lbsToKg,
} from "../lib/models/userProfile";

interface OnboardingData {
  gender: Gender;
  age: number;
  heightCm: number;
  heightFeet: number;
  heightInches: number;
  heightUnit: HeightUnit;
  weightKg: number;
  weightLbs: number;
  weightUnit: WeightUnit;
  targetWeightKg: number;
  targetWeightLbs: number;
  activityLevel: ActivityLevel;
  weightGoal: WeightGoal;
  goalAggressiveness: GoalAggressiveness;
  eatingType: EatingType;
}

interface OnboardingState extends OnboardingData {
  // Actions
  updateData: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;

  // Computed values for saving to profile
  getFinalHeight: () => number;
  getFinalWeight: () => number;
  getFinalTargetWeight: () => number;
}

const defaultData: OnboardingData = {
  gender: "male",
  age: 25,
  heightCm: 170,
  heightFeet: 5,
  heightInches: 7,
  heightUnit: "cm",
  weightKg: 70,
  weightLbs: 154,
  weightUnit: "kg",
  targetWeightKg: 70,
  targetWeightLbs: 154,
  activityLevel: "moderately_active",
  weightGoal: "maintain",
  goalAggressiveness: "moderate",
  eatingType: "normal",
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...defaultData,

  updateData: (updates) => set((state) => ({ ...state, ...updates })),

  resetData: () => set(defaultData),

  getFinalHeight: () => {
    const state = get();
    if (state.heightUnit === "ft") {
      return feetInchesToCm(state.heightFeet, state.heightInches);
    }
    return state.heightCm;
  },

  getFinalWeight: () => {
    const state = get();
    if (state.weightUnit === "lbs") {
      return lbsToKg(state.weightLbs);
    }
    return state.weightKg;
  },

  getFinalTargetWeight: () => {
    const state = get();
    if (state.weightUnit === "lbs") {
      return lbsToKg(state.targetWeightLbs);
    }
    return state.targetWeightKg;
  },
}));
