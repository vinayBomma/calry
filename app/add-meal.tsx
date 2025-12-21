import { useState } from "react";
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
import { useTheme } from "../lib/ThemeContext";
import { spacing, typography, shadows, borderRadius } from "../lib/theme";
import {
  MEAL_OPTIONS,
  getSuggestedMealType,
  type MealType,
} from "../lib/hooks/useMealConfig";
import { AlertModal } from "../components/modals/AlertModal";

type Tab = "ai" | "favourites";

export default function AddMealScreen() {
  const { addFoodItem, favourites, selectedDate } = useFoodStore();
  const { colors } = useTheme();
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    getSuggestedMealType()
  );
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    setIsAnalyzing(true);

    try {
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
                  Tip: Include portions and cooking methods for better estimates
                </Text>
              </View>
            </View>
          ) : (
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
          )}
        </ScrollView>

        {/* Add Button - Only for AI Tab */}
        {activeTab === "ai" && (
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
              onPress={handleAddMeal}
              disabled={!description.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator color="white" style={styles.buttonIcon} />
                  <Text style={styles.addButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.addButtonText}>Add Meal</Text>
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
      fontFamily: typography.fontRegular, // Added font family
      color: colors.textPrimary,
      minHeight: 120,
      lineHeight: 24,
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
  });
