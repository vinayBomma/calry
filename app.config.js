export default {
  expo: {
    name: "Calry",
    slug: "calry",
    version: "1.0.2",
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
        projectId: "30280021-3570-468a-9c2f-6fea51571b9f",
      },
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
      posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
      revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    },
    owner: "vinaybomma",
  },
};
