import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  getDailyGoals,
  updateDailyGoals,
  DailyGoals,
  getUserProfile,
  updateUserProfile,
} from "../../lib/database";
import {
  UserProfile,
  activityLevelLabels,
  calculateNutritionGoals,
} from "../../lib/models/userProfile";
import { useTheme } from "../../lib/ThemeContext";
import { useFoodStore } from "../../store";
import { spacing, typography, shadows, borderRadius } from "../../lib/theme";
import { GoalInput } from "../../components/settings";
import { ProfileModal, FavouritesModal, AlertModal } from "../../components/modals";

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { favourites, deleteFavourite } = useFoodStore();
  const [goals, setGoals] = useState<DailyGoals>({
    calorieGoal: 2000,
    proteinGoal: 120,
    carbsGoal: 250,
    fatGoal: 65,
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoals, setEditedGoals] = useState(goals);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFavouritesModal, setShowFavouritesModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedGoals, loadedProfile] = await Promise.all([
        getDailyGoals(),
        getUserProfile(),
      ]);
      setGoals(loadedGoals);
      setEditedGoals(loadedGoals);
      setProfile(loadedProfile);
    } catch (error) {
      console.error("Error loading data:", error);

    }
  };

  const handleRecalculateGoals = async () => {
    if (!profile) return;

    const newGoals = calculateNutritionGoals(profile);
    const updatedGoals = {
      calorieGoal: newGoals.calorieGoal,
      proteinGoal: newGoals.proteinGoal,
      carbsGoal: newGoals.carbsGoal,
      fatGoal: newGoals.fatGoal,
    };

    try {
      await updateDailyGoals(updatedGoals);
      // Sync with Zustand store
      useFoodStore.getState().updateGoals(updatedGoals);
      setGoals(updatedGoals);
      setEditedGoals(updatedGoals);
      setShowProfileModal(false);
      showAlert("Success", "Goals recalculated based on your profile!", "success");
    } catch (error) {
      console.error("Error recalculating goals:", error);
      showAlert("Error", "Failed to recalculate goals.", "error");
    }
  };

  const handleRedoOnboarding = () => {
    setShowProfileModal(false);
    // Confirmation handled in ProfileModal now
    async function performRedo() {
       await updateUserProfile({ onboardingCompleted: false });
       router.replace("/onboarding");
    }
    performRedo();
  };

  const handleSaveGoals = async () => {
    try {
      await updateDailyGoals(editedGoals);
      // Sync with Zustand store
      useFoodStore.getState().updateGoals(editedGoals);
      setGoals(editedGoals);
      setIsEditing(false);
      showAlert("Success", "Your goals have been updated!", "success");
    } catch (error) {
      console.error("Error saving goals:", error);
      showAlert("Error", "Failed to save goals. Please try again.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditedGoals(goals);
    setIsEditing(false);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancelEdit}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveGoals}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.goalsCard}>
            <GoalInput
              label="Calories"
              value={isEditing ? editedGoals.calorieGoal : goals.calorieGoal}
              unit="kcal"
              editable={isEditing}
              onChange={(val) =>
                setEditedGoals({ ...editedGoals, calorieGoal: val })
              }
            />
            <View style={styles.goalDivider} />
            <GoalInput
              label="Protein"
              value={isEditing ? editedGoals.proteinGoal : goals.proteinGoal}
              unit="g"
              editable={isEditing}
              onChange={(val) =>
                setEditedGoals({ ...editedGoals, proteinGoal: val })
              }
            />
            <View style={styles.goalDivider} />
            <GoalInput
              label="Carbs"
              value={isEditing ? editedGoals.carbsGoal : goals.carbsGoal}
              unit="g"
              editable={isEditing}
              onChange={(val) =>
                setEditedGoals({ ...editedGoals, carbsGoal: val })
              }
            />
            <View style={styles.goalDivider} />
            <GoalInput
              label="Fat"
              value={isEditing ? editedGoals.fatGoal : goals.fatGoal}
              unit="g"
              editable={isEditing}
              onChange={(val) =>
                setEditedGoals({ ...editedGoals, fatGoal: val })
              }
            />
          </View>
        </View>


        {/* Profile Section - Opens Modal */}
        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setShowProfileModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.settingIcon}>
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Your Profile</Text>
                  <Text style={styles.settingSubtitle}>
                    {profile.gender.charAt(0).toUpperCase() +
                      profile.gender.slice(1)}
                    , {profile.age} years •{" "}
                    {activityLevelLabels[profile.activityLevel]}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}



        {/* Favourites Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favourites</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowFavouritesModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="star-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Manage Favourites</Text>
                <Text style={styles.settingSubtitle}>
                  {favourites.length} saved meal{favourites.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons
                  name={isDark ? "moon" : "moon-outline"}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>
                  {isDark ? "On" : "Off"}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primaryMuted }}
                thumbColor={isDark ? colors.primary : colors.surface}
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Version</Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Profile Modal */}
      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onRecalculateGoals={handleRecalculateGoals}
        onRedoOnboarding={handleRedoOnboarding}
      />
      
      <FavouritesModal
        visible={showFavouritesModal}
        onClose={() => setShowFavouritesModal(false)}
      />

      <AlertModal
        visible={alertConfig.visible}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      fontSize: typography.xxl,
      fontFamily: typography.fontBold,
      color: colors.textPrimary,
    },
    headerSubtitle: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      marginTop: 2,
    },
    scrollContainer: {
      flex: 1,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textSecondary,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    editButton: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.primary,
    },
    editActions: {
      flexDirection: "row",
      gap: spacing.md,
    },
    cancelButton: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textMuted,
    },
    saveButton: {
      fontSize: typography.sm,
      fontFamily: typography.fontSemibold,
      color: colors.primary,
    },
    goalsCard: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    goalDivider: {
      height: 1,
      backgroundColor: colors.divider,
    },
    settingsCard: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.primaryBg,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textPrimary,
    },
    settingSubtitle: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      marginTop: 2,
    },
    settingDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 60,
    },
    versionText: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    spacer: {
      height: 40,
    },
  });
