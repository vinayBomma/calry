import { ScrollView, View, Text } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "../../store";
import { useTheme } from "../../lib/ThemeContext";
import {
  EatingType,
  eatingTypeLabels,
  eatingTypeDescriptions,
} from "../../lib/models/userProfile";
import { spacing, typography, borderRadius } from "../../lib/theme";
import { OnboardingLayout } from "../../components/layout";
import { OptionCard } from "../../components/ui";

const eatingOptions: { value: EatingType; icon: string }[] = [
  { value: "light", icon: "leaf-outline" },
  { value: "normal", icon: "restaurant-outline" },
  { value: "heavy", icon: "fast-food-outline" },
];

export default function EatingScreen() {
  const { eatingType, updateData } = useOnboardingStore();
  const { colors } = useTheme();

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={6}
      title="How would you describe your eating?"
      subtitle="This helps us set your protein goals appropriately"
      onNext={() => router.push("/onboarding/summary")}
      onBack={() => router.back()}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {eatingOptions.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon as any}
            title={eatingTypeLabels[option.value]}
            subtitle={eatingTypeDescriptions[option.value]}
            selected={eatingType === option.value}
            onPress={() => updateData({ eatingType: option.value })}
            iconSize={28}
          />
        ))}

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.sm,
            padding: spacing.md,
            backgroundColor: colors.primaryBg,
            borderRadius: borderRadius.lg,
            marginTop: spacing.md,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text
            style={{
              flex: 1,
              fontSize: typography.sm,
              fontFamily: typography.fontRegular,
              color: colors.textSecondary,
              lineHeight: 20,
            }}
          >
            This affects your protein recommendation. Heavy eaters typically
            need more protein to feel satisfied, while light eaters may prefer
            smaller protein portions.
          </Text>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}
