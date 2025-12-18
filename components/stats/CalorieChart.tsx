import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius } from "../../lib/theme";

const CHART_HEIGHT = 150;

interface DayStats {
  date: string;
  label: string;
  calories: number;
  metGoal: boolean;
}

interface CalorieChartProps {
  stats: DayStats[];
  period: "weekly" | "monthly";
  calorieGoal: number;
  maxCalories: number;
}

export function CalorieChart({
  stats,
  period,
  calorieGoal,
  maxCalories,
}: CalorieChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const screenWidth = Dimensions.get("window").width;
  const chartPadding = spacing.lg * 2;
  const barGap = period === "weekly" ? 12 : 4;
  const barWidth =
    period === "weekly"
      ? (screenWidth - chartPadding - 7 * barGap) / 7
      : 10;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>
        {period === "weekly" ? "Last 7 Days" : "Last 30 Days"}
      </Text>

      {/* Goal line indicator */}
      <View style={styles.goalIndicator}>
        <View style={[styles.goalLine, { backgroundColor: colors.primary }]} />
        <Text style={styles.goalText}>Goal: {calorieGoal} kcal</Text>
      </View>

      {/* Bars */}
      <ScrollView
        horizontal={period === "monthly"}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={period === "monthly"}
        contentContainerStyle={
          period === "monthly" ? styles.monthlyScrollContent : undefined
        }
      >
        <View style={styles.chartContent}>
          {/* Goal reference line */}
          <View
            style={[
              styles.goalReferenceLine,
              {
                bottom: (calorieGoal / maxCalories) * CHART_HEIGHT,
                backgroundColor: colors.primary,
              },
            ]}
          />
          <View
            style={[
              styles.barsContainer,
              period === "monthly" && styles.monthlyBarsContainer,
            ]}
          >
            {stats.map((day, index) => {
              const barHeight =
                maxCalories > 0
                  ? (day.calories / maxCalories) * CHART_HEIGHT
                  : 0;

              const showLabel =
                period === "weekly" ||
                index === 0 ||
                index === stats.length - 1 ||
                (index + 1) % 7 === 0;

              return (
                <View
                  key={day.date}
                  style={[styles.barWrapper, { marginHorizontal: barGap / 2 }]}
                >
                  <View style={[styles.barContainer, { height: CHART_HEIGHT }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, 4),
                          width: barWidth,
                          backgroundColor: day.metGoal
                            ? colors.success
                            : day.calories > 0
                            ? colors.error
                            : colors.divider,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      {
                        width: barWidth + barGap,
                        opacity: showLabel ? 1 : 0,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Goal Met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Goal Missed</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
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
  });
