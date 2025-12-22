import { useState, useCallback, useRef, useEffect } from "react";
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
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";
import { getDatabase } from "../../lib/database";
import { useProfileStore } from "../../store/profileStore";
import { useFoodStore } from "../../store/foodStore";
import {
  usePremiumStore,
  canAccessFeature,
  PREMIUM_FEATURES,
} from "../../store/premiumStore";
import { CalorieChart } from "../../components/stats/CalorieChart";
import { spacing, typography, borderRadius } from "../../lib/theme";

type Period = "weekly" | "monthly";

interface DayStats {
  date: string;
  label: string;
  calories: number;
  metGoal: boolean;
}

interface DailyCalorieRow {
  dateKey: string;
  totalCalories: number;
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const { profile } = useProfileStore();
  const { goals } = useFoodStore();
  const isPremium = usePremiumStore((state) => state.isPremium());
  const [period, setPeriod] = useState<Period>("weekly");
  const [stats, setStats] = useState<DayStats[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [avgCalories, setAvgCalories] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isGainingWeight = profile?.weightGoal === "gain";
  const isFocused = useIsFocused();
  const lastUpdated = useFoodStore((state) => state.lastUpdated);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const db = await getDatabase();

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      let startDate: Date;
      let days: number;

      if (period === "weekly") {
        days = 7;
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days + 1);
        startDate.setHours(0, 0, 0, 0);
      } else {
        // For monthly: show current calendar month from 1st to today
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        days = today.getDate(); // Number of days in current month so far
      }

      const dailyData = await db.getAllAsync<DailyCalorieRow>(
        `SELECT date(timestamp/1000, 'unixepoch', 'localtime') as dateKey, 
                SUM(calories) as totalCalories 
         FROM food_items 
         WHERE timestamp >= ? AND timestamp <= ? 
         GROUP BY dateKey 
         ORDER BY dateKey ASC`,
        [startDate.getTime(), today.getTime()]
      );

      const dailyCalories: Record<string, number> = {};
      dailyData.forEach((row) => {
        dailyCalories[row.dateKey] = row.totalCalories;
      });

      const getMetGoal = (cals: number) => {
        if (cals === 0) return false;
        return isGainingWeight
          ? cals >= goals.calorieGoal
          : cals <= goals.calorieGoal;
      };

      const statsArray: DayStats[] = [];
      let totalCalories = 0;
      let daysWithData = 0;

      // For monthly stats, iterate through all days of current month
      const daysToShow = period === "weekly" ? days : today.getDate();

      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const calories = dailyCalories[dateKey] || 0;

        let label: string;
        if (period === "weekly") {
          label = date.toLocaleDateString("en-US", { weekday: "short" });
        } else {
          label = date.getDate().toString();
        }

        const metGoal = getMetGoal(calories);
        statsArray.push({ date: dateKey, label, calories, metGoal });

        if (calories > 0) {
          totalCalories += calories;
          daysWithData++;
        }
      }

      setStats(statsArray);
      setAvgCalories(
        daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0
      );

      const allDailyData = await db.getAllAsync<DailyCalorieRow>(
        `SELECT date(timestamp/1000, 'unixepoch', 'localtime') as dateKey, 
                SUM(calories) as totalCalories 
         FROM food_items 
         GROUP BY dateKey 
         ORDER BY dateKey DESC`
      );

      const allDailyCalories: Record<string, number> = {};
      allDailyData.forEach((row) => {
        allDailyCalories[row.dateKey] = row.totalCalories;
      });

      let current = 0;
      const checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      const todayKey = `${checkDate.getFullYear()}-${String(
        checkDate.getMonth() + 1
      ).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

      // If today has no records, start checking from yesterday for the streak
      if (!allDailyCalories[todayKey]) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateKey = `${checkDate.getFullYear()}-${String(
          checkDate.getMonth() + 1
        ).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
        const calories = allDailyCalories[dateKey] || 0;

        if (getMetGoal(calories)) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // If we are checking today and they haven't logged yet, continue to yesterday
          if (dateKey === todayKey && calories === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          break;
        }
      }

      let best = 0;
      let tempStreak = 0;

      const allDates = Object.keys(allDailyCalories).sort();
      if (allDates.length > 0) {
        const firstDate = new Date(allDates[0]);
        const lastDate = new Date(); // To today
        lastDate.setHours(0, 0, 0, 0);

        const currentCheck = new Date(firstDate);
        while (currentCheck <= lastDate) {
          const dateKey = `${currentCheck.getFullYear()}-${String(
            currentCheck.getMonth() + 1
          ).padStart(2, "0")}-${String(currentCheck.getDate()).padStart(
            2,
            "0"
          )}`;

          if (getMetGoal(allDailyCalories[dateKey] || 0)) {
            tempStreak++;
            best = Math.max(best, tempStreak);
          } else {
            tempStreak = 0;
          }
          currentCheck.setDate(currentCheck.getDate() + 1);
        }
      }

      setCurrentStreak(current);
      setBestStreak(Math.max(best, current));
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [period, profile?.weightGoal, goals.calorieGoal, isGainingWeight]);

  useEffect(() => {
    if (isFocused) {
      useProfileStore.getState().loadProfile();
      loadStats();
    }
  }, [isFocused, lastUpdated, loadStats]);

  const maxCalories = Math.max(
    ...stats.map((s) => s.calories),
    goals.calorieGoal,
    1
  );
  const styles = createStyles(colors);

  const getSubtitle = () => {
    switch (profile?.weightGoal) {
      case "gain":
        return "Tracking your weight gain";
      case "lose":
        return "Tracking your weight loss";
      case "maintain":
        return "Tracking your maintenance";
      default:
        return "Track your progress";
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSubtitle}>{getSubtitle()}</Text>
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
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>{getSubtitle()}</Text>
      </View>

      {/* Period Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            period === "weekly" && styles.toggleButtonActive,
          ]}
          onPress={() => setPeriod("weekly")}
        >
          <Text
            style={[
              styles.toggleText,
              period === "weekly" && styles.toggleTextActive,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            period === "monthly" && styles.toggleButtonActive,
            !isPremium && styles.toggleButtonDisabled,
          ]}
          onPress={() => {
            if (!isPremium) {
              router.push("/upgrade");
            } else {
              setPeriod("monthly");
            }
          }}
        >
          <View style={styles.monthlyToggleContent}>
            <Text
              style={[
                styles.toggleText,
                period === "monthly" && styles.toggleTextActive,
              ]}
            >
              Monthly
            </Text>
            {!isPremium && (
              <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: colors.primaryBg },
              ]}
            >
              <Ionicons name="flame" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}
            >
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#EDE9FE" }]}
            >
              <Ionicons name="analytics" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{avgCalories}</Text>
            <Text style={styles.statLabel}>Avg. Calories</Text>
          </View>
        </View>

        {/* Chart */}
        <CalorieChart
          stats={stats}
          period={period}
          calorieGoal={goals.calorieGoal}
          maxCalories={maxCalories}
          weightGoal={profile?.weightGoal || "maintain"}
        />

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {period === "weekly" ? "This Week" : "This Month"}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Goals met ({period === "weekly" ? "7d" : "30d"})
            </Text>
            <Text style={styles.summaryValue}>
              {stats.filter((s) => s.metGoal).length} days
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Compliance rate</Text>
            <Text style={styles.summaryValue}>
              {stats.filter((s) => s.calories > 0).length > 0
                ? Math.round(
                    (stats.filter((s) => s.metGoal).length /
                      stats.filter((s) => s.calories > 0).length) *
                      100
                  )
                : 0}
              %
            </Text>
          </View>
        </View>

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
    toggleContainer: {
      flexDirection: "row",
      marginHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: 4,
      marginBottom: spacing.lg,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: "center",
      borderRadius: borderRadius.md,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    toggleButtonDisabled: {
      opacity: 0.6,
    },
    monthlyToggleContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    toggleText: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textMuted,
    },
    toggleTextActive: {
      color: colors.textInverse,
    },
    scrollContainer: {
      flex: 1,
    },
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: "center",
    },
    statIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    statValue: {
      fontSize: typography.xl,
      fontFamily: typography.fontBold,
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: typography.xs,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 2,
    },
    chartContainer: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    chartTitle: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    goalIndicator: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    goalLine: {
      width: 20,
      height: 2,
      marginRight: spacing.sm,
    },
    goalText: {
      fontSize: typography.xs,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    chartContent: {
      position: "relative",
      paddingBottom: spacing.md,
    },
    goalReferenceLine: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 2,
      borderRadius: 1,
      opacity: 0.3,
      zIndex: 1,
    },
    monthlyScrollContent: {
      paddingRight: spacing.lg,
    },
    barsContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    monthlyBarsContainer: {
      justifyContent: "flex-start",
    },
    barWrapper: {
      alignItems: "center",
    },
    barContainer: {
      justifyContent: "flex-end",
    },
    bar: {
      borderRadius: 3,
    },
    barLabel: {
      fontSize: 10,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      marginTop: spacing.xs,
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    legend: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.lg,
      marginTop: spacing.md,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: spacing.xs,
    },
    legendText: {
      fontSize: typography.xs,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    summaryTitle: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    summaryLabel: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    summaryValue: {
      fontSize: typography.sm,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    spacer: {
      height: 40,
    },
  });
