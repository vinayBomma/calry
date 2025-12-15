import { StyleSheet, View, Text } from "react-native";
import { DailyStats } from "../lib/models/food";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StatsCardProps {
  stats: DailyStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  const caloriePercentage = Math.min(
    Math.round((stats.caloriesTotal / stats.calorieGoal) * 100),
    100
  );

  const formatMacro = (current: number, goal: number) => {
    return `${current}g / ${goal}g`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.calorieContainer}>
        <Text style={styles.calorieTitle}>Calories</Text>
        <Text style={styles.calorieValue}>
          {stats.caloriesTotal}{" "}
          <Text style={styles.goalText}>/ {stats.calorieGoal}</Text>
        </Text>

        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${caloriePercentage}%` }]}
          />
        </View>
        <Text style={styles.percentageText}>{caloriePercentage}%</Text>
      </View>

      <View style={styles.macrosContainer}>
        <MacroItem
          label="Protein"
          value={formatMacro(stats.proteinTotal, stats.proteinGoal)}
          color="#FF9800"
        />
        <MacroItem
          label="Carbs"
          value={formatMacro(stats.carbsTotal, stats.carbsGoal)}
          color="#4CAF50"
        />
        <MacroItem
          label="Fat"
          value={formatMacro(stats.fatTotal, stats.fatGoal)}
          color="#2196F3"
        />
      </View>
    </View>
  );
}

interface MacroItemProps {
  label: string;
  value: string;
  color: string;
}

function MacroItem({ label, value, color }: MacroItemProps) {
  // Get the appropriate icon for each macro
  const getIconName = () => {
    switch (label) {
      case "Protein":
        return "food-steak";
      case "Carbs":
        return "bread-slice";
      case "Fat":
        return "oil";
      default:
        return "food";
    }
  };

  return (
    <View style={styles.macroItem}>
      <MaterialCommunityIcons
        name={getIconName()}
        size={18}
        color={color}
        style={styles.macroIcon}
      />
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calorieContainer: {
    marginBottom: 16,
  },
  calorieTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginVertical: 4,
  },
  goalText: {
    fontSize: 20,
    fontWeight: "normal",
    color: "#666",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#5E60CE",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5E60CE",
    marginTop: 4,
    textAlign: "right",
  },
  macrosContainer: {
    marginTop: 8,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  macroLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  macroValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  macroIcon: {
    marginRight: 8,
  },
});
