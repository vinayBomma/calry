import { TouchableOpacity, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, borderRadius, typography, shadows } from "../../lib/theme";

interface OptionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  iconSize?: number;
  style?: ViewStyle;
}

export function OptionCard({
  icon,
  title,
  subtitle,
  selected = false,
  onPress,
  iconSize = 24,
  style,
}: OptionCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: selected ? colors.primaryBg : colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderWidth: 2,
          borderColor: selected ? colors.primary : colors.divider,
          marginBottom: spacing.sm,
          ...shadows.sm,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: borderRadius.md,
          backgroundColor: selected ? colors.primaryMuted : colors.divider,
          alignItems: "center",
          justifyContent: "center",
          marginRight: spacing.md,
        }}
      >
        <Ionicons
          name={icon}
          size={iconSize}
          color={selected ? colors.primary : colors.textSecondary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.base,
            fontFamily: typography.fontSemibold,
            color: selected ? colors.primary : colors.textPrimary,
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: typography.sm,
              fontFamily: typography.fontRegular,
              color: colors.textMuted,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
}
