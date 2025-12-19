import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFoodStore } from "../store";
import { useTheme } from "../lib/ThemeContext";
import { spacing, typography, borderRadius } from "../lib/theme";

export function Header() {
  const { colors } = useTheme();
  const { selectedDate, setSelectedDate } = useFoodStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateObj = new Date(selectedDate);
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const dayNumber = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format as YYYY-MM-DD
      const dateString = selectedDate.toISOString().split("T")[0];
      setSelectedDate(dateString);
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* Date Card */}
        <TouchableOpacity 
          style={styles.dateCard}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.dayNumber}>{dayNumber}</Text>
          <Text style={styles.monthName}>{monthName}</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>SnackTrack</Text>
          <Text style={styles.subtitle}>Track your nutrition</Text>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()} // Prevent selecting future dates if desired, or remove
        />
      )}
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
