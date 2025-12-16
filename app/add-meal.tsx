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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FoodItem } from "../lib/models/food";
import { getFoodNutritionInfo, isGeminiInitialized } from "../lib/gemini";
import { useFoodContext } from "../lib/FoodContext";
import {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
} from "../lib/theme";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface MealOption {
  type: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  timeRange: string;
}

const mealOptions: MealOption[] = [
  {
    type: "breakfast",
    label: "Breakfast",
    icon: "sunny-outline",
    timeRange: "6 AM - 10 AM",
  },
  {
    type: "lunch",
    label: "Lunch",
    icon: "restaurant-outline",
    timeRange: "11 AM - 2 PM",
  },
  {
    type: "dinner",
    label: "Dinner",
    icon: "moon-outline",
    timeRange: "6 PM - 9 PM",
  },
  {
    type: "snack",
    label: "Snack",
    icon: "cafe-outline",
    timeRange: "Anytime",
  },
];

// Suggest meal type based on current time
const getSuggestedMealType = (): MealType => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) return "breakfast";
  if (hour >= 11 && hour < 14) return "lunch";
  if (hour >= 18 && hour < 21) return "dinner";
  return "snack";
};

export default function AddMealScreen() {
  const { addFoodItem } = useFoodContext();
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    getSuggestedMealType()
  );
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddMeal = async () => {
    if (!description.trim()) {
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get nutrition info from Gemini
      const nutritionInfo = await getFoodNutritionInfo(description);

      // Log the Gemini response
      console.log("Gemini response:", nutritionInfo);

      const newFoodItem: FoodItem = {
        id: Date.now().toString(),
        name: nutritionInfo.name || description,
        description: description.trim(),
        calories: nutritionInfo.calories,
        protein: nutritionInfo.protein,
        carbs: nutritionInfo.carbs,
        fat: nutritionInfo.fat,
        timestamp: Date.now(),
        mealType: selectedMealType,
      };

      // Save to context (now persists to SQLite)
      await addFoodItem(newFoodItem);
      console.log("New food item added:", newFoodItem);

      // Navigate back to home
      router.back();
    } catch (error) {
      console.error("Error adding meal:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
          {/* Meal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What meal is this?</Text>
            <Text style={styles.sectionSubtitle}>
              Based on the time, we suggest:{" "}
              <Text style={styles.suggestionText}>
                {
                  mealOptions.find((m) => m.type === getSuggestedMealType())
                    ?.label
                }
              </Text>
            </Text>

            <View style={styles.mealOptionsContainer}>
              {mealOptions.map((option) => (
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
                      selectedMealType === option.type ? "white" : "#5E60CE"
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
                  <Text
                    style={[
                      styles.mealOptionTime,
                      selectedMealType === option.type &&
                        styles.mealOptionTimeSelected,
                    ]}
                  >
                    {option.timeRange}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Food Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What did you eat?</Text>
            <Text style={styles.sectionSubtitle}>
              Describe your meal in detail for accurate nutrition analysis
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 2 eggs, toast with butter, and a glass of orange juice"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.tipContainer}>
              <Ionicons name="bulb-outline" size={18} color="#FF9800" />
              <Text style={styles.tipText}>
                Tip: Include portions and cooking methods for better estimates
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons
                name="language-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.tipText}>
                You can use local food names in any language!
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Add Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.addButton,
              (!description.trim() || isAnalyzing) && styles.addButtonDisabled,
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  suggestionText: {
    fontWeight: typography.semibold,
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealOptionLabel: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  mealOptionLabelSelected: {
    color: colors.textInverse,
  },
  mealOptionTime: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  mealOptionTimeSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  textInput: {
    fontSize: typography.base,
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
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  buttonContainer: {
    padding: spacing.lg,
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
    fontWeight: typography.bold,
  },
});
