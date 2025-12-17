import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "../../lib/OnboardingContext";
import { useTheme } from "../../lib/ThemeContext";
import {
  calculateNutritionGoals,
  activityLevelLabels,
  weightGoalLabels,
  goalAggressivenessLabels,
  eatingTypeLabels,
  UserProfile,
} from "../../lib/models/userProfile";
import { updateUserProfile, updateDailyGoals } from "../../lib/database";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";
import { OnboardingLayout } from "../../components/layout";

export default function SummaryScreen() {
  const { data } = useOnboarding();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

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
      await updateUserProfile(profile);
      await updateDailyGoals({
        calorieGoal: goals.calorieGoal,
        proteinGoal: goals.proteinGoal,
        carbsGoal: goals.carbsGoal,
        fatGoal: goals.fatGoal,
      });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const styles = createStyles(colors);

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={6}
      title="Your personalized plan"
      subtitle="Here's what we've calculated based on your profile"
      onNext={handleComplete}
      onBack={() => router.back()}
      nextLabel="Start Tracking"
      nextLoading={isLoading}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Nutrition Goals Card */}
        <View style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>Daily Nutrition Goals</Text>
          <View style={styles.calorieRow}>
            <Ionicons name="flame" size={32} color="#FFFFFF" />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={styles.calorieValue}>{goals.calorieGoal}</Text>
              <Text style={styles.calorieLabel}>calories per day</Text>
            </View>
          </View>
          <View style={styles.macrosRow}>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.macroValue}>{goals.proteinGoal}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={{ alignItems: "center" }}>
              <Text style={styles.macroValue}>{goals.carbsGoal}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={{ alignItems: "center" }}>
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
          {[
            {
              label: "Gender",
              value: data.gender.charAt(0).toUpperCase() + data.gender.slice(1),
            },
            { label: "Age", value: `${data.age} years` },
            { label: "Height", value: displayHeight },
            { label: "Current Weight", value: displayWeight },
            { label: "Target Weight", value: displayTargetWeight },
            {
              label: "Activity Level",
              value: activityLevelLabels[data.activityLevel],
            },
            {
              label: "Goal",
              value: `${weightGoalLabels[data.weightGoal]}${
                data.weightGoal !== "maintain"
                  ? ` (${goalAggressivenessLabels[data.goalAggressiveness]})`
                  : ""
              }`,
            },
            { label: "Eating Type", value: eatingTypeLabels[data.eatingType] },
          ].map((row, i, arr) => (
            <View
              key={row.label}
              style={[
                styles.summaryRow,
                i === arr.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          You can adjust these settings anytime from the Settings tab
        </Text>
      </ScrollView>
    </OnboardingLayout>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
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
  });
