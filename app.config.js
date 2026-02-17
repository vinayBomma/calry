export default {
  expo: {
    name: "Calry",
    slug: "calry",
    version: "1.1.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.vinaybomma.calry",
    },
    plugins: [
      "expo-sqlite",
      "expo-localization",
      [
        "expo-camera",
        {
          cameraPermission: "Allow Calry to access your camera for food scanning.",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "5fd764ee-3278-4553-9950-0fd8a44e855a",
      },
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
      posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
      revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    },
    owner: "vinaybomma",
  },
};
