import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API Key
const GEMINI_API_KEY = "AIzaSyAcXi3CcjgW5SG6vU2CHuO1Qox_gHOIt2Q";

// Initialize Gemini client
let genAI: GoogleGenerativeAI | null = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Initialize the Gemini client with API key
 */
export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

/**
 * Check if Gemini is initialized
 */
export const isGeminiInitialized = () => genAI !== null;

/**
 * Get nutrition information for a food item using Gemini
 * Uses gemini-1.5-flash for fast, low-token responses
 */
export const getFoodNutritionInfo = async (
  foodDescription: string
): Promise<{
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  success: boolean;
  error?: string;
}> => {
  if (!genAI) {
    return {
      name: foodDescription,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      success: false,
      error: "Gemini not initialized. Please provide API key first.",
    };
  }

  try {
    // Use gemini-2.5-flash-lite for fastest, lowest token usage
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.2, // Lower temperature for consistent outputs
        maxOutputTokens: 150, // Limit output tokens
      },
    });

    const prompt = `Estimate nutrition for: "${foodDescription}"
Return JSON only: {"name":"short name","calories":number,"protein":number,"carbs":number,"fat":number}
Use realistic estimates. Numbers only, no units.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // Parse the JSON response
    const nutritionData = JSON.parse(jsonStr);

    return {
      name: nutritionData.name || foodDescription,
      calories: Math.round(nutritionData.calories) || 0,
      protein: Math.round(nutritionData.protein) || 0,
      carbs: Math.round(nutritionData.carbs) || 0,
      fat: Math.round(nutritionData.fat) || 0,
      success: true,
    };
  } catch (error) {
    console.error("Error getting nutrition info:", error);
    return {
      name: foodDescription,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      success: false,
      error: `Failed to get nutrition information: ${error}`,
    };
  }
};
