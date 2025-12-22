import { create } from "zustand";
import AsyncStorage from "expo-sqlite/kv-store";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";
import { getDatabase } from "../lib/database";
import { validateGeminiApiKey, initializeGemini } from "../lib/gemini";

// Get default Gemini API Key from environment variables
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || "";

// Constants
const FREE_AI_MEALS_PER_DAY = 3;
const TRIAL_DAYS = 3;

export type PremiumTier = "free" | "premium" | "byok";
export type PurchaseType = "one_time" | "subscription";

interface PremiumState {
  // Subscription state
  tier: PremiumTier;
  purchaseType: PurchaseType | null;
  expiresAt: number | null; // null for one_time or free
  trialStartedAt: number | null;
  isTrialActive: boolean;

  // BYOK state
  customApiKey: string | null;

  // Usage tracking
  aiMealsUsedToday: number;
  usageDate: string; // YYYY-MM-DD format

  // Actions
  loadPremiumState: () => Promise<void>;
  setPremiumTier: (tier: PremiumTier, purchaseType?: PurchaseType, expiresAt?: number) => Promise<void>;
  setCustomApiKey: (key: string | null) => Promise<void>;
  incrementAIUsage: () => Promise<boolean>; // Returns true if allowed, false if limit reached
  resetDailyUsage: () => Promise<void>;
  startTrial: () => Promise<void>;
  checkTrialStatus: () => boolean;

  // Computed selectors
  isPremium: () => boolean;
  canUseAI: () => boolean;
  getRemainingAIMeals: () => number;
  getEffectiveApiKey: () => string | null;
}

const STORAGE_KEYS = {
  TIER: "snacktrack_premium_tier",
  PURCHASE_TYPE: "snacktrack_purchase_type",
  EXPIRES_AT: "snacktrack_expires_at",
  TRIAL_STARTED: "snacktrack_trial_started",
  CUSTOM_API_KEY: "snacktrack_custom_api_key",
};

const getTodayString = () => new Date().toISOString().split("T")[0];

export const usePremiumStore = create<PremiumState>((set, get) => ({
  tier: "free",
  purchaseType: null,
  expiresAt: null,
  trialStartedAt: null,
  isTrialActive: false,
  customApiKey: null,
  aiMealsUsedToday: 0,
  usageDate: getTodayString(),

  loadPremiumState: async () => {
    try {
      // Load from AsyncStorage
      const [tier, purchaseType, expiresAt, trialStarted, customApiKey] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TIER),
        AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.EXPIRES_AT),
        AsyncStorage.getItem(STORAGE_KEYS.TRIAL_STARTED),
        AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_API_KEY),
      ]);

      // Load usage from database
      const db = await getDatabase();
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ai_usage (
          id INTEGER PRIMARY KEY DEFAULT 1,
          count INTEGER NOT NULL DEFAULT 0,
          date TEXT NOT NULL
        );
      `);

      const today = getTodayString();
      const usage = await db.getFirstAsync<{ count: number; date: string }>(
        "SELECT count, date FROM ai_usage WHERE id = 1"
      );

      let aiMealsUsedToday = 0;
      if (usage) {
        if (usage.date === today) {
          aiMealsUsedToday = usage.count;
        } else {
          // Reset for new day
          await db.runAsync(
            "UPDATE ai_usage SET count = 0, date = ? WHERE id = 1",
            [today]
          );
        }
      } else {
        await db.runAsync(
          "INSERT INTO ai_usage (id, count, date) VALUES (1, 0, ?)",
          [today]
        );
      }

      // Check trial status
      const trialStartedAt = trialStarted ? parseInt(trialStarted) : null;
      const isTrialActive = trialStartedAt
        ? Date.now() - trialStartedAt < TRIAL_DAYS * 24 * 60 * 60 * 1000
        : false;

      // Check subscription expiry
      let effectiveTier = (tier as PremiumTier) || "free";
      const parsedExpiresAt = expiresAt ? parseInt(expiresAt) : null;
      
      if (effectiveTier === "premium" && purchaseType === "subscription" && parsedExpiresAt) {
        if (Date.now() > parsedExpiresAt) {
          effectiveTier = "free";
          await AsyncStorage.setItem(STORAGE_KEYS.TIER, "free");
        }
      }

      set({
        tier: effectiveTier,
        purchaseType: purchaseType as PurchaseType | null,
        expiresAt: parsedExpiresAt,
        trialStartedAt,
        isTrialActive,
        customApiKey,
        aiMealsUsedToday,
        usageDate: today,
      });

      // Initialize Gemini with custom API key if present
      if (customApiKey) {
        initializeGemini(customApiKey);
      }
    } catch (error) {
      console.error("Error loading premium state:", error);
    }
  },

  setPremiumTier: async (tier, purchaseType, expiresAt) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TIER, tier);
      if (purchaseType) {
        await AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_TYPE, purchaseType);
      }
      if (expiresAt) {
        await AsyncStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
      }

      set({
        tier,
        purchaseType: purchaseType || null,
        expiresAt: expiresAt || null,
      });
    } catch (error) {
      console.error("Error setting premium tier:", error);
    }
  },

  setCustomApiKey: async (key) => {
    try {
      if (key) {
        // Validate the API key before storing
        const isValid = await validateGeminiApiKey(key);
        if (!isValid) {
          throw new Error("Invalid Gemini API key");
        }
        
        // Initialize Gemini with the custom key
        initializeGemini(key);
        
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_API_KEY, key);
        await AsyncStorage.setItem(STORAGE_KEYS.TIER, "byok");
        set({ customApiKey: key, tier: "byok" });
      } else {
        // When removing custom key, revert to free plan
        await AsyncStorage.removeItem(STORAGE_KEYS.CUSTOM_API_KEY);
        // Initialize Gemini with default key if available (for remaining AI meals)
        if (GEMINI_API_KEY) {
          initializeGemini(GEMINI_API_KEY);
        }
        await AsyncStorage.setItem(STORAGE_KEYS.TIER, "free");
        set({ customApiKey: null, tier: "free" });
      }
    } catch (error) {
      console.error("Error setting custom API key:", error);
      throw error; // Re-throw so caller can handle
    }
  },

  incrementAIUsage: async () => {
    const { tier, isTrialActive, aiMealsUsedToday, usageDate, customApiKey } = get();
    const today = getTodayString();

    // Premium users, trial users, and BYOK users have unlimited access
    if (tier === "premium" || tier === "byok" || isTrialActive || customApiKey) {
      return true;
    }

    // Reset count if new day
    let currentUsage = aiMealsUsedToday;
    if (usageDate !== today) {
      currentUsage = 0;
      set({ usageDate: today, aiMealsUsedToday: 0 });
    }

    // Check if limit reached
    if (currentUsage >= FREE_AI_MEALS_PER_DAY) {
      return false;
    }

    // Increment usage
    try {
      const db = await getDatabase();
      const newCount = currentUsage + 1;
      await db.runAsync(
        "UPDATE ai_usage SET count = ?, date = ? WHERE id = 1",
        [newCount, today]
      );
      set({ aiMealsUsedToday: newCount, usageDate: today });
      return true;
    } catch (error) {
      console.error("Error incrementing AI usage:", error);
      return false;
    }
  },

  resetDailyUsage: async () => {
    try {
      const today = getTodayString();
      const db = await getDatabase();
      await db.runAsync(
        "UPDATE ai_usage SET count = 0, date = ? WHERE id = 1",
        [today]
      );
      set({ aiMealsUsedToday: 0, usageDate: today });
    } catch (error) {
      console.error("Error resetting daily usage:", error);
    }
  },

  startTrial: async () => {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.TRIAL_STARTED, now.toString());
      set({ trialStartedAt: now, isTrialActive: true });
    } catch (error) {
      console.error("Error starting trial:", error);
    }
  },

  checkTrialStatus: () => {
    const { trialStartedAt } = get();
    if (!trialStartedAt) return false;
    return Date.now() - trialStartedAt < TRIAL_DAYS * 24 * 60 * 60 * 1000;
  },

  // Selectors
  isPremium: () => {
    const { tier, isTrialActive } = get();
    // Only true premium tier and active trial get all features
    // BYOK mode only gets unlimited AI, not other premium features
    return tier === "premium" || isTrialActive;
  },

  canUseAI: () => {
    const { tier, isTrialActive, aiMealsUsedToday, customApiKey } = get();
    if (tier === "premium" || tier === "byok" || isTrialActive || customApiKey) {
      return true;
    }
    return aiMealsUsedToday < FREE_AI_MEALS_PER_DAY;
  },

  getRemainingAIMeals: () => {
    const { tier, isTrialActive, aiMealsUsedToday, customApiKey } = get();
    if (tier === "premium" || tier === "byok" || isTrialActive || customApiKey) {
      return Infinity;
    }
    return Math.max(0, FREE_AI_MEALS_PER_DAY - aiMealsUsedToday);
  },

  getEffectiveApiKey: () => {
    const { customApiKey } = get();
    return customApiKey;
  },
}));

// Feature access helpers
export const PREMIUM_FEATURES = {
  UNLIMITED_AI: "unlimited_ai",
  BACKUP: "backup",
  RESTORE: "restore",
  FAVOURITES: "favourites",
  FULL_STATS: "full_stats",
  FULL_HISTORY: "full_history",
} as const;

export type PremiumFeature = (typeof PREMIUM_FEATURES)[keyof typeof PREMIUM_FEATURES];

export const canAccessFeature = (feature: PremiumFeature): boolean => {
  const state = usePremiumStore.getState();
  const isPremium = state.isPremium();
  const { tier } = state;

  switch (feature) {
    case PREMIUM_FEATURES.UNLIMITED_AI:
      // BYOK and Premium both allow unlimited AI
      return isPremium || tier === "byok";
    case PREMIUM_FEATURES.BACKUP:
    case PREMIUM_FEATURES.RESTORE:
    case PREMIUM_FEATURES.FAVOURITES:
    case PREMIUM_FEATURES.FULL_STATS:
    case PREMIUM_FEATURES.FULL_HISTORY:
      // Only true Premium tier (not BYOK) gets these features
      return isPremium;
    default:
      return false;
  }
};
