import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";

import { WeightGoal } from "../../lib/models/userProfile";

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
  weightGoal: WeightGoal;
}

export function CalorieChart({
  stats,
  period,
  calorieGoal,
  maxCalories,
  weightGoal,
}: CalorieChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const screenWidth = Dimensions.get("window").width;
  const padding = spacing.lg * 2;
  const availableWidth = screenWidth - padding - (spacing.lg * 2); // Internal padding
  
  // Width calculations
  const barGap = period === "weekly" ? 12 : 6;
  const barWidth = period === "weekly" 
    ? (availableWidth - (6 * barGap)) / 7 
    : 16; // Fixed width for monthly with scroll

  const isGaining = weightGoal === "gain";

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          {period === "weekly" ? "Weekly Activity" : "Monthly Progress"}
        </Text>
        <View style={styles.goalPill}>
          <Text style={styles.goalPillText}>{calorieGoal} kcal goal</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={period === "monthly"}
        contentContainerStyle={[
          styles.scrollContent,
          period === "weekly" && { width: '100%', justifyContent: 'space-between' }
        ]}
      >
        <View style={[styles.barsContainer, period === "weekly" && { width: '100%', justifyContent: 'space-between' }]}>
          {stats.map((day, index) => {
            const barHeight = maxCalories > 0 ? (day.calories / maxCalories) * CHART_HEIGHT : 0;
            const goalHeight = (calorieGoal / maxCalories) * CHART_HEIGHT;
            
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const showLabel = period === "weekly" || (index % 5 === 0) || index === stats.length - 1;

            // Dynamic color logic based on pre-calculated metGoal
            let barColor = colors.divider; // Default for no data (Grey)
            if (day.calories > 0) {
              barColor = day.metGoal ? colors.primary : colors.error;
            }

            return (
              <View key={day.date} style={[styles.barColumn, { width: barWidth, marginRight: period === "monthly" ? barGap : 0 }]}>
                <View style={styles.barTrack}>
                  {/* Goal Line Reference */}
                  <View 
                    style={[
                      styles.goalReferenceLine, 
                      { bottom: goalHeight, backgroundColor: colors.primary, opacity: 0.2 }
                    ]} 
                  />
                  
                  {/* The Bar */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 4),
                        backgroundColor: barColor,
                        opacity: isToday ? 1 : 0.8,
                      },
                    ]}
                  />
                </View>
                {showLabel && (
                  <Text style={[styles.barLabel, isToday && { color: colors.primary, fontFamily: typography.fontBold }]}>
                    {day.label}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Goal Met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Goal Not Met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.divider }]} />
          <Text style={styles.legendText}>No Data</Text>
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
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.sm,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    chartTitle: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    goalPill: {
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    goalPillText: {
      fontSize: typography.xs,
      fontFamily: typography.fontMedium,
      color: colors.primary,
    },
    scrollContent: {
      paddingBottom: spacing.sm,
    },
    barsContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      height: CHART_HEIGHT + 30, // Extra space for labels
    },
    barColumn: {
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    barTrack: {
      width: '100%',
      height: CHART_HEIGHT,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      justifyContent: 'flex-end',
      position: 'relative',
    },
    bar: {
      width: '100%',
      borderRadius: borderRadius.full,
    },
    goalReferenceLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      zIndex: 1,
    },
    barLabel: {
      fontSize: 10,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      marginTop: spacing.xs,
      height: 14,
    },
    legend: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.md,
      marginTop: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 11,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
    },
  });
