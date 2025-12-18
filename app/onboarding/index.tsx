import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "../../store";
import { useTheme } from "../../lib/ThemeContext";
import { Gender } from "../../lib/models/userProfile";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";
import { OnboardingLayout } from "../../components/layout";

const genderOptions: { value: Gender; label: string; icon: string }[] = [
  { value: "male", label: "Male", icon: "male" },
  { value: "female", label: "Female", icon: "female" },
  { value: "other", label: "Other", icon: "person" },
];

export default function GenderAgeScreen() {
  const { gender, age, updateData } = useOnboardingStore();
  const { colors } = useTheme();

  const decreaseAge = () => {
    if (age > 13) updateData({ age: age - 1 });
  };

  const increaseAge = () => {
    if (age < 100) updateData({ age: age + 1 });
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={6}
      title="Let's get to know you"
      subtitle="This helps us calculate your personalized nutrition goals"
      onNext={() => router.push("/onboarding/body")}
      showBackButton={false}
    >
      <View style={{ flex: 1 }}>
        {/* Gender Selection */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              fontSize: typography.base,
              fontFamily: typography.fontSemibold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Gender
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: spacing.lg,
                  backgroundColor:
                    gender === option.value
                      ? colors.primaryBg
                      : colors.surface,
                  borderRadius: borderRadius.lg,
                  borderWidth: 2,
                  borderColor:
                    gender === option.value
                      ? colors.primary
                      : colors.divider,
                  ...shadows.sm,
                }}
                onPress={() => updateData({ gender: option.value })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon as any}
                  size={32}
                  color={
                    gender === option.value
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginTop: spacing.sm,
                    fontSize: typography.sm,
                    fontFamily: typography.fontMedium,
                    color:
                      gender === option.value
                        ? colors.primary
                        : colors.textSecondary,
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age Selection */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              fontSize: typography.base,
              fontFamily: typography.fontSemibold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Age
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.lg,
            }}
          >
            <TouchableOpacity
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.primaryBg,
                alignItems: "center",
                justifyContent: "center",
                ...shadows.sm,
              }}
              onPress={decreaseAge}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={28} color={colors.primary} />
            </TouchableOpacity>
            <View style={{ alignItems: "center", minWidth: 100 }}>
              <Text
                style={{
                  fontSize: 48,
                  fontFamily: typography.fontBold,
                  color: colors.textPrimary,
                }}
              >
                {age}
              </Text>
              <Text
                style={{
                  fontSize: typography.sm,
                  fontFamily: typography.fontMedium,
                  color: colors.textMuted,
                }}
              >
                years
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.primaryBg,
                alignItems: "center",
                justifyContent: "center",
                ...shadows.sm,
              }}
              onPress={increaseAge}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}
