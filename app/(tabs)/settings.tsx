import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "expo-sqlite/kv-store";
import {
  getDailyGoals,
  updateDailyGoals,
  DailyGoals,
  getUserProfile,
  updateUserProfile,
  getDatabase,
} from "../../lib/database";
import {
  UserProfile,
  activityLevelLabels,
  calculateNutritionGoals,
} from "../../lib/models/userProfile";
import { useTheme } from "../../lib/ThemeContext";
import { useFoodStore } from "../../store/foodStore";
import { useProfileStore } from "../../store/profileStore";
import {
  usePremiumStore,
  canAccessFeature,
  PREMIUM_FEATURES,
} from "../../store/premiumStore";
import { spacing, typography, shadows, borderRadius } from "../../lib/theme";
import { GoalInput } from "../../components/settings/GoalInput";
import { ProfileModal } from "../../components/modals/ProfileModal";
import { FavouritesModal } from "../../components/modals/FavouritesModal";
import { AlertModal } from "../../components/modals/AlertModal";
import { ConfirmDialog } from "../../components/modals/ConfirmDialog";
import { backupDatabase, restoreDatabase } from "../../lib/backup";

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { favourites, deleteFavourite } = useFoodStore();
  const {
    tier,
    isPremium,
    customApiKey,
    setCustomApiKey,
    setPremiumTier,
    loadPremiumState,
    getRemainingTrialDays,
    getRemainingSubscriptionDays,
  } = usePremiumStore();
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
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showDevTools, setShowDevTools] = useState(false);
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
    loadPremiumState();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reload data when screen comes into focus (e.g., after completing onboarding)
      loadData();
    }, [])
  );

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
      showAlert(
        "Success",
        "Goals recalculated based on your profile!",
        "success"
      );
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

  const handleFeedback = async () => {
    const email = "snacktrack.feedback@gmail.com";
    const subject = encodeURIComponent("SnackTrack Feedback");
    const body = encodeURIComponent(
      `\n\n---\nApp Version: ${
        Constants.expoConfig?.version || "1.0.0"
      }\nDevice: ${Constants.platform?.ios ? "iOS" : "Android"}`
    );
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showAlert(
          "Error",
          "No email app found. Please email us at snacktrack.feedback@gmail.com",
          "error"
        );
      }
    } catch (error) {
      showAlert("Error", "Could not open email app", "error");
    }
  };

  const handleExport = async () => {
    if (!canAccessFeature(PREMIUM_FEATURES.BACKUP)) {
      router.push("/upgrade");
      return;
    }
    try {
      const result = await backupDatabase();
      if (result.shared) {
        showAlert(
          "Backup Ready",
          "Share dialog opened. Please save the backup file to your preferred location.",
          "info"
        );
      }
    } catch (error) {
      showAlert("Error", "Failed to create backup.", "error");
    }
  };

  const handleImport = async () => {
    if (!canAccessFeature(PREMIUM_FEATURES.RESTORE)) {
      router.push("/upgrade");
      return;
    }
    try {
      const success = await restoreDatabase();
      if (success) {
        // Force reload all data from the newly restored database
        await loadData();
        await useFoodStore.getState().loadData();
        showAlert(
          "Success",
          "Data restored successfully! Your stats and history have been updated.",
          "success"
        );
      }
    } catch (error) {
      showAlert(
        "Error",
        "Failed to restore backup. Please ensure the file is valid.",
        "error"
      );
    } finally {
      setShowImportConfirm(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      // Delete only food and preference AsyncStorage data, preserve premium keys
      const allKeys = await AsyncStorage.getAllKeys();
      const premiumKeys = [
        "snacktrack_premium_tier",
        "snacktrack_custom_api_key",
        "snacktrack_trial_started",
        "snacktrack_expires_at",
        "snacktrack_purchase_type",
      ];
      const keysToDelete = allKeys.filter((key) => !premiumKeys.includes(key));
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
      }

      // Delete only food data from SQLite, preserve user_profile
      const db = await getDatabase();
      const tablesToDelete = [
        "food_items",
        "favorites",
        "daily_goals",
        "ai_usage",
      ];

      for (const table of tablesToDelete) {
        try {
          await db.execAsync(`DELETE FROM ${table}`);
        } catch (err) {
          // Table might not exist, continue
          console.warn(`Could not delete from ${table}:`, err);
        }
      }

      // Reset food store only
      await useFoodStore.getState().resetStore();

      showAlert("Success", "All food logs cleared.", "success");

      // Reload the app after a short delay
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 1000);
    } catch (error) {
      console.error("Error deleting data:", error);
      showAlert("Error", "Failed to delete data. Please try again.", "error");
    } finally {
      setShowDeleteConfirm(false);
    }
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

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
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
                <Text style={styles.settingTitle}>Profile</Text>
                <Text style={styles.settingSubtitle}>
                  View and edit your information
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                isPremium()
                  ? setShowFavouritesModal(true)
                  : router.push("/upgrade")
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                <Ionicons
                  name="heart-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Manage Favourites</Text>
                <Text style={styles.settingSubtitle}>
                  {isPremium()
                    ? `${favourites.length} saved meal${
                        favourites.length !== 1 ? "s" : ""
                      }`
                    : "Premium feature"}
                </Text>
              </View>
              {isPremium() ? (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              ) : (
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={colors.textMuted}
                />
              )}
            </TouchableOpacity>

            <View style={styles.settingDivider} />

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

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleFeedback}
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Send Feedback</Text>
                <Text style={styles.settingSubtitle}>
                  Report bugs or request features
                </Text>
              </View>
              <Ionicons
                name="open-outline"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          <View style={styles.settingsCard}>
            {/* Current Status */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => !isPremium() && router.push("/upgrade")}
              activeOpacity={isPremium() ? 1 : 0.7}
            >
              <View
                style={[
                  styles.settingIcon,
                  isPremium() && { backgroundColor: colors.primaryBg },
                ]}
              >
                <Ionicons
                  name={isPremium() ? "diamond" : "diamond-outline"}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  {tier === "premium"
                    ? "Premium"
                    : tier === "byok"
                    ? "Developer Mode"
                    : "Free Plan"}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {tier === "byok"
                    ? "Unlimited AI meals"
                    : isPremium()
                    ? getRemainingTrialDays() > 0
                      ? `Trial: ${getRemainingTrialDays()} day${
                          getRemainingTrialDays() !== 1 ? "s" : ""
                        } remaining`
                      : getRemainingSubscriptionDays() > 0
                      ? `Expires in ${getRemainingSubscriptionDays()} day${
                          getRemainingSubscriptionDays() !== 1 ? "s" : ""
                        }`
                      : "Unlimited AI meals & all features"
                    : "3 AI meals/day • Tap to upgrade"}
                </Text>
              </View>
              {!isPremium() && (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              )}
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            {/* BYOK Option */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                if (customApiKey) {
                  // Clear the key
                  Alert.alert(
                    "Remove API Key",
                    "Are you sure you want to remove your custom API key?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => setCustomApiKey(null),
                      },
                    ]
                  );
                } else {
                  // Show API key input modal
                  setApiKeyInput("");
                  setShowApiKeyModal(true);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="key-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Use Your Own API Key</Text>
                <Text style={styles.settingSubtitle}>
                  {customApiKey
                    ? "API key configured ✓"
                    : "For developers • Unlimited AI meals"}
                </Text>
              </View>
              <Ionicons
                name={customApiKey ? "checkmark-circle" : "chevron-forward"}
                size={20}
                color={customApiKey ? colors.success : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Developer Options - Testing Only */}
        {showDevTools && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛠 Developer Options</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity
                style={[
                  styles.settingItem,
                  tier === "free" && { backgroundColor: colors.primaryBg },
                ]}
                onPress={() => setPremiumTier("free", undefined, undefined)}
              >
                <View style={styles.settingIcon}>
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Free Plan</Text>
                  <Text style={styles.settingSubtitle}>
                    3 AI meals/day, limited features
                  </Text>
                </View>
                {tier === "free" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity
                style={[
                  styles.settingItem,
                  tier === "premium" && { backgroundColor: colors.primaryBg },
                ]}
                onPress={() => setPremiumTier("premium", "one_time", undefined)}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name="diamond" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Premium (Lifetime)</Text>
                  <Text style={styles.settingSubtitle}>
                    Unlimited AI, all features
                  </Text>
                </View>
                {tier === "premium" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity
                style={[
                  styles.settingItem,
                  tier === "byok" && { backgroundColor: colors.primaryBg },
                ]}
                onPress={() => {
                  setCustomApiKey("test_api_key_for_dev");
                }}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name="key" size={22} color={colors.warning} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>BYOK Mode</Text>
                  <Text style={styles.settingSubtitle}>
                    Developer API key mode
                  </Text>
                </View>
                {tier === "byok" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleExport}
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Export</Text>
                <Text style={styles.settingSubtitle}>
                  {isPremium() ? "Save your data to a file" : "Premium feature"}
                </Text>
              </View>
              {!isPremium() && (
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={colors.textMuted}
                />
              )}
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                isPremium()
                  ? setShowImportConfirm(true)
                  : router.push("/upgrade")
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                <Ionicons
                  name="cloud-download-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Import</Text>
                <Text style={styles.settingSubtitle}>
                  {isPremium() ? "Restore data from a file" : "Premium feature"}
                </Text>
              </View>
              {!isPremium() && (
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={colors.textMuted}
                />
              )}
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.error }]}>
                  Delete All Data
                </Text>
                <Text style={styles.settingSubtitle}>
                  Clear all food logs, settings, and preferences
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}

        <View style={{ alignItems: "center", marginTop: spacing.xl }}>
          <Text style={styles.versionText}>
            Version {Constants.expoConfig?.version || "1.2.0"}
          </Text>
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

      <ConfirmDialog
        visible={showImportConfirm}
        onClose={() => setShowImportConfirm(false)}
        onConfirm={handleImport}
        title="Import Data"
        message="This will overwrite all your current food logs and settings. Are you sure you want to proceed?"
        confirmText="Import"
        cancelText="Cancel"
        destructive={true}
      />

      {/* API Key Input Modal */}
      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.apiKeyModalContent}>
            <Text style={styles.apiKeyModalTitle}>Enter Gemini API Key</Text>
            <Text style={styles.apiKeyModalSubtitle}>
              Get your API key from Google AI Studio. This unlocks unlimited AI
              meals.
            </Text>
            <TextInput
              style={styles.apiKeyInput}
              placeholder="Paste your API key here"
              placeholderTextColor={colors.textMuted}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <View style={styles.apiKeyModalButtons}>
              <TouchableOpacity
                style={styles.apiKeyModalCancelButton}
                onPress={() => setShowApiKeyModal(false)}
              >
                <Text style={styles.apiKeyModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.apiKeyModalSaveButton,
                  !apiKeyInput.trim() && { opacity: 0.5 },
                ]}
                onPress={async () => {
                  if (apiKeyInput.trim()) {
                    // Check if it's the dev password
                    if (apiKeyInput.trim() === "Vinay123@tennis") {
                      setShowDevTools(!showDevTools);
                      setApiKeyInput("");
                      setShowApiKeyModal(false);
                      showAlert(
                        "Dev Tools",
                        showDevTools
                          ? "Developer options hidden"
                          : "Developer options visible",
                        "info"
                      );
                      return;
                    }

                    // Otherwise treat as API key
                    try {
                      await setCustomApiKey(apiKeyInput.trim());
                      setShowApiKeyModal(false);
                      showAlert(
                        "Success",
                        "API key saved! You now have unlimited AI meals.",
                        "success"
                      );
                    } catch (error) {
                      showAlert(
                        "Invalid API Key",
                        "The API key you provided is invalid. Please check and try again.",
                        "error"
                      );
                    }
                  }
                }}
                disabled={!apiKeyInput.trim()}
              >
                <Text style={styles.apiKeyModalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAllData}
        title="Delete All Data?"
        message="This will delete all food logs and history. Your profile will be preserved."
        confirmText="Delete All"
        cancelText="Cancel"
        destructive={true}
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
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    apiKeyModalContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      width: "100%",
      maxWidth: 400,
      ...shadows.lg,
    },
    apiKeyModalTitle: {
      fontSize: typography.xl,
      fontFamily: typography.fontBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    apiKeyModalSubtitle: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    apiKeyInput: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.base,
      fontFamily: typography.fontRegular,
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    },
    apiKeyModalButtons: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    apiKeyModalCancelButton: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: "center",
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceSecondary,
    },
    apiKeyModalCancelText: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
    },
    apiKeyModalSaveButton: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: "center",
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
    },
    apiKeyModalSaveText: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textInverse,
    },
  });
