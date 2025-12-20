import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FoodItem } from "../../lib/models/food";
import { useFoodStore } from "../../store/foodStore";
import { ActionSheet } from "../modals/ActionSheet";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { EditMealModal } from "../modals/EditMealModal";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, shadows, borderRadius } from "../../lib/theme";
import { getMealTypeConfig, formatTime, formatMealType } from "../../lib/hooks/useMealConfig";

interface FoodLogItemProps {
  item: FoodItem;
}

export function FoodLogItem({ item }: FoodLogItemProps) {
  const { colors } = useTheme();
  const { updateFoodItem, deleteFoodItem, addFavourite } = useFoodStore();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const mealTypeConfig = getMealTypeConfig(colors);
  const config = mealTypeConfig[item.mealType] || {
    color: colors.primary,
    icon: "nutrition-outline" as const,
  };

  const styles = createStyles(colors);

  const handleDelete = async () => {
    try {
      await deleteFoodItem(item.id);
    } catch (error) {
      console.error("Error deleting food item:", error);
    }
  };

  const handleSaveEdit = async (updatedItem: FoodItem) => {
    await updateFoodItem(updatedItem);
  };

  const handleSaveFavourite = async () => {
    try {
      await addFavourite({
        id: Date.now().toString(),
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        mealType: item.mealType,
      });
      // Optional: Add toast or feedback here
    } catch (error) {
      console.error("Error saving favourite:", error);
    }
  };

  const actionOptions = [
    {
      label: "Edit Meal",
      icon: "pencil-outline" as const,
      onPress: () => setShowEditModal(true),
    },
    {
      label: "Save to Favourites",
      icon: "star-outline" as const,
      onPress: () => handleSaveFavourite(),
    },
    {
      label: "Delete",
      icon: "trash-outline" as const,
      onPress: () => setShowDeleteConfirm(true),
      destructive: true,
    },
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowActionSheet(true)}
        activeOpacity={0.7}
      >
        {/* Meal type icon */}
        <View
          style={[
            styles.mealIconContainer,
            { backgroundColor: `${config.color}15` },
          ]}
        >
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.topRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.nameText} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>
                  {formatTime(item.timestamp)}
                </Text>
                <Text style={styles.separator}>·</Text>
                <Text style={[styles.mealTypeText, { color: config.color }]}>
                  {formatMealType(item.mealType)}
                </Text>
              </View>
            </View>
            <View style={styles.caloriesBadge}>
              <Ionicons name="flame" size={14} color={colors.primary} />
              <Text style={styles.caloriesValue}>{item.calories}</Text>
            </View>
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{item.protein}g</Text>
            </View>
            <Text style={styles.macroDivider}>·</Text>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{item.carbs}g</Text>
            </View>
            <Text style={styles.macroDivider}>·</Text>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{item.fat}g</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={item.name}
        options={actionOptions}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Meal?"
        message="This will permanently remove this meal from your food log. This action cannot be undone."
        confirmText="Delete"
        cancelText="Keep"
        destructive
      />

      <EditMealModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={item}
        onSave={handleSaveEdit}
      />
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.xs,
      padding: spacing.md,
      ...shadows.sm,
    },
    mealIconContainer: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    mainContent: {
      flex: 1,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    nameContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    nameText: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      fontSize: typography.xs,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    separator: {
      fontSize: typography.xs,
      color: colors.textMuted,
      marginHorizontal: 6,
    },
    mealTypeText: {
      fontSize: typography.xs,
      fontFamily: typography.fontMedium,
    },
    caloriesBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      gap: 4,
    },
    caloriesValue: {
      fontSize: typography.base,
      fontFamily: typography.fontBold,
      color: colors.primary,
    },
    macrosRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    macroItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    macroDivider: {
      fontSize: typography.xs,
      color: colors.textMuted,
      marginHorizontal: spacing.sm,
    },
    macroLabel: {
      fontSize: typography.xs,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    macroValue: {
      fontSize: typography.xs,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
  });
