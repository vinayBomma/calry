import { View, ViewStyle } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, borderRadius, shadows } from "../../lib/theme";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  style?: ViewStyle;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  style,
}: CardProps) {
  const { colors } = useTheme();

  const paddingStyles = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: paddingStyles[padding],
    };

    switch (variant) {
      case "elevated":
        return { ...base, ...shadows.md };
      case "outlined":
        return { ...base, borderWidth: 1, borderColor: colors.divider };
      default:
        return { ...base, ...shadows.sm };
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
}
