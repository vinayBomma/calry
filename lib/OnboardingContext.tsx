import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Gender,
  ActivityLevel,
  WeightGoal,
  GoalAggressiveness,
  EatingType,
  HeightUnit,
  WeightUnit,
} from "./models/userProfile";

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

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;
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

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetData = useCallback(() => {
    setData(defaultData);
  }, []);

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
