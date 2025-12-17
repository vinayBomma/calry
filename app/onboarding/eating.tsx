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
  EatingType,
  eatingTypeLabels,
  eatingTypeDescriptions,
} from "../../lib/models/userProfile";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";

const eatingOptions: { value: EatingType; icon: string }[] = [
  { value: "light", icon: "leaf-outline" },
  { value: "normal", icon: "restaurant-outline" },
  { value: "heavy", icon: "fast-food-outline" },
];

export default function EatingScreen() {
  const { data, updateData } = useOnboarding();
  const { colors } = useTheme();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push("/onboarding/summary");
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "83%" }]} />
          </View>
          <Text style={styles.progressText}>Step 5 of 6</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>How would you describe your eating?</Text>
        <Text style={styles.subtitle}>
          This helps us set your protein goals appropriately
        </Text>

        {/* Eating Type Options */}
        <ScrollView
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {eatingOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                data.eatingType === option.value && styles.optionCardSelected,
              ]}
              onPress={() => updateData({ eatingType: option.value })}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  data.eatingType === option.value &&
                    styles.optionIconContainerSelected,
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={28}
                  color={
                    data.eatingType === option.value
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
              </View>
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    data.eatingType === option.value &&
                      styles.optionLabelSelected,
                  ]}
                >
                  {eatingTypeLabels[option.value]}
                </Text>
                <Text style={styles.optionDescription}>
                  {eatingTypeDescriptions[option.value]}
                </Text>
              </View>
              {data.eatingType === option.value && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              This affects your protein recommendation. Heavy eaters typically
              need more protein to feel satisfied, while light eaters may prefer
              smaller protein portions.
            </Text>
          </View>
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
    optionsContainer: {
      flex: 1,
    },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.divider,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryBg,
    },
    optionIconContainer: {
      width: 56,
      height: 56,
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
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    optionLabelSelected: {
      color: colors.primary,
    },
    optionDescription: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      lineHeight: 20,
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.lg,
      marginTop: spacing.md,
    },
    infoText: {
      flex: 1,
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
      lineHeight: 20,
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
