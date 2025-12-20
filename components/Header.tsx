import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import { useFoodStore } from "../store";
import { useTheme } from "../lib/ThemeContext";
import { spacing, typography, borderRadius } from "../lib/theme";

export function Header() {
  const { colors } = useTheme();
  const { selectedDate, setSelectedDate } = useFoodStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.substring(0, 7)); // YYYY-MM

  const dateObj = new Date(selectedDate);
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const dayNumber = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });

  const handleDateChange = (dateId: string) => {
    setShowDatePicker(false);
    setSelectedDate(dateId);
  };

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    // currentMonth is 1-indexed (e.g., 2025-12)
    // Date month is 0-indexed. 
    // To go to prev month from 2025-12 (month=12), we want 2025-11 (month index 10).
    const date = new Date(year, month - 2, 1);
    setCurrentMonth(toDateId(date).substring(0, 7));
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    // To go to next month from 2025-12 (month=12), we want 2026-01 (month index 12).
    const date = new Date(year, month, 1);
    setCurrentMonth(toDateId(date).substring(0, 7));
  };

  const displayMonthName = new Date(currentMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });


  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* Date Card (Static) */}
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

      <TouchableOpacity
        style={styles.calendarButton}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
      </TouchableOpacity>


      {showDatePicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <View style={styles.calendarNav}>
                      <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                        <Ionicons name="chevron-back" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.calendarTitle}>{displayMonthName}</Text>
                      <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <Calendar
                    calendarMonthId={currentMonth}
                    onCalendarDayPress={handleDateChange}
                    calendarActiveDateRanges={[
                      {
                        startId: selectedDate,
                        endId: selectedDate,
                      },
                    ]}
                    theme={{
                      itemDayContainer: {
                        activeDayFiller: {
                          backgroundColor: colors.primary,
                        },
                      },
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
    calendarButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primaryBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryMuted,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    calendarContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      width: "100%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    calendarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    calendarTitle: {
      fontSize: typography.base,
      fontFamily: typography.fontBold,
      color: colors.textPrimary,
      marginHorizontal: spacing.sm,
      minWidth: 140,
      textAlign: "center",
    },
    calendarNav: {
      flexDirection: "row",
      alignItems: "center",
    },
    navButton: {
      padding: spacing.xs,
    },
  });
