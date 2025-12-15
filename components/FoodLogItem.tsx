import { StyleSheet, View, Text } from "react-native";
import { FoodItem } from "../lib/models/food";
import { Ionicons } from "@expo/vector-icons";

interface FoodLogItemProps {
  item: FoodItem;
}

export function FoodLogItem({ item }: FoodLogItemProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Badge colors by meal type
  const getMealTypeColor = (mealType: FoodItem["mealType"]) => {
    switch (mealType) {
      case "breakfast":
        return "#FF9800";
      case "lunch":
        return "#4CAF50";
      case "dinner":
        return "#2196F3";
      case "snack":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  // Get icon for meal type
  const getMealTypeIcon = (mealType: FoodItem["mealType"]) => {
    switch (mealType) {
      case "breakfast":
        return "sunny-outline";
      case "lunch":
        return "restaurant-outline";
      case "dinner":
        return "moon-outline";
      case "snack":
        return "cafe-outline";
      default:
        return "nutrition-outline";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        <View
          style={[
            styles.mealTypeBadge,
            { backgroundColor: getMealTypeColor(item.mealType) },
          ]}
        >
          <Ionicons
            name={getMealTypeIcon(item.mealType)}
            size={12}
            color="white"
            style={styles.mealTypeIcon}
          />
          <Text style={styles.mealTypeText}>
            {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsColumn}>
        <Text style={styles.nameText}>{item.name}</Text>
        <View style={styles.macrosRow}>
          <Text style={styles.calorieText}>{item.calories} cal</Text>
          <Text style={styles.macroText}>{item.protein}g protein</Text>
          <Text style={styles.macroText}>{item.carbs}g carbs</Text>
          <Text style={styles.macroText}>{item.fat}g fat</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeColumn: {
    width: 80,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  mealTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  mealTypeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsColumn: {
    flex: 1,
  },
  nameText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  macrosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  calorieText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#5E60CE",
    marginRight: 12,
  },
  macroText: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  mealTypeIcon: {
    marginRight: 4,
  },
});
