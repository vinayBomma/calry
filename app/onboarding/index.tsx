import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "../../lib/OnboardingContext";
import { Gender } from "../../lib/models/userProfile";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../lib/theme";

const genderOptions: { value: Gender; label: string; icon: string }[] = [
  { value: "male", label: "Male", icon: "male" },
  { value: "female", label: "Female", icon: "female" },
  { value: "other", label: "Other", icon: "person" },
];

export default function GenderAgeScreen() {
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    router.push("/onboarding/body");
  };

  const decreaseAge = () => {
    if (data.age > 13) {
      updateData({ age: data.age - 1 });
    }
  };

  const increaseAge = () => {
    if (data.age < 100) {
      updateData({ age: data.age + 1 });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "16.6%" }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 6</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Let's get to know you</Text>
        <Text style={styles.subtitle}>
          This helps us calculate your personalized nutrition goals
        </Text>

        {/* Gender Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.genderContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderOption,
                  data.gender === option.value && styles.genderOptionSelected,
                ]}
                onPress={() => updateData({ gender: option.value })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon as any}
                  size={32}
                  color={
                    data.gender === option.value
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.genderLabel,
                    data.gender === option.value && styles.genderLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Age</Text>
          <View style={styles.ageContainer}>
            <TouchableOpacity
              style={styles.ageButton}
              onPress={decreaseAge}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={28} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.ageDisplay}>
              <Text style={styles.ageValue}>{data.age}</Text>
              <Text style={styles.ageUnit}>years</Text>
            </View>
            <TouchableOpacity
              style={styles.ageButton}
              onPress={increaseAge}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
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
    marginBottom: spacing.xxxl,
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
  genderContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  genderOption: {
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
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  genderLabel: {
    marginTop: spacing.sm,
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
  },
  genderLabelSelected: {
    color: colors.primary,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  ageButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  ageDisplay: {
    alignItems: "center",
    minWidth: 100,
  },
  ageValue: {
    fontSize: 48,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
  },
  ageUnit: {
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: colors.textMuted,
  },
  navigation: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  nextButton: {
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
