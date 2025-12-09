import 'dotenv/config';

export default () => ({
  name: "Craftopia",
  slug: "craftopia",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/adaptive-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  android: {
    package: "com.beans01.craftopia",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  },
  ios: {
    bundleIdentifier: "com.beans01.craftopia", // <-- Add this line
    buildNumber: "1.0.0"
  },
  scheme: "craftopia",
  runtimeVersion: {
    policy: "sdkVersion"
  },
  updates: {
    url: "https://u.expo.dev/403a5f27-f52c-4f20-9083-98d1a0496e99"
  },
  extra: {
    eas: {
      projectId: "403a5f27-f52c-4f20-9083-98d1a0496e99"
    },
    devUrl: process.env.BACKEND_URL,
    prodUrl: process.env.PROD_URL,
  },
  plugins: [
    "expo-font"
  ]
});
