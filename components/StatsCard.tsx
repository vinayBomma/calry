import { StyleSheet, View, Text } from "react-native";
import { DailyStats } from "../lib/models/food";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, shadows, borderRadius } from "../lib/theme";

interface StatsCardProps {
  stats: DailyStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  const caloriePercentage = Math.min(
    Math.round((stats.caloriesTotal / stats.calorieGoal) * 100),
    100
  );
  const remaining = Math.max(stats.calorieGoal - stats.caloriesTotal, 0);

  return (
    <View style={styles.card}>
      {/* Calorie Header */}
      <View style={styles.calorieHeader}>
        <View style={styles.calorieInfo}>
          <View style={styles.calorieTitleRow}>
            <Ionicons name="flame" size={20} color={colors.primary} />
            <Text style={styles.calorieTitle}>Calories</Text>
          </View>
          <View style={styles.calorieValues}>
            <Text style={styles.caloriesCurrent}>{stats.caloriesTotal}</Text>
            <Text style={styles.caloriesGoal}> / {stats.calorieGoal} kcal</Text>
          </View>
        </View>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{caloriePercentage}%</Text>
        </View>
      </View>

      {/* Calorie Progress Bar */}
      <View style={styles.calorieProgressContainer}>
        <View
          style={[
            styles.calorieProgress,
            { 
              width: `${caloriePercentage}%`,
              backgroundColor: caloriePercentage >= 100 ? colors.warning : colors.primary,
            },
          ]}
        />
      </View>
      
      <View style={styles.remainingRow}>
        <Ionicons 
          name={remaining > 0 ? "trending-up" : "checkmark-circle"} 
          size={14} 
          color={remaining > 0 ? colors.success : colors.warning} 
        />
        <Text style={[styles.remainingText, { color: remaining > 0 ? colors.success : colors.warning }]}>
          {remaining > 0 ? `${remaining} kcal remaining` : 'Daily goal reached!'}
        </Text>
      </View>

      {/* Macros section */}
      <View style={styles.macrosContainer}>
        <MacroCard
          label="Protein"
          current={stats.proteinTotal}
          goal={stats.proteinGoal}
          color={colors.protein}
          icon="barbell-outline"
        />
        <MacroCard
          label="Carbs"
          current={stats.carbsTotal}
          goal={stats.carbsGoal}
          color={colors.carbs}
          icon="leaf-outline"
        />
        <MacroCard
          label="Fat"
          current={stats.fatTotal}
          goal={stats.fatGoal}
          color={colors.fat}
          icon="water-outline"
        />
      </View>
    </View>
  );
}

interface MacroCardProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function MacroCard({ label, current, goal, color, icon }: MacroCardProps) {
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  
  return (
    <View style={styles.macroCard}>
      <View style={styles.macroHeader}>
        <View style={[styles.macroIconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <Text style={styles.macroValue}>{current}<Text style={styles.macroUnit}>g</Text></Text>
      <View style={styles.macroProgressContainer}>
        <View
          style={[
            styles.macroProgress,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.macroGoalText}>{percentage}% of {goal}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  calorieHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  calorieInfo: {
    flex: 1,
  },
  calorieTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  calorieTitle: {
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  calorieValues: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  caloriesCurrent: {
    fontSize: typography.xxxl,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
  },
  caloriesGoal: {
    fontSize: typography.base,
    fontFamily: typography.fontRegular,
    color: colors.textMuted,
  },
  percentageBadge: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  percentageText: {
    fontSize: typography.lg,
    fontFamily: typography.fontBold,
    color: colors.primary,
  },
  calorieProgressContainer: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  calorieProgress: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  remainingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  remainingText: {
    fontSize: typography.xs,
    fontFamily: typography.fontMedium,
    marginLeft: spacing.xs,
  },
  macrosContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  macroCard: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  macroIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
  macroLabel: {
    fontSize: typography.xs,
    fontFamily: typography.fontMedium,
    color: colors.textMuted,
  },
  macroValue: {
    fontSize: typography.xl,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  macroUnit: {
    fontSize: typography.sm,
    fontFamily: typography.fontRegular,
    color: colors.textMuted,
  },
  macroProgressContainer: {
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  macroProgress: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  macroGoalText: {
    fontSize: 10,
    fontFamily: typography.fontRegular,
    color: colors.textMuted,
  },
});
