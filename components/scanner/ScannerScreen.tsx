import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";
import { usePremiumStore } from "../../store/premiumStore";
import { getProductByBarcode, OpenFoodFactsProduct } from "../../lib/openfoodfacts";
import { analyzeFoodImage } from "../../lib/gemini";
import * as FileSystem from "expo-file-system";

type ScanMode = "barcode" | "photo";

interface ScanResult {
  type: "barcode" | "ai";
  data: OpenFoodFactsProduct | {
    foods: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      weight?: number;
    }>;
  };
}

interface ScannerScreenProps {
  onScanComplete: (result: ScanResult) => void;
  onClose: () => void;
}

export default function ScannerScreen({ onScanComplete, onClose }: ScannerScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>("barcode");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const {
    isPremium,
    canUseAICamera,
    getRemainingAICameraScans,
    incrementAICameraUsage,
  } = usePremiumStore();

  const styles = createStyles(colors);

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (hasScanned || isProcessing) return;
    
    setHasScanned(true);
    setIsProcessing(true);

    try {
      const { product, success, error } = await getProductByBarcode(result.data);
      
      if (success && product) {
        onScanComplete({
          type: "barcode",
          data: product,
        });
      } else {
        Alert.alert(
          "Product Not Found",
          error || "This barcode is not in our database. Try entering the food manually.",
          [
            { text: "OK", onPress: () => setHasScanned(false) }
          ]
        );
      }
    } catch (error) {
      console.error("Barcode scan error:", error);
      Alert.alert("Error", "Failed to look up product. Please try again.");
      setHasScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakePhoto = async () => {
    if (isProcessing || !cameraRef.current) return;

    // Check if user can use AI camera
    if (!canUseAICamera()) {
      Alert.alert(
        "Premium Feature",
        "AI food scanning is a premium feature. You've used your free trial scan.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push("/upgrade") }
        ]
      );
      return;
    }

    setIsProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      // Increment usage before making the API call
      const canProceed = await incrementAICameraUsage();
      if (!canProceed) {
        Alert.alert(
          "Trial Used",
          "You've used your free AI camera trial. Upgrade to premium for unlimited scans.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await analyzeFoodImage(photo.base64, "image/jpeg");

      if (result.success && result.foods.length > 0) {
        onScanComplete({
          type: "ai",
          data: { foods: result.foods },
        });
      } else {
        Alert.alert(
          "No Food Detected",
          result.error || "Could not identify food in the image. Try taking a clearer photo.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Photo capture error:", error);
      Alert.alert("Error", "Failed to analyze photo. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan barcodes and take photos of your food.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const remainingScans = getRemainingAICameraScans();
  const showTrialBadge = !isPremium() && mode === "photo" && remainingScans > 0;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={
          mode === "barcode"
            ? {
                barcodeTypes: [
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "code128",
                  "code39",
                  "code93",
                ],
              }
            : undefined
        }
        onBarcodeScanned={mode === "barcode" && !hasScanned ? handleBarcodeScanned : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === "barcode" ? "Scan Barcode" : "Take Photo"}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, mode === "barcode" && styles.modeButtonActive]}
            onPress={() => {
              setMode("barcode");
              setHasScanned(false);
            }}
          >
            <Ionicons
              name="barcode-outline"
              size={20}
              color={mode === "barcode" ? colors.primary : "#fff"}
            />
            <Text style={[styles.modeText, mode === "barcode" && styles.modeTextActive]}>
              Barcode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === "photo" && styles.modeButtonActive]}
            onPress={() => setMode("photo")}
          >
            <Ionicons
              name="camera-outline"
              size={20}
              color={mode === "photo" ? colors.primary : "#fff"}
            />
            <Text style={[styles.modeText, mode === "photo" && styles.modeTextActive]}>
              AI Photo
            </Text>
            {!isPremium() && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={10} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Scan Frame */}
        <View style={styles.scanFrameContainer}>
          <View style={[
            styles.scanFrame,
            mode === "photo" && styles.scanFramePhoto
          ]}>
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.processingText}>
                  {mode === "barcode" ? "Looking up product..." : "Analyzing food..."}
                </Text>
              </View>
            )}
          </View>
          {mode === "barcode" && !isProcessing && (
            <Text style={styles.scanHint}>
              Point camera at barcode
            </Text>
          )}
          {showTrialBadge && (
            <View style={styles.trialBadge}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.trialText}>
                1 free trial remaining
              </Text>
            </View>
          )}
        </View>

        {/* Capture Button (Photo mode only) */}
        {mode === "photo" && (
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
              onPress={handleTakePhoto}
              disabled={isProcessing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const { width, height } = Dimensions.get("window");

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000",
    },
    camera: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.3)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },
    modeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingVertical: 16,
    },
    modeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    modeButtonActive: {
      backgroundColor: "#fff",
    },
    modeText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#fff",
    },
    modeTextActive: {
      color: colors.primary,
    },
    premiumBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 2,
    },
    scanFrameContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    scanFrame: {
      width: width * 0.7,
      height: 120,
      borderWidth: 2,
      borderColor: "#fff",
      borderRadius: 12,
      backgroundColor: "transparent",
      overflow: "hidden",
    },
    scanFramePhoto: {
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: 16,
    },
    processingOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    processingText: {
      color: "#fff",
      fontSize: 14,
    },
    scanHint: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 14,
      marginTop: 16,
    },
    trialBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 16,
      paddingVertical: 8,
      paddingHorizontal: 14,
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: 20,
    },
    trialText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    captureContainer: {
      alignItems: "center",
      paddingBottom: 60,
    },
    captureButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "rgba(255,255,255,0.3)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 4,
      borderColor: "#fff",
    },
    captureButtonDisabled: {
      opacity: 0.5,
    },
    captureButtonInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#fff",
    },
    permissionContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 16,
    },
    permissionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textPrimary,
      textAlign: "center",
    },
    permissionText: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
      marginTop: 8,
    },
    permissionButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    closeButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    closeButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
  });
}
