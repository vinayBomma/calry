import { StyleSheet, View, Text } from "react-native";
import { useTheme } from "../lib/ThemeContext";
import { spacing, typography, borderRadius } from "../lib/theme";

export function Header() {
  const { colors } = useTheme();
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "short" });
  const dayNumber = today.getDate();
  const monthName = today.toLocaleDateString("en-US", { month: "short" });

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* Date Card */}
        <View style={styles.dateCard}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.dayNumber}>{dayNumber}</Text>
          <Text style={styles.monthName}>{monthName}</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>SnackTrack</Text>
          <Text style={styles.subtitle}>Track your nutrition</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      backgroundColor: colors.background,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
    },
    dateCard: {
      width: 52,
      height: 60,
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
      borderWidth: 1,
      borderColor: colors.primaryMuted,
    },
    dayName: {
      fontSize: 10,
      fontFamily: typography.fontSemibold,
      color: colors.primary,
      textTransform: "uppercase",
    },
    dayNumber: {
      fontSize: typography.xl,
      fontFamily: typography.fontBold,
      color: colors.primary,
      lineHeight: 24,
    },
    monthName: {
      fontSize: 10,
      fontFamily: typography.fontMedium,
      color: colors.primary,
    },
    titleContainer: {
      justifyContent: "center",
    },
    title: {
      fontSize: typography.xl,
      fontFamily: typography.fontBold,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: typography.xs,
      fontFamily: typography.fontMedium,
      color: colors.textMuted,
      marginTop: 2,
    },
  });
