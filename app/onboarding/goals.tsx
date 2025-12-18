import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "../../store";
import { useTheme } from "../../lib/ThemeContext";
import {
  WeightGoal,
  GoalAggressiveness,
  weightGoalLabels,
  goalAggressivenessLabels,
  goalAggressivenessDescriptions,
} from "../../lib/models/userProfile";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";
import { OnboardingLayout } from "../../components/layout";
import { OptionCard } from "../../components/ui";

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
  const { weightGoal, goalAggressiveness, updateData } = useOnboardingStore();
  const { colors } = useTheme();

  const showAggressiveness = weightGoal !== "maintain";

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={6}
      title="What's your goal?"
      subtitle="We'll adjust your calorie target based on your goal"
      onNext={() => router.push("/onboarding/eating")}
      onBack={() => router.back()}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Weight Goal */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              fontSize: typography.base,
              fontFamily: typography.fontSemibold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            I want to
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: spacing.lg,
                  backgroundColor:
                    weightGoal === option.value
                      ? colors.primaryBg
                      : colors.surface,
                  borderRadius: borderRadius.lg,
                  borderWidth: 2,
                  borderColor:
                    weightGoal === option.value
                      ? option.color
                      : colors.divider,
                  ...shadows.sm,
                }}
                onPress={() => updateData({ weightGoal: option.value })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon as any}
                  size={32}
                  color={
                    weightGoal === option.value
                      ? option.color
                      : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginTop: spacing.sm,
                    fontSize: typography.sm,
                    fontFamily: typography.fontSemibold,
                    color:
                      weightGoal === option.value
                        ? option.color
                        : colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {weightGoalLabels[option.value]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Aggressiveness */}
        {showAggressiveness && (
          <View style={{ marginBottom: spacing.xl }}>
            <Text
              style={{
                fontSize: typography.base,
                fontFamily: typography.fontSemibold,
                color: colors.textPrimary,
                marginBottom: spacing.sm,
              }}
            >
              How fast?
            </Text>
            <Text
              style={{
                fontSize: typography.sm,
                fontFamily: typography.fontRegular,
                color: colors.textMuted,
                marginBottom: spacing.md,
              }}
            >
              {weightGoal === "lose"
                ? "Slower is healthier and more sustainable"
                : "Gradual gains help build lean muscle"}
            </Text>

            {aggressivenessOptions.map((option) => (
              <OptionCard
                key={option}
                icon={
                  option === "slow"
                    ? "walk-outline"
                    : option === "moderate"
                    ? "bicycle-outline"
                    : "rocket-outline"
                }
                title={goalAggressivenessLabels[option]}
                subtitle={goalAggressivenessDescriptions[option]}
                selected={goalAggressiveness === option}
                onPress={() => updateData({ goalAggressiveness: option })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </OnboardingLayout>
  );
}
