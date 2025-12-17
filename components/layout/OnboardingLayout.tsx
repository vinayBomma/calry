import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";
import { StepProgress } from "../ui/ProgressBar";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showBackButton?: boolean;
  contentStyle?: ViewStyle;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  onNext,
  onBack,
  nextLabel = "Next",
  nextDisabled = false,
  nextLoading = false,
  showBackButton = true,
  contentStyle,
}: OnboardingLayoutProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <View style={[{ flex: 1, paddingHorizontal: spacing.xl }, contentStyle]}>
        <StepProgress currentStep={currentStep} totalSteps={totalSteps} />

        <Text
          style={{
            fontSize: typography.xxl,
            fontFamily: typography.fontBold,
            color: colors.textPrimary,
            marginBottom: spacing.sm,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: typography.base,
              fontFamily: typography.fontRegular,
              color: colors.textSecondary,
              marginBottom: spacing.xl,
            }}
          >
            {subtitle}
          </Text>
        )}

        {children}
      </View>

      {/* Navigation */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.lg,
          gap: spacing.md,
        }}
      >
        {showBackButton && onBack ? (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.textSecondary}
            />
            <Text
              style={{
                fontSize: typography.base,
                fontFamily: typography.fontMedium,
                color: colors.textSecondary,
              }}
            >
              Back
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            backgroundColor: nextDisabled ? colors.textMuted : colors.primary,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
            ...shadows.md,
          }}
          onPress={onNext}
          disabled={nextDisabled || nextLoading}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontSize: typography.base,
              fontFamily: typography.fontSemibold,
              color: "#FFFFFF",
            }}
          >
            {nextLabel}
          </Text>
          {!nextLoading && (
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
