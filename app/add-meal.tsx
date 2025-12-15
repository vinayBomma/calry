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
        calories: nutritionInfo.calories,
        protein: nutritionInfo.protein,
        carbs: nutritionInfo.carbs,
        fat: nutritionInfo.fat,
        timestamp: Date.now(),
        mealType: selectedMealType,
      };

      // Save to context
      addFoodItem(newFoodItem);
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
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  suggestionText: {
    fontWeight: "600",
    color: "#5E60CE",
  },
  mealOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mealOption: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mealOptionSelected: {
    backgroundColor: "#5E60CE",
    borderColor: "#5E60CE",
  },
  mealOptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
  },
  mealOptionLabelSelected: {
    color: "white",
  },
  mealOptionTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  mealOptionTimeSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    color: "#333",
    minHeight: 120,
    lineHeight: 24,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  addButton: {
    backgroundColor: "#5E60CE",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5E60CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonDisabled: {
    backgroundColor: "#aaa",
    shadowOpacity: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
