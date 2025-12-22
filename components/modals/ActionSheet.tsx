import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";

interface ActionOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionOption[];
}

export function ActionSheet({
  visible,
  onClose,
  title,
  options,
}: ActionSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {title && <Text style={styles.title}>{title}</Text>}

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.option,
                  index < options.length - 1 && styles.optionBorder,
                  option.disabled && styles.optionDisabled,
                ]}
                onPress={() => {
                  if (!option.disabled) {
                    option.onPress();
                    onClose();
                  }
                }}
                activeOpacity={option.disabled ? 1 : 0.7}
                disabled={option.disabled}
              >
                <View
                  style={[
                    styles.iconContainer,
                    option.destructive && styles.iconContainerDestructive,
                    option.disabled && styles.iconContainerDisabled,
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={
                      option.disabled
                        ? colors.textMuted
                        : option.destructive
                        ? colors.error
                        : colors.primary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    option.destructive && styles.optionLabelDestructive,
                    option.disabled && styles.optionLabelDisabled,
                  ]}
                >
                  {option.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={option.disabled ? colors.divider : colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    title: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    optionsContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
    },
    optionBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    optionDisabled: {
      opacity: 0.5,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.primaryBg,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    iconContainerDestructive: {
      backgroundColor: "#FEE2E2",
    },
    iconContainerDisabled: {
      backgroundColor: colors.divider,
    },
    optionLabel: {
      flex: 1,
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textPrimary,
    },
    optionLabelDestructive: {
      color: colors.error,
    },
    optionLabelDisabled: {
      color: colors.textMuted,
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
      alignItems: "center",
      ...shadows.sm,
    },
    cancelText: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textSecondary,
    },
  });
