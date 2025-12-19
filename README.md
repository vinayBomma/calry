# 🍎 SnackTrack - AI Calorie Counter

SnackTrack is a privacy-first, AI-powered nutrition tracker built with React Native and Expo. It allows you to log meals using natural language, providing instant nutritional insights while keeping your data securely on your device.

---

## ✨ Features

- **🤖 AI Meal Logging**: Describe what you ate in plain English (or other languages!) and let Gemini 1.5 Flash calculate the macros.
- **⭐ Favourites**: Save your frequent meals for quick, one-tap logging.
- **📊 Interactive Stats**: Visualize your weekly progress with bar charts and real-time calorie rings.
- **🎯 Smart Goals**: Set calorie and macro goals. The app can auto-recalculate them based on your profile stats (TDEE).
- **🔒 Privacy First**: All your data is stored locally in a SQLite database. No account required.
- **🌓 Dark Mode**: Fully themed for both light and dark environments.
- **🎉 Celebrations**: Get a confetti surprise when you hit your daily goals!

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54) / React Native
- **AI Engine**: [Google Gemini 1.5 Flash](https://ai.google.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based)
- **Styling**: Custom Theme System with `ThemeContext`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- Expo Go app on your mobile device (for testing)

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd snacktrack
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Gemini API Key:
   - Create a `.env` file (or update `lib/gemini.ts`) with your `GEMINI_API_KEY`.

### Running the App
```bash
npx expo start
```
Scan the QR code with your phone (using Expo Go) to see it in action.

---

## 📂 Project Structure

```text
├── app/               # Expo Router screens (Tabs and Modals)
├── assets/            # Images, icons, and static assets
├── components/        # Reusable UI components
│   ├── ui/            # Styled base primitives (Buttons, Cards)
│   ├── modals/        # App-wide modals (Profile, Favourites, etc.)
│   └── stats/         # Data visualization components
├── lib/               # Business logic
│   ├── database.ts    # SQLite schema and operations
│   ├── gemini.ts      # AI integration and guardrails
│   └── theme.ts       # Design tokens and constants
└── store/             # Zustand state stores (food, goals, theme)
```

---

## 🛡️ AI Safety & Limits
- **Guardrails**: The AI is programmed to only answer nutrition-related queries.
- **Limits**: Text inputs are capped at 200 characters to prevent token overuse and ensure focus.

---

## 📜 License
Private Project. All rights reserved.
