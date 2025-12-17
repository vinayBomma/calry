/**
 * SnackTrack Design System
 * Balanced, informative yet elegant
 */

export const colors = {
  // Primary brand color - Fresh green
  primary: "#439775",
  primaryLight: "#6BB899",
  primaryMuted: "#A3D4C0",
  primaryBg: "#EDF7F3",
  primaryDark: "#357A5E",
  
  // Background colors
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F5F5F5",
  
  // Text colors
  textPrimary: "#18181B",
  textSecondary: "#52525B",
  textMuted: "#A1A1AA",
  textInverse: "#FFFFFF",
  
  // Macro colors - Subtle but distinguishable
  protein: "#8B5CF6",  // Soft purple
  carbs: "#F59E0B",    // Warm amber
  fat: "#3B82F6",      // Calm blue
  
  // Meal type colors
  breakfast: "#F59E0B",
  lunch: "#10B981",
  dinner: "#6366F1",
  snack: "#EC4899",
  
  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  
  // Border and dividers
  border: "#E4E4E7",
  divider: "#F4F4F5",
  
  // Shadows
  shadow: "#18181B",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
  
  // Font families
  fontRegular: "Poppins-Regular",
  fontMedium: "Poppins-Medium",
  fontSemibold: "Poppins-SemiBold",
  fontBold: "Poppins-Bold",
  fontExtrabold: "Poppins-ExtraBold",
  
  // Font weights (for fallback)
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
