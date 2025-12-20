import { ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "../../store/onboardingStore";
import {
  ActivityLevel,
  activityLevelLabels,
  activityLevelDescriptions,
} from "../../lib/models/userProfile";
import { OnboardingLayout } from "../../components/layout/OnboardingLayout";
import { OptionCard } from "../../components/ui/OptionCard";

const activityOptions: { value: ActivityLevel; icon: string }[] = [
  { value: "sedentary", icon: "desktop-outline" },
  { value: "lightly_active", icon: "walk-outline" },
  { value: "moderately_active", icon: "bicycle-outline" },
  { value: "very_active", icon: "barbell-outline" },
  { value: "extremely_active", icon: "fitness-outline" },
];

export default function ActivityScreen() {
  const { activityLevel, updateData } = useOnboardingStore();

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={6}
      title="How active are you?"
      subtitle="This affects how many calories you burn each day"
      onNext={() => router.push("/onboarding/goals")}
      onBack={() => router.back()}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {activityOptions.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon as any}
            title={activityLevelLabels[option.value]}
            subtitle={activityLevelDescriptions[option.value]}
            selected={activityLevel === option.value}
            onPress={() => updateData({ activityLevel: option.value })}
          />
        ))}
      </ScrollView>
    </OnboardingLayout>
  );
}
