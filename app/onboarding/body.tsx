import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "../../lib/OnboardingContext";
import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
  HeightUnit,
  WeightUnit,
} from "../../lib/models/userProfile";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../lib/theme";

export default function BodyScreen() {
  const { data, updateData } = useOnboarding();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push("/onboarding/activity");
  };

  const toggleHeightUnit = () => {
    if (data.heightUnit === "cm") {
      const { feet, inches } = cmToFeetInches(data.heightCm);
      updateData({ heightUnit: "ft", heightFeet: feet, heightInches: inches });
    } else {
      const cm = feetInchesToCm(data.heightFeet, data.heightInches);
      updateData({ heightUnit: "cm", heightCm: cm });
    }
  };

  const toggleWeightUnit = () => {
    if (data.weightUnit === "kg") {
      updateData({
        weightUnit: "lbs",
        weightLbs: kgToLbs(data.weightKg),
        targetWeightLbs: kgToLbs(data.targetWeightKg),
      });
    } else {
      updateData({
        weightUnit: "kg",
        weightKg: lbsToKg(data.weightLbs),
        targetWeightKg: lbsToKg(data.targetWeightLbs),
      });
    }
  };

  const updateHeight = (value: string, field: "cm" | "feet" | "inches") => {
    const num = parseInt(value) || 0;
    if (field === "cm") {
      updateData({ heightCm: num });
    } else if (field === "feet") {
      updateData({
        heightFeet: num,
        heightCm: feetInchesToCm(num, data.heightInches),
      });
    } else {
      updateData({
        heightInches: num,
        heightCm: feetInchesToCm(data.heightFeet, num),
      });
    }
  };

  const updateWeight = (value: string, field: "current" | "target") => {
    const num = parseFloat(value) || 0;
    if (data.weightUnit === "kg") {
      if (field === "current") {
        updateData({ weightKg: num, weightLbs: kgToLbs(num) });
      } else {
        updateData({ targetWeightKg: num, targetWeightLbs: kgToLbs(num) });
      }
    } else {
      if (field === "current") {
        updateData({ weightLbs: num, weightKg: lbsToKg(num) });
      } else {
        updateData({ targetWeightLbs: num, targetWeightKg: lbsToKg(num) });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "33.2%" }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 6</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Your body measurements</Text>
        <Text style={styles.subtitle}>
          We'll use this to calculate your daily calorie needs
        </Text>

        {/* Height */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Height</Text>
            <TouchableOpacity
              style={styles.unitToggle}
              onPress={toggleHeightUnit}
              activeOpacity={0.7}
            >
              <Text style={styles.unitToggleText}>
                {data.heightUnit === "cm" ? "cm" : "ft/in"}
              </Text>
              <Ionicons
                name="swap-horizontal"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {data.heightUnit === "cm" ? (
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={data.heightCm.toString()}
                  onChangeText={(v) => updateHeight(v, "cm")}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.inputUnit}>cm</Text>
              </View>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={data.heightFeet.toString()}
                  onChangeText={(v) => updateHeight(v, "feet")}
                  keyboardType="numeric"
                  maxLength={1}
                />
                <Text style={styles.inputUnit}>ft</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={data.heightInches.toString()}
                  onChangeText={(v) => updateHeight(v, "inches")}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.inputUnit}>in</Text>
              </View>
            </View>
          )}
        </View>

        {/* Weight */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Current Weight</Text>
            <TouchableOpacity
              style={styles.unitToggle}
              onPress={toggleWeightUnit}
              activeOpacity={0.7}
            >
              <Text style={styles.unitToggleText}>
                {data.weightUnit === "kg" ? "kg" : "lbs"}
              </Text>
              <Ionicons
                name="swap-horizontal"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={
                  data.weightUnit === "kg"
                    ? data.weightKg.toString()
                    : data.weightLbs.toString()
                }
                onChangeText={(v) => updateWeight(v, "current")}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.inputUnit}>{data.weightUnit}</Text>
            </View>
          </View>
        </View>

        {/* Target Weight */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Target Weight</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={
                  data.weightUnit === "kg"
                    ? data.targetWeightKg.toString()
                    : data.targetWeightLbs.toString()
                }
                onChangeText={(v) => updateWeight(v, "target")}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.inputUnit}>{data.weightUnit}</Text>
            </View>
          </View>
          <Text style={styles.hint}>
            This is your goal weight - you can always change it later
          </Text>
        </View>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.base,
    fontFamily: typography.fontSemibold,
    color: colors.textPrimary,
  },
  unitToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.md,
  },
  unitToggleText: {
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: colors.primary,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.xl,
    fontFamily: typography.fontSemibold,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
    textAlign: "center",
  },
  inputUnit: {
    fontSize: typography.base,
    fontFamily: typography.fontMedium,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  hint: {
    fontSize: typography.sm,
    fontFamily: typography.fontRegular,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
