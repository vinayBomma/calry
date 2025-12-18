import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { useFoodStore } from "../../store";
import { spacing, typography, shadows, borderRadius } from "../../lib/theme";
import { ConfirmDialog } from "./ConfirmDialog";

interface FavouritesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FavouritesModal({ visible, onClose }: FavouritesModalProps) {
  const { colors } = useTheme();
  const { favourites, deleteFavourite } = useFoodStore();
  const styles = createStyles(colors);
  
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedFavId, setSelectedFavId] = useState<string | null>(null);

  const handleDeletePress = (id: string) => {
    setSelectedFavId(id);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedFavId) {
      await deleteFavourite(selectedFavId);
      setShowConfirmDelete(false);
      setSelectedFavId(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom"]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Favourites</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {favourites.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons
                      name="star-outline"
                      size={32}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.emptyStateTitle}>No Favourites Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Save meals from your history to see them here.
                  </Text>
                </View>
              ) : (
                <View style={styles.favouritesList}>
                  {favourites.map((fav, index) => (
                    <View key={fav.id}>
                      <View style={styles.favouriteItem}>
                        <View style={styles.favouriteIcon}>
                          <Ionicons
                            name="star"
                            size={20}
                            color={colors.primary}
                          />
                        </View>
                        <View style={styles.favouriteContent}>
                          <Text style={styles.favouriteName}>{fav.name}</Text>
                          <Text style={styles.favouriteValues}>
                            {fav.calories} kcal • P: {Math.round(fav.protein)}g C: {Math.round(fav.carbs)}g F: {Math.round(fav.fat)}g
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeletePress(fav.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                      {index < favourites.length - 1 && (
                        <View style={styles.divider} />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>

      <ConfirmDialog
        visible={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Favourite"
        message="Are you sure you want to remove this favourite?"
        confirmText="Remove"
        destructive
      />
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "flex-end",
    },
    modalSafeArea: {
      maxHeight: "85%",
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
    },
    modalContent: {
      paddingBottom: spacing.xxxl,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    modalTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    modalBody: {
      // No flex needed
    },
    scrollContent: {
      padding: spacing.lg,
    },
    favouritesList: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    favouriteItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
    },
    favouriteIcon: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.primaryBg,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    favouriteContent: {
      flex: 1,
      marginRight: spacing.sm,
    },
    favouriteName: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    favouriteValues: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    deleteButton: {
      padding: spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 60, // Align with text start
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
      marginTop: spacing.xl,
    },
    emptyIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    emptyStateTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    emptyStateText: {
      fontSize: typography.base,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
