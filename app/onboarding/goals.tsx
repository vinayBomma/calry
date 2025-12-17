import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "../../lib/OnboardingContext";
import { useTheme } from "../../lib/ThemeContext";
import {
  WeightGoal,
  GoalAggressiveness,
  weightGoalLabels,
  goalAggressivenessLabels,
  goalAggressivenessDescriptions,
} from "../../lib/models/userProfile";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";

const goalOptions: { value: WeightGoal; icon: string; color: string }[] = [
  { value: "lose", icon: "trending-down", color: "#EF4444" },
  { value: "maintain", icon: "remove", color: "#439775" },
  { value: "gain", icon: "trending-up", color: "#3B82F6" },
];

const aggressivenessOptions: GoalAggressiveness[] = [
  "slow",
  "moderate",
  "fast",
];

export default function GoalsScreen() {
  const { data, updateData } = useOnboarding();
  const { colors } = useTheme();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push("/onboarding/eating");
  };

  const showAggressiveness = data.weightGoal !== "maintain";

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "66.4%" }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 6</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.subtitle}>
          We'll adjust your calorie target based on your goal
        </Text>

        {/* Weight Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>I want to</Text>
          <View style={styles.goalContainer}>
            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.goalCard,
                  data.weightGoal === option.value && styles.goalCardSelected,
                  data.weightGoal === option.value && {
                    borderColor: option.color,
                  },
                ]}
                onPress={() => updateData({ weightGoal: option.value })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon as any}
                  size={32}
                  color={
                    data.weightGoal === option.value
                      ? option.color
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.goalLabel,
                    data.weightGoal === option.value && {
                      color: option.color,
                    },
                  ]}
                >
                  {weightGoalLabels[option.value]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Aggressiveness */}
        {showAggressiveness && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How fast?</Text>
            <Text style={styles.sectionHint}>
              {data.weightGoal === "lose"
                ? "Slower is healthier and more sustainable"
                : "Gradual gains help build lean muscle"}
            </Text>

            {aggressivenessOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.aggressivenessCard,
                  data.goalAggressiveness === option &&
                    styles.aggressivenessCardSelected,
                ]}
                onPress={() => updateData({ goalAggressiveness: option })}
                activeOpacity={0.7}
              >
                <View style={styles.aggressivenessContent}>
                  <Text
                    style={[
                      styles.aggressivenessLabel,
                      data.goalAggressiveness === option &&
                        styles.aggressivenessLabelSelected,
                    ]}
                  >
                    {goalAggressivenessLabels[option]}
                  </Text>
                  <Text style={styles.aggressivenessDescription}>
                    {goalAggressivenessDescriptions[option]}
                  </Text>
                </View>
                {data.goalAggressiveness === option && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
    section: {
      marginBottom: spacing.xl,
    },
    sectionLabel: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    sectionHint: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      marginBottom: spacing.md,
      marginTop: -spacing.sm,
    },
    goalContainer: {
      flexDirection: "row",
      gap: spacing.md,
    },
    goalCard: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.divider,
      ...shadows.sm,
    },
    goalCardSelected: {
      backgroundColor: colors.primaryBg,
    },
    goalLabel: {
      marginTop: spacing.sm,
      fontSize: typography.sm,
      fontFamily: typography.fontSemibold,
      color: colors.textSecondary,
      textAlign: "center",
    },
    aggressivenessCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.divider,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    aggressivenessCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryBg,
    },
    aggressivenessContent: {
      flex: 1,
    },
    aggressivenessLabel: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    aggressivenessLabelSelected: {
      color: colors.primary,
    },
    aggressivenessDescription: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
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
    nextButton: {
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
    nextButtonText: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: "#FFFFFF",
    },
  });
