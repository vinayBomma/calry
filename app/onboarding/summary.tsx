import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "../../lib/OnboardingContext";
import {
  calculateNutritionGoals,
  activityLevelLabels,
  weightGoalLabels,
  goalAggressivenessLabels,
  eatingTypeLabels,
  UserProfile,
  kgToLbs,
  cmToFeetInches,
} from "../../lib/models/userProfile";
import { updateUserProfile, updateDailyGoals } from "../../lib/database";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../lib/theme";

export default function SummaryScreen() {
  const { data } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // Build profile for calculation
  const profile: UserProfile = {
    id: 1,
    gender: data.gender,
    age: data.age,
    heightCm: data.heightCm,
    weightKg: data.weightKg,
    targetWeightKg: data.targetWeightKg,
    heightUnit: data.heightUnit,
    weightUnit: data.weightUnit,
    activityLevel: data.activityLevel,
    weightGoal: data.weightGoal,
    goalAggressiveness: data.goalAggressiveness,
    eatingType: data.eatingType,
    onboardingCompleted: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const goals = calculateNutritionGoals(profile);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save profile to database
      await updateUserProfile(profile);

      // Save calculated goals to daily_goals table
      await updateDailyGoals({
        calorieGoal: goals.calorieGoal,
        proteinGoal: goals.proteinGoal,
        carbsGoal: goals.carbsGoal,
        fatGoal: goals.fatGoal,
      });

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format display values
  const displayHeight =
    data.heightUnit === "cm"
      ? `${data.heightCm} cm`
      : `${data.heightFeet}'${data.heightInches}"`;

  const displayWeight =
    data.weightUnit === "kg" ? `${data.weightKg} kg` : `${data.weightLbs} lbs`;

  const displayTargetWeight =
    data.weightUnit === "kg"
      ? `${data.targetWeightKg} kg`
      : `${data.targetWeightLbs} lbs`;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
          <Text style={styles.progressText}>Step 6 of 6</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Your personalized plan</Text>
        <Text style={styles.subtitle}>
          Here's what we've calculated based on your profile
        </Text>

        {/* Nutrition Goals Card */}
        <View style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>Daily Nutrition Goals</Text>

          <View style={styles.calorieRow}>
            <Ionicons name="flame" size={32} color={colors.primary} />
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieValue}>{goals.calorieGoal}</Text>
              <Text style={styles.calorieLabel}>calories per day</Text>
            </View>
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{goals.proteinGoal}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{goals.carbsGoal}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{goals.fatGoal}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>

          <View style={styles.tdeeInfo}>
            <Text style={styles.tdeeLabel}>
              Your TDEE (maintenance): {goals.tdee} cal/day
            </Text>
          </View>
        </View>

        {/* Profile Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Profile</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gender</Text>
            <Text style={styles.summaryValue}>
              {data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Age</Text>
            <Text style={styles.summaryValue}>{data.age} years</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Height</Text>
            <Text style={styles.summaryValue}>{displayHeight}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current Weight</Text>
            <Text style={styles.summaryValue}>{displayWeight}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Target Weight</Text>
            <Text style={styles.summaryValue}>{displayTargetWeight}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Activity Level</Text>
            <Text style={styles.summaryValue}>
              {activityLevelLabels[data.activityLevel]}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Goal</Text>
            <Text style={styles.summaryValue}>
              {weightGoalLabels[data.weightGoal]}
              {data.weightGoal !== "maintain" &&
                ` (${goalAggressivenessLabels[data.goalAggressiveness]})`}
            </Text>
          </View>

          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.summaryLabel}>Eating Type</Text>
            <Text style={styles.summaryValue}>
              {eatingTypeLabels[data.eatingType]}
            </Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          You can adjust these settings anytime from the Settings tab
        </Text>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.completeButtonText}>Start Tracking</Text>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  progressContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.xxl,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.base,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  goalsCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  goalsTitle: {
    fontSize: typography.sm,
    fontFamily: typography.fontSemibold,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  calorieInfo: {
    marginLeft: spacing.md,
  },
  calorieValue: {
    fontSize: 40,
    fontFamily: typography.fontBold,
    color: "#FFFFFF",
  },
  calorieLabel: {
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  macrosRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    fontSize: typography.xl,
    fontFamily: typography.fontBold,
    color: "#FFFFFF",
  },
  macroLabel: {
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  macroDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  tdeeInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  tdeeLabel: {
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryTitle: {
    fontSize: typography.base,
    fontFamily: typography.fontSemibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  summaryLabel: {
    fontSize: typography.sm,
    fontFamily: typography.fontRegular,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: colors.textPrimary,
  },
  disclaimer: {
    fontSize: typography.sm,
    fontFamily: typography.fontRegular,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  backButtonText: {
    fontSize: typography.base,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
  },
  completeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  completeButtonText: {
    fontSize: typography.base,
    fontFamily: typography.fontSemibold,
    color: "#FFFFFF",
  },
});
