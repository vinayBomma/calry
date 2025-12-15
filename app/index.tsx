import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatsCard } from "../components/StatsCard";
import { FoodLogItem } from "../components/FoodLogItem";
import { FoodItem } from "../lib/models/food";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFoodContext } from "../lib/FoodContext";

export default function HomeScreen() {
  // Get food items and stats from context
  const { foodItems, dailyStats } = useFoodContext();

  // Group food items by meal type
  const foodByMealType = useMemo(() => {
    return foodItems.reduce<Record<string, FoodItem[]>>((acc, item) => {
      if (!acc[item.mealType]) {
        acc[item.mealType] = [];
      }
      acc[item.mealType].push(item);
      return acc;
    }, {});
  }, [foodItems]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollContainer}>
        <StatsCard stats={dailyStats} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Food Log</Text>
        </View>

        {/* Render food items by meal type */}
        {Object.entries(foodByMealType).map(([mealType, items]) => (
          <View key={mealType} style={styles.mealSection}>
            {items.map((item) => (
              <FoodLogItem key={item.id} item={item} />
            ))}
          </View>
        ))}

        {/* Empty state if no food logged */}
        {foodItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No food logged today. Tap the + button to add your first meal!
            </Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Add Food Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-meal")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  mealSection: {
    marginBottom: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    backgroundColor: "#5E60CE",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  spacer: {
    height: 80,
  },
});
