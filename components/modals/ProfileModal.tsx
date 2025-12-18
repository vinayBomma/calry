import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import {
  UserProfile,
  activityLevelLabels,
  weightGoalLabels,
  goalAggressivenessLabels,
  eatingTypeLabels,
  cmToFeetInches,
  kgToLbs,
} from "../../lib/models/userProfile";
import { spacing, typography, shadows, borderRadius } from "../../lib/theme";
import { ConfirmDialog } from "./ConfirmDialog";


interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onRecalculateGoals: () => void;
  onRedoOnboarding: () => void;
}

function ProfileRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={createProfileRowStyles(colors).container}>
      <Text style={createProfileRowStyles(colors).label}>{label}</Text>
      <Text style={createProfileRowStyles(colors).value}>{value}</Text>
    </View>
  );
}

const createProfileRowStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    label: {
      fontSize: typography.base,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
    },
    value: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textPrimary,
    },
  });

export function ProfileModal({
  visible,
  onClose,
  profile,
  onRecalculateGoals,
  onRedoOnboarding,
}: ProfileModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [showConfirmRedo, setShowConfirmRedo] = useState(false);



  const handleRedoPress = () => {
    setShowConfirmRedo(true);
  };

  const onConfirmRedo = () => {
    setShowConfirmRedo(false);
    onRedoOnboarding();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom"]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Profile</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {profile && (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.profileCard}>
                  <ProfileRow
                    label="Gender"
                    value={
                      profile.gender.charAt(0).toUpperCase() +
                      profile.gender.slice(1)
                    }
                    colors={colors}
                  />
                  <View style={styles.profileDivider} />
                  <ProfileRow
                    label="Age"
                    value={`${profile.age} years`}
                    colors={colors}
                  />
                  <View style={styles.profileDivider} />
                  <ProfileRow
                    label="Height"
                    value={
                      profile.heightUnit === "cm"
                        ? `${profile.heightCm} cm`
                        : `${cmToFeetInches(profile.heightCm).feet}'${
                            cmToFeetInches(profile.heightCm).inches
                          }"`
                    }
                    colors={colors}
                  />
                  <View style={styles.profileDivider} />
                  <ProfileRow
                    label="Weight"
                    value={
                      profile.weightUnit === "kg"
                        ? `${profile.weightKg} kg`
                        : `${kgToLbs(profile.weightKg)} lbs`
                    }
                    colors={colors}
                  />
                  <View style={styles.profileDivider} />
                  <ProfileRow
                    label="Target Weight"
                    value={
                      profile.weightUnit === "kg"
                        ? `${profile.targetWeightKg} kg`
                        : `${kgToLbs(profile.targetWeightKg)} lbs`
                    }
                    colors={colors}
                  />
                  <View style={styles.profileDivider} />
                  <ProfileRow
                    label="Activity Level"
                    value={activityLevelLabels[profile.activityLevel]}
                    colors={colors}
                  />
                  <View style={styles.profileDivider} />
                  <ProfileRow
                    label="Goal"
                    value={
                      profile.weightGoal === "maintain"
                        ? weightGoalLabels[profile.weightGoal]
                        : `${weightGoalLabels[profile.weightGoal]} (${
                            goalAggressivenessLabels[profile.goalAggressiveness]
                          })`
                    }
                    colors={colors}
                  />
                  <View style={styles.profileDivider} />
                  <ProfileRow
                    label="Eating Type"
                    value={eatingTypeLabels[profile.eatingType]}
                    colors={colors}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.recalculateButton}
                    onPress={onRecalculateGoals}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calculator-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.recalculateText}>
                      Recalculate Goals
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.redoButton}
                    onPress={handleRedoPress}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color={colors.textInverse}
                    />
                    <Text style={styles.redoButtonText}>Redo Setup</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </View>

      <ConfirmDialog
        visible={showConfirmRedo}
        onClose={() => setShowConfirmRedo(false)}
        onConfirm={onConfirmRedo}
        title="Redo Setup"
        message="This will take you through the setup process again. Your food log will be preserved."
        confirmText="Continue"
        cancelText="Cancel"
        destructive={false}
      />
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "flex-end",
    },
    modalSafeArea: {
      maxHeight: "85%",
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
    },
    modalContent: {
      paddingBottom: spacing.xxxl,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    modalTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    modalBody: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    profileDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginHorizontal: spacing.md,
    },
    modalActions: {
      marginTop: spacing.xl,
      gap: spacing.sm,
    },
    recalculateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: colors.primaryBg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
    },
    recalculateText: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.primary,
    },
    redoButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
    },
    redoButtonText: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textInverse,
    },
  });
