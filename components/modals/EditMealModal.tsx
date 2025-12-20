import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FoodItem } from "../../lib/models/food";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, borderRadius, shadows } from "../../lib/theme";
import { MEAL_OPTIONS, type MealType } from "../../lib/hooks/useMealConfig";

interface EditMealModalProps {
  visible: boolean;
  onClose: () => void;
  item: FoodItem;
  onSave: (updatedItem: FoodItem) => Promise<void>;
}

export function EditMealModal({
  visible,
  onClose,
  item,
  onSave,
}: EditMealModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState(item.name);
  const [calories, setCalories] = useState(item.calories.toString());
  const [protein, setProtein] = useState(item.protein.toString());
  const [carbs, setCarbs] = useState(item.carbs.toString());
  const [fat, setFat] = useState(item.fat.toString());
  const [mealType, setMealType] = useState<MealType>(item.mealType);

  useEffect(() => {
    if (visible) {
      setName(item.name);
      setCalories(item.calories.toString());
      setProtein(item.protein.toString());
      setCarbs(item.carbs.toString());
      setFat(item.fat.toString());
      setMealType(item.mealType);
    }
  }, [visible, item]);

  const handleSave = async () => {
    const updatedItem: FoodItem = {
      ...item,
      name,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      mealType,
    };
    await onSave(updatedItem);
    onClose();
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Meal</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meal Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Grilled Chicken Salad"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meal Type</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mealTypeContainer}
              >
                {MEAL_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.mealTypeChip,
                      mealType === option.type && styles.mealTypeChipSelected,
                    ]}
                    onPress={() => setMealType(option.type)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={16}
                      color={
                        mealType === option.type 
                          ? colors.primary 
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.mealTypeLabel,
                        mealType === option.type && styles.mealTypeLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.macrosContainer}>
              <View style={styles.macroInput}>
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.macroInput}>
                <Text style={styles.label}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.macroInput}>
                <Text style={styles.label}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    content: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: "90%",
      paddingTop: spacing.lg,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.xl,
      fontFamily: typography.fontBold,
      color: colors.textPrimary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    form: {
      paddingHorizontal: spacing.lg,
    },
    inputGroup: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.base,
      fontFamily: typography.fontRegular,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: {
      flexDirection: "row",
      gap: spacing.md,
    },
    macrosContainer: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    macroInput: {
      flex: 1,
    },
    footer: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.md,
      marginBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: "center",
      ...shadows.sm,
    },
    saveButtonText: {
      color: colors.textInverse,
      fontSize: typography.base,
      fontFamily: typography.fontBold,
    },
    mealTypeContainer: {
      flexDirection: "row",
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    mealTypeChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    mealTypeChipSelected: {
      backgroundColor: colors.primaryBg,
      borderColor: colors.primary,
    },
    mealTypeLabel: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
    },
    mealTypeLabelSelected: {
      color: colors.primary,
      fontFamily: typography.fontSemibold,
    },
  });
