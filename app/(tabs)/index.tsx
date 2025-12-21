import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "expo-sqlite/kv-store";
import ConfettiCannon from "react-native-confetti-cannon";
import { StatsCard } from "../../components/StatsCard";
import { Header } from "../../components/Header";
import { FoodLogItem } from "../../components/food/FoodLogItem";
import { FoodItem } from "../../lib/models/food";
import { useFoodStore } from "../../store/foodStore";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, shadows, borderRadius } from "../../lib/theme";

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CONFETTI_STORAGE_KEY = "last_confetti_date";

export default function HomeScreen() {
  const {
    foodItems,
    isLoading,
    loadData,
    getDailyStats,
    selectedDate,
  } = useFoodStore();
  const { colors } = useTheme();
  const dailyStats = getDailyStats();
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Check for goal achievement and trigger confetti
  useEffect(() => {
    const checkGoalAchievement = async () => {
      if (
        dailyStats.caloriesTotal >= dailyStats.calorieGoal &&
        dailyStats.calorieGoal > 0
      ) {
        const today = new Date().toISOString().split("T")[0];
        const lastCelebratedDate = await AsyncStorage.getItem(
          CONFETTI_STORAGE_KEY
        );

        if (lastCelebratedDate !== today) {
          setShowConfetti(true);
          await AsyncStorage.setItem(CONFETTI_STORAGE_KEY, today);
          // Auto-hide confetti after animation
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    };

    checkGoalAchievement();
  }, [dailyStats.caloriesTotal, dailyStats.calorieGoal]);

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

  const styles = createStyles(colors);

  const headerTitle = useMemo(() => {
    const todayId = new Date().toISOString().split("T")[0];
    if (selectedDate === todayId) {
      return "Today's Food Log";
    }

    const dateObj = new Date(selectedDate);
    const weekday = WEEKDAY_NAMES[dateObj.getDay()];
    const month = MONTH_NAMES_SHORT[dateObj.getMonth()];
    const day = dateObj.getDate();
    return `Food Log • ${weekday}, ${month} ${day}`;
  }, [selectedDate]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <StatsCard stats={dailyStats} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{headerTitle}</Text>
          <Text style={styles.sectionCount}>{foodItems.length} items</Text>
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
        {foodItems.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="restaurant-outline"
                size={48}
                color={colors.textMuted}
              />
            </View>
            <Text style={styles.emptyStateTitle}>No meals logged yet</Text>
            <Text style={styles.emptyStateText}>
              Tap the + button to add your first meal and start tracking!
            </Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Add Food Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-meal")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color={colors.textInverse} />
      </TouchableOpacity>

      {/* Confetti celebration */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: Dimensions.get("window").width / 2, y: -10 }}
          fadeOut
          explosionSpeed={350}
          fallSpeed={3000}
          colors={[colors.primary, "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"]}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    sectionCount: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textMuted,
    },
    mealSection: {
      marginBottom: spacing.sm,
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
    addButton: {
      position: "absolute",
      bottom: spacing.xl,
      right: spacing.xl,
      width: 64,
      height: 64,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.lg,
    },
    spacer: {
      height: 100,
    },
  });
