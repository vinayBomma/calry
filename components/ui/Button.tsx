import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  };

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      borderRadius: borderRadius.lg,
      ...sizeStyles[size],
      ...(fullWidth && { width: "100%" }),
    };

    switch (variant) {
      case "primary":
        return {
          ...base,
          backgroundColor: disabled ? colors.textMuted : colors.primary,
          ...shadows.md,
        };
      case "secondary":
        return {
          ...base,
          backgroundColor: colors.primaryBg,
        };
      case "outline":
        return {
          ...base,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.divider,
        };
      case "ghost":
        return {
          ...base,
          backgroundColor: "transparent",
        };
      default:
        return base;
    }
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontFamily: typography.fontSemibold,
      fontSize: size === "sm" ? typography.sm : typography.base,
    };

    switch (variant) {
      case "primary":
        return { ...base, color: "#FFFFFF" };
      case "secondary":
        return { ...base, color: colors.primary };
      case "outline":
        return { ...base, color: colors.textSecondary };
      case "ghost":
        return { ...base, color: colors.primary };
      default:
        return base;
    }
  };

  const iconColor =
    variant === "primary"
      ? "#FFFFFF"
      : variant === "outline"
      ? colors.textSecondary
      : colors.primary;

  const iconSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons name={icon} size={iconSize} color={iconColor} />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons name={icon} size={iconSize} color={iconColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
