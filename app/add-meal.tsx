import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { FoodItem } from "../lib/models/food";
import { getFoodNutritionInfo } from "../lib/gemini";
import { useFoodStore } from "../store/foodStore";
import { usePremiumStore } from "../store/premiumStore";
import { useTheme } from "../lib/ThemeContext";
import { spacing, typography, shadows, borderRadius } from "../lib/theme";
import {
  MEAL_OPTIONS,
  getSuggestedMealType,
  type MealType,
} from "../lib/hooks/useMealConfig";
import { AlertModal } from "../components/modals/AlertModal";

type Tab = "ai" | "favourites" | "manual";

export default function AddMealScreen() {
  const { addFoodItem, favourites, selectedDate } = useFoodStore();
  const {
    canUseAI,
    getRemainingAIMeals,
    incrementAIUsage,
    isPremium,
    loadPremiumState,
    tier,
  } = usePremiumStore();
  const { colors } = useTheme();
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    getSuggestedMealType()
  );
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Manual entry state
  const [manualCalories, setManualCalories] = useState("200");
  const [manualProtein, setManualProtein] = useState("10");
  const [manualCarbs, setManualCarbs] = useState("30");
  const [manualFat, setManualFat] = useState("10");
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

  // Load premium state on mount
  useEffect(() => {
    loadPremiumState();
  }, []);

  const remainingMeals = getRemainingAIMeals();

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

  // Helper to get timestamp for the selected date
  const getTimestampForSelectedDate = () => {
    const date = new Date(selectedDate);
    const now = new Date();

    // If selected date is today, use current time
    if (date.toDateString() === now.toDateString()) {
      return now.getTime();
    }

    // If different day, default to noon or preserve current time if reasonable?
    // Let's default to noon for simplicity, or just set hours to current time but on that date
    date.setHours(now.getHours(), now.getMinutes(), 0, 0);
    return date.getTime();
  };

  const handleAddMeal = async () => {
    if (!description.trim()) {
      return;
    }

    // Check AI usage limits - if limit reached, show manual entry option instead of redirecting
    if (!canUseAI()) {
      // Show manual entry option
      setActiveTab("manual");
      showAlert(
        "AI Limit Reached",
        "You've used your daily AI meals. You can still add meals manually below.",
        "info"
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      // Increment usage before making the call
      const allowed = await incrementAIUsage();
      if (!allowed) {
        // Limit just reached, show manual entry option
        setActiveTab("manual");
        showAlert(
          "AI Limit Reached",
          "You've used your daily AI meals. You can still add meals manually below.",
          "info"
        );
        return;
      }

      // Get nutrition info from Gemini
      const nutritionInfo = await getFoodNutritionInfo(description);
      const timestamp = getTimestampForSelectedDate();

      const newFoodItem: FoodItem = {
        id: Date.now().toString(),
        name: nutritionInfo.name || description,
        description: description.trim(),
        calories: nutritionInfo.calories,
        protein: nutritionInfo.protein,
        carbs: nutritionInfo.carbs,
        fat: nutritionInfo.fat,
        timestamp: timestamp,
        mealType: selectedMealType,
      };

      // Save to context
      await addFoodItem(newFoodItem);

      // Track event
      posthog?.capture("meal_added", {
        meal_type: selectedMealType,
        calories: newFoodItem.calories,
        is_ai: true,
      });

      // Navigate back to home
      router.back();
    } catch (error) {
      console.error("Error adding meal:", error);
      posthog?.captureException(error);
      showAlert("Error", "Failed to analyze meal. Please try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddFavourite = async (fav: any) => {
    try {
      const timestamp = getTimestampForSelectedDate();
      const newFoodItem: FoodItem = {
        id: Date.now().toString(),
        name: fav.name,
        description: "Added from favourites",
        calories: fav.calories,
        protein: fav.protein,
        carbs: fav.carbs,
        fat: fav.fat,
        timestamp: timestamp,
        mealType: selectedMealType,
      };

      await addFoodItem(newFoodItem);

      // Track event
      posthog?.capture("meal_added", {
        meal_type: selectedMealType,
        calories: newFoodItem.calories,
        is_favourite: true,
        is_ai: false,
      });

      router.back();
    } catch (error) {
      console.error("Error adding favourite meal:", error);
      posthog?.captureException(error);
      showAlert("Error", "Failed to add favourite meal.", "error");
    }
  };

  const handleAddManualMeal = async () => {
    if (!description.trim()) {
      showAlert("Error", "Please enter a meal name.", "error");
      return;
    }

    try {
      const calories = parseInt(manualCalories) || 200;
      const protein = parseInt(manualProtein) || 10;
      const carbs = parseInt(manualCarbs) || 30;
      const fat = parseInt(manualFat) || 10;

      const timestamp = getTimestampForSelectedDate();
      const newFoodItem: FoodItem = {
        id: Date.now().toString(),
        name: description.trim(),
        description: "Manually entered",
        calories,
        protein,
        carbs,
        fat,
        timestamp: timestamp,
        mealType: selectedMealType,
      };

      await addFoodItem(newFoodItem);

      // Track event
      posthog?.capture("meal_added", {
        meal_type: selectedMealType,
        calories: newFoodItem.calories,
        is_manual: true,
        is_ai: false,
      });

      router.back();
    } catch (error) {
      console.error("Error adding manual meal:", error);
      posthog?.captureException(error);
      showAlert("Error", "Failed to add meal.", "error");
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Meal Type Selection - Always Visible */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What meal is this?</Text>
            <Text style={styles.sectionSubtitle}>
              Based on the time, we suggest:{" "}
              <Text style={styles.suggestionText}>
                {
                  MEAL_OPTIONS.find((m) => m.type === getSuggestedMealType())
                    ?.label
                }
              </Text>
            </Text>

            <View style={styles.mealOptionsContainer}>
              {MEAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.mealOption,
                    selectedMealType === option.type &&
                      styles.mealOptionSelected,
                  ]}
                  onPress={() => setSelectedMealType(option.type)}
                >
                  <Ionicons
                    name={option.icon}
                    size={28}
                    color={
                      selectedMealType === option.type
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.mealOptionLabel,
                      selectedMealType === option.type &&
                        styles.mealOptionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "ai" && styles.tabActive]}
              onPress={() => setActiveTab("ai")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "ai" && styles.tabTextActive,
                ]}
              >
                AI Input
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "favourites" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("favourites")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "favourites" && styles.tabTextActive,
                ]}
              >
                Favourites
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "manual" && styles.tabActive]}
              onPress={() => setActiveTab("manual")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "manual" && styles.tabTextActive,
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "ai" ? (
            /* AI Input Section */
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What did you eat?</Text>
              <Text style={styles.sectionSubtitle}>
                Describe your meal in detail for accurate nutrition analysis
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 2 eggs, toast with butter, and a glass of orange juice"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                  maxLength={200}
                />
                <Text
                  style={{
                    textAlign: "right",
                    color: description.length >= 200 ? "red" : colors.textMuted,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {description.length}/200
                </Text>
              </View>

              <View style={styles.tipContainer}>
                <Ionicons name="bulb-outline" size={18} color="#FF9800" />
                <Text style={styles.tipText}>
                  Tip: Include portions and cooking methods for better
                  estimates. You can describe meals in your local language too!
                </Text>
              </View>

              {/* AI Usage Indicator for free users (not for BYOK) */}
              {!isPremium() && tier !== "byok" && (
                <TouchableOpacity
                  style={styles.usageContainer}
                  onPress={() => router.push("/upgrade")}
                >
                  <View style={styles.usageInfo}>
                    <Ionicons
                      name="sparkles"
                      size={16}
                      color={remainingMeals > 0 ? colors.primary : colors.error}
                    />
                    <Text
                      style={[
                        styles.usageText,
                        remainingMeals === 0 && { color: colors.error },
                      ]}
                    >
                      {remainingMeals > 0
                        ? `${remainingMeals} free AI meal${
                            remainingMeals !== 1 ? "s" : ""
                          } left today`
                        : "Daily limit reached"}
                    </Text>
                  </View>
                  <Text style={styles.upgradeLink}>Upgrade →</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : activeTab === "favourites" ? (
            /* Favourites Section */
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Favourites</Text>
              {favourites.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="star-outline"
                    size={48}
                    color={colors.textMuted}
                  />
                  <Text style={styles.emptyStateText}>No favourites yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Save meals from your history or settings to see them here.
                  </Text>
                </View>
              ) : (
                <View style={styles.favouritesList}>
                  {favourites.map((fav) => (
                    <TouchableOpacity
                      key={fav.id}
                      style={styles.favouriteItem}
                      onPress={() => handleAddFavourite(fav)}
                    >
                      <View style={styles.favouriteContent}>
                        <Text style={styles.favouriteName}>{fav.name}</Text>
                        <Text style={styles.favouriteCalories}>
                          {fav.calories} kcal
                        </Text>
                        <Text style={styles.favouriteMacros}>
                          P: {Math.round(fav.protein)}g • C:{" "}
                          {Math.round(fav.carbs)}g • F: {Math.round(fav.fat)}g
                        </Text>
                      </View>
                      <Ionicons
                        name="add-circle"
                        size={28}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            /* Manual Entry Section */
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Meal Manually</Text>
              <Text style={styles.sectionSubtitle}>
                No problem! Enter the meal details below.
              </Text>

              {/* Meal Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Meal Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Chicken Rice"
                  placeholderTextColor={colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Nutrition Info Inputs */}
              <Text style={styles.inputLabel}>
                Nutrition Info (per serving)
              </Text>

              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <TextInput
                    style={styles.nutritionInputField}
                    placeholder="200"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={manualCalories}
                    onChangeText={setManualCalories}
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.nutritionInputField}
                    placeholder="10"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={manualProtein}
                    onChangeText={setManualProtein}
                  />
                </View>
              </View>

              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.nutritionInputField}
                    placeholder="30"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={manualCarbs}
                    onChangeText={setManualCarbs}
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.nutritionInputField}
                    placeholder="10"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={manualFat}
                    onChangeText={setManualFat}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Add Button - For AI and Manual Tabs */}
        {(activeTab === "ai" || activeTab === "manual") && (
          <View
            style={[
              styles.buttonContainer,
              { paddingBottom: spacing.lg + insets.bottom },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.addButton,
                (!description.trim() || isAnalyzing) &&
                  styles.addButtonDisabled,
              ]}
              onPress={
                activeTab === "manual" ? handleAddManualMeal : handleAddMeal
              }
              disabled={!description.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator color="white" style={styles.buttonIcon} />
                  <Text style={styles.addButtonText}>
                    {activeTab === "manual" ? "Adding..." : "Analyzing..."}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.addButtonText}>
                    {activeTab === "manual" ? "Save Meal" : "Add Meal"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
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
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.xxl,
    },
    sectionTitle: {
      fontSize: typography.xl,
      fontFamily: typography.fontBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    suggestionText: {
      fontFamily: typography.fontSemibold,
      color: colors.primary,
    },
    mealOptionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    mealOption: {
      width: "47%",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
      ...shadows.sm,
    },
    mealOptionSelected: {
      backgroundColor: colors.primaryBg,
      borderColor: colors.primary,
    },
    mealOptionLabel: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginTop: spacing.sm,
    },
    mealOptionLabelSelected: {
      color: colors.primary,
    },
    inputContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.sm,
    },
    textInput: {
      fontSize: typography.base,
      fontFamily: typography.fontRegular,
      color: colors.textPrimary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    tipContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    tipText: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
      flex: 1,
    },
    usageContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: borderRadius.md,
    },
    usageInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    usageText: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
    },
    upgradeLink: {
      fontSize: typography.sm,
      fontFamily: typography.fontSemibold,
      color: colors.primary,
    },
    buttonContainer: {
      paddingTop: spacing.lg,
      paddingLeft: spacing.lg,
      paddingRight: spacing.lg,
      backgroundColor: colors.background,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      ...shadows.xl,
    },
    addButtonDisabled: {
      backgroundColor: colors.textMuted,
      shadowOpacity: 0,
    },
    buttonIcon: {
      marginRight: spacing.sm,
    },
    addButtonText: {
      color: colors.textInverse,
      fontSize: typography.lg,
      fontFamily: typography.fontBold,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: 4,
      marginBottom: spacing.xl,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: "center",
      borderRadius: borderRadius.sm,
    },
    tabActive: {
      backgroundColor: colors.primaryBg,
    },
    tabText: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.primary,
      fontFamily: typography.fontSemibold,
    },
    favouritesList: {
      gap: spacing.md,
    },
    favouriteItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      ...shadows.sm,
    },
    favouriteContent: {
      flex: 1,
    },
    favouriteName: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    favouriteCalories: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.primary,
      marginTop: 2,
    },
    favouriteMacros: {
      fontSize: typography.xs,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      marginTop: 2,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
      gap: spacing.md,
    },
    emptyStateText: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textSecondary,
    },
    emptyStateSubtext: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      textAlign: "center",
    },
    inputLabel: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    nutritionGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    nutritionInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    nutritionLabel: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    nutritionInputField: {
      fontSize: typography.base,
      fontFamily: typography.fontRegular,
      color: colors.textPrimary,
      padding: spacing.md,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: borderRadius.md,
      minHeight: 44,
    },
  });
