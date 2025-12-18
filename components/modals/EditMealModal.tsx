import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FoodItem } from "../../lib/models/food";
import { getFoodNutritionInfo } from "../../lib/gemini";
import { useTheme } from "../../lib/ThemeContext";
import { spacing, typography, shadows, borderRadius } from "../../lib/theme";
import { MEAL_OPTIONS, type MealType } from "../../lib/hooks";

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
  const [description, setDescription] = useState(item.description || item.name);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    item.mealType
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalDescription = item.description || item.name;
  const hasDescriptionChanged = description.trim() !== originalDescription;
  const hasMealTypeChanged = selectedMealType !== item.mealType;
  const hasChanges = hasDescriptionChanged || hasMealTypeChanged;

  const handleSave = async () => {
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      let updatedItem: FoodItem = {
        ...item,
        mealType: selectedMealType,
      };

      // If description changed, re-analyze with Gemini
      if (hasDescriptionChanged) {
        const nutritionInfo = await getFoodNutritionInfo(description);
        updatedItem = {
          ...updatedItem,
          name: nutritionInfo.name || description,
          description: description.trim(),
          calories: nutritionInfo.calories,
          protein: nutritionInfo.protein,
          carbs: nutritionInfo.carbs,
          fat: nutritionInfo.fat,
        };
      }

      await onSave(updatedItem);
      onClose();
    } catch (err) {
      console.error("Error updating meal:", err);
      setError("Failed to update meal. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Meal</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={!hasChanges || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text
                style={[
                  styles.saveText,
                  (!hasChanges || isAnalyzing) && styles.saveTextDisabled,
                ]}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Description</Text>
            <Text style={styles.sectionSubtitle}>
              {hasDescriptionChanged
                ? "Description changed - nutrition will be re-analyzed"
                : "Edit the description to update nutrition info"}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe what you ate..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                maxLength={200}
              />
              <Text style={{ 
                textAlign: 'right', 
                color: description.length >= 200 ? 'red' : colors.textMuted,
                fontSize: 12,
                marginTop: 4,
                marginRight: 8,
                marginBottom: 4
              }}>
                {description.length}/200
              </Text>
            </View>
            {hasDescriptionChanged && (
              <View style={styles.reanalyzeNote}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={styles.reanalyzeText}>
                  AI will analyze and update nutrition values
                </Text>
              </View>
            )}
          </View>

          {/* Meal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeGrid}>
              {MEAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.mealTypeOption,
                    selectedMealType === option.type && styles.mealTypeSelected,
                  ]}
                  onPress={() => setSelectedMealType(option.type)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={
                      selectedMealType === option.type
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.mealTypeLabel,
                      selectedMealType === option.type &&
                        styles.mealTypeLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Current Nutrition Info */}
          {!hasDescriptionChanged && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Nutrition</Text>
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionItem}>
                    <Ionicons name="flame" size={18} color={colors.primary} />
                    <Text style={styles.nutritionValue}>{item.calories}</Text>
                    <Text style={styles.nutritionLabel}>kcal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Ionicons
                      name="barbell-outline"
                      size={18}
                      color="#EF4444"
                    />
                    <Text style={styles.nutritionValue}>{item.protein}g</Text>
                    <Text style={styles.nutritionLabel}>protein</Text>
                  </View>
                </View>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionItem}>
                    <Ionicons name="leaf-outline" size={18} color="#F59E0B" />
                    <Text style={styles.nutritionValue}>{item.carbs}g</Text>
                    <Text style={styles.nutritionLabel}>carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Ionicons name="water-outline" size={18} color="#3B82F6" />
                    <Text style={styles.nutritionValue}>{item.fat}g</Text>
                    <Text style={styles.nutritionLabel}>fat</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.surface,
    },
    headerButton: {
      minWidth: 60,
    },
    headerTitle: {
      fontSize: typography.lg,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    cancelText: {
      fontSize: typography.base,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
    },
    saveText: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.primary,
      textAlign: "right",
    },
    saveTextDisabled: {
      color: colors.textMuted,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    inputContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      ...shadows.sm,
    },
    textInput: {
      padding: spacing.md,
      fontSize: typography.base,
      fontFamily: typography.fontRegular,
      color: colors.textPrimary,
      minHeight: 80,
    },
    reanalyzeNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    reanalyzeText: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.primary,
    },
    mealTypeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    mealTypeOption: {
      flex: 1,
      minWidth: "45%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.divider,
    },
    mealTypeSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryBg,
    },
    mealTypeLabel: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.textSecondary,
    },
    mealTypeLabelSelected: {
      color: colors.primary,
    },
    nutritionCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    nutritionRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: spacing.xs,
    },
    nutritionItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    nutritionValue: {
      fontSize: typography.base,
      fontFamily: typography.fontSemibold,
      color: colors.textPrimary,
    },
    nutritionLabel: {
      fontSize: typography.sm,
      fontFamily: typography.fontRegular,
      color: colors.textMuted,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: "#FEE2E2",
      padding: spacing.md,
      borderRadius: borderRadius.md,
    },
    errorText: {
      fontSize: typography.sm,
      fontFamily: typography.fontMedium,
      color: colors.error,
    },
  });
