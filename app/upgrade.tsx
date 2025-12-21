import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PurchasesPackage } from "react-native-purchases";
import { useTheme } from "../lib/ThemeContext";
import { usePremiumStore } from "../store/premiumStore";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkPremiumStatus,
  PRODUCT_IDS,
} from "../lib/revenuecat";
import { spacing, typography, borderRadius, shadows } from "../lib/theme";

type PricingOption = "monthly" | "yearly" | "lifetime";

const PRICING = {
  monthly: { price: "$1.99", period: "/month", savings: null },
  yearly: { price: "$14.99", period: "/year", savings: "Save 37%" },
  lifetime: { price: "$6.99", period: "one-time", savings: "Best Value" },
};

const FEATURES = [
  {
    icon: "sparkles-outline",
    title: "Unlimited AI Analysis",
    subtitle: "No daily limits on meal tracking",
  },
  {
    icon: "cloud-upload-outline",
    title: "Backup & Restore",
    subtitle: "Keep your data safe across devices",
  },
  {
    icon: "star-outline",
    title: "Favourites",
    subtitle: "Save and reuse your frequent meals",
  },
  {
    icon: "stats-chart-outline",
    title: "Full Statistics",
    subtitle: "Detailed nutrition insights & trends",
  },
  {
    icon: "time-outline",
    title: "Complete History",
    subtitle: "Access your entire food log history",
  },
  {
    icon: "sunny-outline",
    title: "Priority Support",
    subtitle: "Get help when you need it",
  },
];

export default function UpgradeScreen() {
  const { colors } = useTheme();
  const { startTrial, setPremiumTier, isTrialActive, trialStartedAt } =
    usePremiumStore();
  const [selectedOption, setSelectedOption] =
    useState<PricingOption>("lifetime");
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<
    Record<string, PurchasesPackage | null>
  >({
    monthly: null,
    yearly: null,
    lifetime: null,
  });
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  const hasTriedBefore = trialStartedAt !== null;

  // Load RevenueCat offerings on mount
  useEffect(() => {
    async function loadOfferings() {
      try {
        const offerings = await getOfferings();
        if (offerings?.current) {
          const pkgs = offerings.current.availablePackages;
          setPackages({
            monthly:
              pkgs.find(
                (p) =>
                  p.identifier === "$rc_monthly" ||
                  p.product.identifier === PRODUCT_IDS.MONTHLY
              ) || null,
            yearly:
              pkgs.find(
                (p) =>
                  p.identifier === "$rc_annual" ||
                  p.product.identifier === PRODUCT_IDS.YEARLY
              ) || null,
            lifetime:
              pkgs.find(
                (p) =>
                  p.identifier === "$rc_lifetime" ||
                  p.product.identifier === PRODUCT_IDS.LIFETIME
              ) || null,
          });
        }
      } catch (error) {
        console.error("Error loading offerings:", error);
      } finally {
        setIsLoadingPackages(false);
      }
    }
    loadOfferings();
  }, []);

  // Update pricing from RevenueCat packages
  const getPricing = (option: PricingOption) => {
    const pkg = packages[option];
    if (pkg) {
      return {
        price: pkg.product.priceString,
        period:
          option === "lifetime"
            ? "one-time"
            : option === "yearly"
            ? "/year"
            : "/month",
        savings: PRICING[option].savings,
      };
    }
    return PRICING[option];
  };

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      await startTrial();
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    const pkg = packages[selectedOption];

    // If RevenueCat packages not loaded, use fallback (for testing)
    if (!pkg) {
      setIsLoading(true);
      try {
        // Fallback for development/testing
        const purchaseType =
          selectedOption === "lifetime" ? "one_time" : "subscription";
        const expiresAt =
          selectedOption === "monthly"
            ? Date.now() + 30 * 24 * 60 * 60 * 1000
            : selectedOption === "yearly"
            ? Date.now() + 365 * 24 * 60 * 60 * 1000
            : undefined;

        await setPremiumTier("premium", purchaseType, expiresAt);
        router.back();
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const result = await purchasePackage(pkg);

      if (result.success) {
        const purchaseType =
          selectedOption === "lifetime" ? "one_time" : "subscription";
        const expiresAt = result.customerInfo?.entitlements.active.premium
          ?.expirationDate
          ? new Date(
              result.customerInfo.entitlements.active.premium.expirationDate
            ).getTime()
          : undefined;

        await setPremiumTier("premium", purchaseType, expiresAt);
        router.back();
      } else if (result.error && result.error !== "cancelled") {
        Alert.alert("Purchase Failed", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const result = await restorePurchases();

      if (result.success) {
        await setPremiumTier("premium", "one_time");
        Alert.alert("Success", "Your purchase has been restored!");
        router.back();
      } else {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any previous purchases to restore."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="diamond" size={48} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Unlock Full Power</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited AI meal analysis and all premium features
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name={feature.icon as any}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingContainer}>
          <Text style={styles.pricingTitle}>Choose Your Plan</Text>

          {(Object.keys(PRICING) as PricingOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pricingOption,
                selectedOption === option && styles.pricingOptionSelected,
              ]}
              onPress={() => setSelectedOption(option)}
              activeOpacity={0.7}
            >
              <View style={styles.pricingRadio}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedOption === option && styles.radioOuterSelected,
                  ]}
                >
                  {selectedOption === option && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
              <View style={styles.pricingInfo}>
                <Text style={styles.pricingName}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
                <Text style={styles.pricingPrice}>
                  {getPricing(option).price}
                  <Text style={styles.pricingPeriod}>
                    {" "}
                    {getPricing(option).period}
                  </Text>
                </Text>
              </View>
              {getPricing(option).savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>
                    {getPricing(option).savings}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* BYOK Hint */}
        <TouchableOpacity
          style={styles.byokHint}
          onPress={() => {
            router.back();
            setTimeout(() => router.push("/(tabs)/settings"), 100);
          }}
        >
          <Ionicons name="key-outline" size={18} color={colors.textMuted} />
          <Text style={styles.byokText}>
            Developer? Use your own API key in Settings
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomContainer}>
        {!hasTriedBefore && (
          <TouchableOpacity
            style={styles.trialButton}
            onPress={handleStartTrial}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.trialButtonText}>Start 3-Day Free Trial</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.purchaseButtonText}>
              {hasTriedBefore ? "Upgrade Now" : "Subscribe"} •{" "}
              {getPricing(selectedOption).price}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} disabled={isLoading}>
          <Text style={styles.legalText}>
            Restore purchases • Cancel anytime
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    scrollContainer: {
      flex: 1,
    },
    heroSection: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    iconContainer: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primaryBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    heroTitle: {
      fontSize: typography.xxl,
      fontFamily: typography.fontBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    heroSubtitle: {
      fontSize: typography.base,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
      textAlign: "center",
    },
    featuresContainer: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primaryBg,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    featureText: {
      flex: 1,
    },
    featureTitle: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textPrimary,
    },
    featureSubtitle: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    pricingContainer: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    pricingTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    pricingOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: colors.border,
      ...shadows.sm,
    },
    pricingOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryBg,
    },
    pricingRadio: {
      marginRight: spacing.md,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioOuterSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    pricingInfo: {
      flex: 1,
    },
    pricingName: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textPrimary,
      textTransform: "capitalize",
    },
    pricingPrice: {
      fontSize: typography.lg,
      fontFamily: typography.fontBold,
      color: colors.primary,
    },
    pricingPeriod: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    savingsBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    savingsText: {
      fontSize: typography.xs,
      fontFamily: typography.fontSemibold,
      color: colors.textInverse,
    },
    byokHint: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      gap: spacing.xs,
    },
    byokText: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    bottomContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    trialButton: {
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    trialButtonText: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.primary,
    },
    purchaseButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: "center",
    },
    purchaseButtonText: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textInverse,
    },
    legalText: {
      fontSize: typography.xs,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.sm,
    },
  });
