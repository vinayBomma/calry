import { create } from "zustand";
import {
  UserProfile,
  Gender,
  ActivityLevel,
  WeightGoal,
  GoalAggressiveness,
  EatingType,
  HeightUnit,
  WeightUnit,
  getDefaultProfile,
  calculateNutritionGoals,
} from "../lib/models/userProfile";
import {
  getUserProfile,
  updateUserProfile as dbUpdateUserProfile,
  isOnboardingCompleted as dbIsOnboardingCompleted,
} from "../lib/database";
import { useFoodStore } from "./foodStore";

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;

  // Computed
  getNutritionGoals: () => {
    bmr: number;
    tdee: number;
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  } | null;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isOnboardingComplete: false,

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await getUserProfile();
      set({
        profile,
        isOnboardingComplete: profile?.onboardingCompleted ?? false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return;

    try {
      await dbUpdateUserProfile(updates);
      set({
        profile: { ...profile, ...updates, updatedAt: Date.now() },
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  },

  completeOnboarding: async () => {
    const { profile, updateProfile } = get();
    if (!profile) return;

    try {
      // Update profile to mark onboarding as completed
      await updateProfile({ onboardingCompleted: true });

      // Force reload goals in food store from database
      await useFoodStore.getState().loadGoals();

      set({ isOnboardingComplete: true });
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw error;
    }
  },

  checkOnboardingStatus: async () => {
    try {
      const completed = await dbIsOnboardingCompleted();
      set({ isOnboardingComplete: completed });
      return completed;
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      return false;
    }
  },

  getNutritionGoals: () => {
    const { profile } = get();
    if (!profile) return null;
    return calculateNutritionGoals(profile);
  },
}));
