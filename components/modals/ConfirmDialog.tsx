import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  destructive = true,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              styles.iconCircle,
              destructive
                ? styles.iconCircleDestructive
                : styles.iconCirclePrimary,
            ]}
          >
            <Ionicons
              name={destructive ? "trash-outline" : "checkmark-circle-outline"}
              size={32}
              color={destructive ? colors.error : colors.primary}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                destructive
                  ? styles.confirmButtonDestructive
                  : styles.confirmButtonPrimary,
              ]}
              onPress={() => {
                onConfirm();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
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
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    dialog: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      width: "100%",
      maxWidth: 340,
      alignItems: "center",
      ...shadows.lg,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    iconCircleDestructive: {
      backgroundColor: "#FEE2E2",
    },
    iconCirclePrimary: {
      backgroundColor: colors.primaryBg,
    },
    title: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    message: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.xl,
      lineHeight: 20,
    },
    buttonRow: {
      flexDirection: "row",
      gap: spacing.md,
      width: "100%",
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    cancelButtonText: {
      fontSize: typography.sm,
      fontFamily: typography.fontSemibold,
      color: colors.textSecondary,
    },
    confirmButton: {
      flex: 1,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: "center",
    },
    confirmButtonDestructive: {
      backgroundColor: colors.error,
    },
    confirmButtonPrimary: {
      backgroundColor: colors.primary,
    },
    confirmButtonText: {
      fontSize: typography.sm,
      fontFamily: typography.fontSemibold,
      color: "#FFFFFF",
    },
  });
