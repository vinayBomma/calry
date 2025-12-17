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
import {
  ActivityLevel,
  activityLevelLabels,
  activityLevelDescriptions,
} from "../../lib/models/userProfile";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../lib/theme";

const activityOptions: { value: ActivityLevel; icon: string }[] = [
  { value: "sedentary", icon: "desktop-outline" },
  { value: "lightly_active", icon: "walk-outline" },
  { value: "moderately_active", icon: "bicycle-outline" },
  { value: "very_active", icon: "barbell-outline" },
  { value: "extremely_active", icon: "fitness-outline" },
];

export default function ActivityScreen() {
  const { data, updateData } = useOnboarding();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push("/onboarding/goals");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "49.8%" }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 6</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>How active are you?</Text>
        <Text style={styles.subtitle}>
          This affects how many calories you burn each day
        </Text>

        {/* Activity Options */}
        <ScrollView
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {activityOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                data.activityLevel === option.value &&
                  styles.optionCardSelected,
              ]}
              onPress={() => updateData({ activityLevel: option.value })}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  data.activityLevel === option.value &&
                    styles.optionIconContainerSelected,
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={
                    data.activityLevel === option.value
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
              </View>
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    data.activityLevel === option.value &&
                      styles.optionLabelSelected,
                  ]}
                >
                  {activityLevelLabels[option.value]}
                </Text>
                <Text style={styles.optionDescription}>
                  {activityLevelDescriptions[option.value]}
                </Text>
              </View>
              {data.activityLevel === option.value && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
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
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  optionIconContainerSelected: {
    backgroundColor: colors.primaryMuted,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.base,
    fontFamily: typography.fontSemibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDescription: {
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
