import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "../../lib/OnboardingContext";
import { useTheme } from "../../lib/ThemeContext";
import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
} from "../../lib/models/userProfile";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";
import { OnboardingLayout } from "../../components/layout";

export default function BodyScreen() {
  const { data, updateData } = useOnboarding();
  const { colors } = useTheme();

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

  const styles = createStyles(colors);

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={6}
      title="Your body measurements"
      subtitle="We'll use this to calculate your daily calorie needs"
      onNext={() => router.push("/onboarding/activity")}
      onBack={() => router.back()}
    >
      <View style={{ flex: 1 }}>
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

        {/* Current Weight */}
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
    </OnboardingLayout>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    section: { marginBottom: spacing.xl },
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
    inputRow: { flexDirection: "row", gap: spacing.md },
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
  });
