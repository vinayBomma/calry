import Purchases, { 
  PurchasesPackage, 
  CustomerInfo,
  PurchasesOfferings,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

// RevenueCat API Keys - Set these in your environment
const REVENUECAT_IOS_KEY = Constants.expoConfig?.extra?.revenueCatIosKey || "";
const REVENUECAT_ANDROID_KEY = Constants.expoConfig?.extra?.revenueCatAndroidKey || "";

// Product identifiers - must match RevenueCat dashboard
export const PRODUCT_IDS = {
  MONTHLY: "snacktrack_premium_monthly",
  LIFETIME: "snacktrack_premium_lifetime",
} as const;

// Entitlement identifier
export const ENTITLEMENT_ID = "snacktrack";

let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Call this once at app startup
 */
export async function initializeRevenueCat(): Promise<void> {
  if (isInitialized) return;

  const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ RevenueCat API key not configured. In-app purchases will not work.");
    return;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey });
    isInitialized = true;
    console.log("✓ RevenueCat initialized");
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
  }
}

/**
 * Get available offerings (products)
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!isInitialized) {
    console.warn("RevenueCat not initialized");
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error("Failed to get offerings:", error);
    return null;
  }
}

/**
 * Get the current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isInitialized) {
    console.warn("RevenueCat not initialized");
    return null;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("Failed to get customer info:", error);
    return null;
  }
}

/**
 * Check if user has premium entitlement
 */
export async function checkPremiumStatus(): Promise<boolean> {
  const customerInfo = await getCustomerInfo();
  if (!customerInfo) return false;

  return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (!isInitialized) {
    return { success: false, error: "RevenueCat not initialized" };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    
    return { 
      success: isPremium, 
      customerInfo,
      error: isPremium ? undefined : "Purchase completed but entitlement not found"
    };
  } catch (error: any) {
    // User cancelled - not an error
    if (error.userCancelled) {
      return { success: false, error: "cancelled" };
    }
    console.error("Purchase failed:", error);
    return { success: false, error: error.message || "Purchase failed" };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (!isInitialized) {
    return { success: false, error: "RevenueCat not initialized" };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    
    return { 
      success: isPremium, 
      customerInfo,
      error: isPremium ? undefined : "No previous purchases found"
    };
  } catch (error: any) {
    console.error("Restore failed:", error);
    return { success: false, error: error.message || "Restore failed" };
  }
}

/**
 * Get subscription management URL
 */
export async function getManagementURL(): Promise<string | null> {
  const customerInfo = await getCustomerInfo();
  return customerInfo?.managementURL || null;
}

/**
 * Listen for customer info changes
 */
export function addCustomerInfoUpdateListener(
  listener: (customerInfo: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(listener);
  // RevenueCat SDK doesn't return a subscription object with remove method
  // Return a no-op cleanup function
  return () => {};
}
