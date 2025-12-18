import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius } from "../../lib/theme";

interface GoalInputProps {
  label: string;
  value: number;
  unit: string;
  editable: boolean;
  onChange: (value: number) => void;
}

export function GoalInput({
  label,
  value,
  unit,
  editable,
  onChange,
}: GoalInputProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        {editable ? (
          <TextInput
            style={styles.input}
            value={value.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              onChange(num);
            }}
            keyboardType="numeric"
            selectTextOnFocus
          />
        ) : (
          <Text style={styles.value}>{value}</Text>
        )}
        <Text style={styles.unit}>{unit}</Text>
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
      paddingVertical: spacing.sm,
    },
    label: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textPrimary,
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.primary,
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      minWidth: 60,
      textAlign: "right",
    },
    value: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.primary,
    },
    unit: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
      marginLeft: spacing.xs,
    },
  });
