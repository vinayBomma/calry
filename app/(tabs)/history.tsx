import { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";
import { FoodItem } from "../../lib/models/food";
import { FoodLogItem } from "../../components/food/FoodLogItem";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius } from "../../lib/theme";

interface DayData {
  date: string;
  dateLabel: string;
  items: FoodItem[];
  totalCalories: number;
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [historyData, setHistoryData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const db = await SQLite.openDatabaseAsync("snacktrack.db");

      // Get all food items grouped by date
      const items = await db.getAllAsync<FoodItem>(
        "SELECT * FROM food_items ORDER BY timestamp DESC"
      );

      // Group by date
      const groupedByDate: Record<string, FoodItem[]> = {};
      items.forEach((item) => {
        const date = new Date(item.timestamp);
        const dateKey = date.toISOString().split("T")[0];
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(item);
      });

      // Convert to array with labels
      const historyArray: DayData[] = Object.entries(groupedByDate).map(
        ([dateKey, dayItems]) => {
          const date = new Date(dateKey);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          let dateLabel: string;
          if (date.toDateString() === today.toDateString()) {
            dateLabel = "Today";
          } else if (date.toDateString() === yesterday.toDateString()) {
            dateLabel = "Yesterday";
          } else {
            dateLabel = date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            });
          }

          const totalCalories = dayItems.reduce(
            (sum, item) => sum + item.calories,
            0
          );

          return {
            date: dateKey,
            dateLabel,
            items: dayItems,
            totalCalories,
          };
        }
      );

      setHistoryData(historyArray);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const styles = createStyles(colors);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>Your nutrition journey</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {historyData.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={colors.textMuted}
              />
            </View>
            <Text style={styles.emptyStateTitle}>No history yet</Text>
            <Text style={styles.emptyStateText}>
              Start logging your meals to see your history here.
            </Text>
          </View>
        ) : (
          historyData.map((day) => (
            <View key={day.date} style={styles.daySection}>
              <TouchableOpacity
                style={styles.dayHeader}
                onPress={() => toggleExpand(day.date)}
                activeOpacity={0.7}
              >
                <View style={styles.dayInfo}>
                  <Text style={styles.dayLabel}>{day.dateLabel}</Text>
                  <Text style={styles.dayStats}>
                    {day.items.length} meals · {day.totalCalories} kcal
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedDate === day.date ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {expandedDate === day.date && (
                <View style={styles.dayItems}>
                  {day.items.map((item) => (
                    <FoodLogItem key={item.id} item={item} />
                  ))}
                </View>
              )}
            </View>
          ))
        )}

        <View style={styles.spacer} />
      </ScrollView>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContainer: {
      flex: 1,
    },
    daySection: {
      marginBottom: spacing.sm,
    },
    dayHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    dayInfo: {
      flex: 1,
    },
    dayLabel: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    dayStats: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    dayItems: {
      marginTop: spacing.sm,
    },
    emptyState: {
      padding: spacing.xxxl,
      alignItems: "center",
      marginTop: spacing.xl,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.divider,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    emptyStateTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    emptyStateText: {
      color: colors.textSecondary,
      fontSize: typography.base,
      fontFamily: typography.fontRegular,
      textAlign: "center",
      lineHeight: 24,
    },
    spacer: {
      height: 40,
    },
  });
