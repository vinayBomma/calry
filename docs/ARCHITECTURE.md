# Technical Architecture 🏗️

This document explains the technical implementation and design decisions behind SnackTrack.

## 1. Data Persistence (SQLite)

SnackTrack uses `expo-sqlite` for all primary data. This ensures high performance and offline capability.

### Schema:
- `food_logs`: Stores daily meal entries (name, calories, macros, timestamp, mealType).
- `favourite_meals`: Stores meals saved by the user for quick access.
- `user_goals`: (Managed via `AsyncStorage` or SQLite) Stores TDEE variables and targets.

Files: `lib/database.ts`

## 2. State Management (Zustand)

We use **Zustand** over React Context for performance and simplicity. It allows components to subscribe to specific parts of the state without unnecessary re-renders.

- `foodStore.ts`: Handles food logs, favourites, and daily totals.
- `themeStore.ts`: Persists light/dark mode preferences.

## 3. AI Service (Google Gemini)

The app uses `gemini-1.5-flash` for its speed and cost-effectiveness. 

### Implementation:
- **Prompt Engineering**: We use a detailed system prompt that forces the AI to return a specific JSON schema.
- **Fallback Logic**: If the AI fails to parse a complex meal, it retries with a simplified prompt or uses local heuristics.
- **Safety**: Inputs are validated and strictly limited to prevent jailbreak attempts or non-nutrition queries.

Files: `lib/gemini.ts`

## 4. Theming System

A custom `ThemeContext` provides semantic color tokens (e.g., `primary`, `background`, `surface`). These tokens automatically flip based on the user's appearance settings.

- Design system follows a "Clean & Vibrant" aesthetic using `Inter` and `Ionicons`.

Files: `lib/ThemeContext.tsx`, `lib/theme.ts`

## 5. Navigation

We use **Expo Router** which follows a file-system-based routing convention.
- `(tabs)/`: The main bottom-tab navigation.
- `add-meal.tsx`: A standard screen for inputting new meals.
- `onboarding.tsx`: A standalone flow that redirects to tabs once complete.
