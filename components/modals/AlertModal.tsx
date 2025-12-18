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

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  type?: "success" | "error" | "info";
}

export function AlertModal({
  visible,
  onClose,
  title,
  message,
  buttonText = "OK",
  type = "info",
}: AlertModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle-outline";
      case "error":
        return "alert-circle-outline";
      default:
        return "information-circle-outline";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return colors.success || "#10B981"; // Fallback if success not in theme
      case "error":
        return colors.error;
      default:
        return colors.primary;
    }
  };

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
              { backgroundColor: `${getColor()}20` }, // 20% opacity
            ]}
          >
            <Ionicons name={getIcon()} size={32} color={getColor()} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: getColor() }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
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
    button: {
      width: "100%",
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: "center",
    },
    buttonText: {
      fontSize: typography.sm,
      fontFamily: typography.fontSemibold,
      color: "#FFFFFF",
    },
  });
