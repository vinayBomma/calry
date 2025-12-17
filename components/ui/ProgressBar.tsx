import { View, Text, ViewStyle } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography } from "../../lib/theme";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}

export function StepProgress({
  currentStep,
  totalSteps,
  style,
}: StepProgressProps) {
  const { colors } = useTheme();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={[{ marginTop: spacing.md, marginBottom: spacing.xl }, style]}>
      <View
        style={{
          height: 4,
          backgroundColor: colors.divider,
          borderRadius: 2,
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: colors.primary,
            borderRadius: 2,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: typography.sm,
          fontFamily: typography.fontMedium,
          color: colors.textMuted,
        }}
      >
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}
