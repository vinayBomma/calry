import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { FoodItem } from "../lib/models/food";
import { useFoodStore } from "../store/foodStore";
import { usePremiumStore } from "../store/premiumStore";
import { useTheme } from "../lib/ThemeContext";
import { spacing, typography, shadows, borderRadius } from "../lib/theme";
import {
  MEAL_OPTIONS,
  getSuggestedMealType,
  type MealType,
} from "../lib/hooks/useMealConfig";
import ScannerScreen from "../components/scanner/ScannerScreen";
import { OpenFoodFactsProduct } from "../lib/openfoodfacts";

export default function ScanScreen() {
  const { colors } = useTheme();
  const posthog = usePostHog();
  const { addFoodItem, selectedDate } = useFoodStore();
  const { isPremium } = usePremiumStore();
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    getSuggestedMealType()
  );
  const [scanResult, setScanResult] = useState<{
    type: "barcode" | "ai";
    data: any;
  } | null>(null);
  const [showMealSelector, setShowMealSelector] = useState(false);

  const styles = createStyles(colors);

  // Helper to get timestamp for the selected date
  const getTimestampForSelectedDate = () => {
    const date = new Date(selectedDate);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return now.getTime();
    }

    date.setHours(now.getHours(), now.getMinutes(), 0, 0);
    return date.getTime();
  };

  const handleScanComplete = (result: { type: "barcode" | "ai"; data: any }) => {
    setScanResult(result);
    setShowMealSelector(true);
  };

  const handleAddFood = async (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => {
    try {
      const timestamp = getTimestampForSelectedDate();
      const newFoodItem: FoodItem = {
        id: Date.now().toString(),
        name: food.name,
        description: scanResult?.type === "barcode" ? "Scanned from barcode" : "AI food scan",
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        timestamp: timestamp,
        mealType: selectedMealType,
      };

      await addFoodItem(newFoodItem);

      // Track event
      posthog?.capture("meal_added", {
        meal_type: selectedMealType,
        calories: newFoodItem.calories,
        scan_type: scanResult?.type || "unknown",
        is_ai: scanResult?.type === "ai",
      });

      router.back();
    } catch (error) {
      console.error("Error adding scanned food:", error);
      posthog?.captureException(error);
    }
  };

  const handleAddAllFoods = async () => {
    if (!scanResult || scanResult.type !== "ai") return;

    try {
      const timestamp = getTimestampForSelectedDate();
      const foods = scanResult.data.foods;

      for (const food of foods) {
        const newFoodItem: FoodItem = {
          id: `${Date.now()}-${Math.random()}`,
          name: food.name,
          description: "AI food scan",
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          timestamp: timestamp,
          mealType: selectedMealType,
        };

        await addFoodItem(newFoodItem);
      }

      // Track event
      posthog?.capture("meal_added", {
        meal_type: selectedMealType,
        item_count: foods.length,
        scan_type: "ai",
        is_ai: true,
      });

      router.back();
    } catch (error) {
      console.error("Error adding scanned foods:", error);
      posthog?.captureException(error);
    }
  };

  // If showing result selector
  if (showMealSelector && scanResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setShowMealSelector(false);
              setScanResult(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Scanned Food</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.resultContainer}>
          {/* Meal Type Selection */}
          <Text style={styles.sectionTitle}>Select Meal Type</Text>
          <View style={styles.mealOptionsContainer}>
            {MEAL_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.mealOption,
                  selectedMealType === option.type && styles.mealOptionSelected,
                ]}
                onPress={() => setSelectedMealType(option.type)}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={
                    selectedMealType === option.type
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.mealOptionLabel,
                    selectedMealType === option.type && styles.mealOptionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scanned Items */}
          <Text style={styles.sectionTitle}>
            {scanResult.type === "barcode" ? "Product Found" : "Detected Foods"}
          </Text>

          {scanResult.type === "barcode" ? (
            // Barcode result
            <TouchableOpacity
              style={styles.foodItem}
              onPress={() => handleAddFood(scanResult.data as OpenFoodFactsProduct)}
            >
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{scanResult.data.name}</Text>
                {scanResult.data.brand && (
                  <Text style={styles.foodBrand}>{scanResult.data.brand}</Text>
                )}
                <Text style={styles.foodCalories}>
                  {scanResult.data.calories} kcal
                  {scanResult.data.servingSize && ` • ${scanResult.data.servingSize}`}
                </Text>
                <Text style={styles.foodMacros}>
                  P: {scanResult.data.protein}g • C: {scanResult.data.carbs}g • F: {scanResult.data.fat}g
                </Text>
              </View>
              <Ionicons name="add-circle" size={32} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            // AI scan results
            <>
              {scanResult.data.foods.map((food: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.foodItem}
                  onPress={() => handleAddFood(food)}
                >
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    {food.weight && (
                      <Text style={styles.foodBrand}>~{food.weight}g</Text>
                    )}
                    <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                    <Text style={styles.foodMacros}>
                      P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={32} color={colors.primary} />
                </TouchableOpacity>
              ))}

              {scanResult.data.foods.length > 1 && (
                <TouchableOpacity
                  style={styles.addAllButton}
                  onPress={handleAddAllFoods}
                >
                  <Ionicons name="checkmark-done" size={20} color="#fff" />
                  <Text style={styles.addAllButtonText}>
                    Add All ({scanResult.data.foods.length} items)
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Scanner view
  return (
    <ScannerScreen
      onScanComplete={handleScanComplete}
      onClose={() => router.back()}
    />
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    resultContainer: {
      flex: 1,
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    mealOptionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    mealOption: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    mealOptionSelected: {
      backgroundColor: colors.primaryBg,
      borderColor: colors.primary,
    },
    mealOptionLabel: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    mealOptionLabelSelected: {
      color: colors.primary,
    },
    foodItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    foodInfo: {
      flex: 1,
    },
    foodName: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    foodBrand: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
      marginTop: 2,
    },
    foodCalories: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.primary,
      marginTop: spacing.xs,
    },
    foodMacros: {
      fontSize: typography.xs,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      marginTop: 2,
    },
    addAllButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    addAllButtonText: {
      color: "#fff",
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
    },
  });
}
