/**
 * OpenFoodFacts API Service
 * Free, open-source food database for barcode scanning
 */

const OPENFOODFACTS_API_BASE = "https://world.openfoodfacts.org/api/v2";

export interface OpenFoodFactsProduct {
    name: string;
    brand?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: string;
    imageUrl?: string;
    barcode: string;
}

interface OpenFoodFactsResponse {
    code: string;
    status: number;
    status_verbose: string;
    product?: {
        product_name?: string;
        product_name_en?: string;
        brands?: string;
        nutriments?: {
            "energy-kcal_100g"?: number;
            "energy-kcal_serving"?: number;
            proteins_100g?: number;
            proteins_serving?: number;
            carbohydrates_100g?: number;
            carbohydrates_serving?: number;
            fat_100g?: number;
            fat_serving?: number;
        };
        serving_size?: string;
        image_url?: string;
        image_front_url?: string;
    };
}

/**
 * Look up a product by its barcode (EAN/UPC)
 * @param barcode The barcode string (EAN-13, UPC-A, etc.)
 * @returns Product information or null if not found
 */
export const getProductByBarcode = async (
    barcode: string
): Promise<{
    product: OpenFoodFactsProduct | null;
    success: boolean;
    error?: string;
}> => {
    try {
        // Clean up barcode - remove any whitespace
        const cleanBarcode = barcode.trim().replace(/\s/g, "");

        if (!cleanBarcode || cleanBarcode.length < 8) {
            return {
                product: null,
                success: false,
                error: "Invalid barcode format",
            };
        }

        const response = await fetch(
            `${OPENFOODFACTS_API_BASE}/product/${cleanBarcode}.json`,
            {
                headers: {
                    "User-Agent": "Calry - Food Tracker App",
                },
            }
        );

        if (!response.ok) {
            return {
                product: null,
                success: false,
                error: `API error: ${response.status}`,
            };
        }

        const data: OpenFoodFactsResponse = await response.json();

        if (data.status !== 1 || !data.product) {
            return {
                product: null,
                success: false,
                error: "Product not found in database",
            };
        }

        const product = data.product;
        const nutriments = product.nutriments || {};

        // Get the product name (prefer English name if available)
        const name = product.product_name_en || product.product_name || "Unknown Product";

        // Prefer per-serving values if available, otherwise use per-100g
        const hasServing = nutriments["energy-kcal_serving"] !== undefined;

        const calories = Math.round(
            hasServing
                ? nutriments["energy-kcal_serving"] || 0
                : nutriments["energy-kcal_100g"] || 0
        );

        const protein = Math.round(
            hasServing
                ? nutriments.proteins_serving || 0
                : nutriments.proteins_100g || 0
        );

        const carbs = Math.round(
            hasServing
                ? nutriments.carbohydrates_serving || 0
                : nutriments.carbohydrates_100g || 0
        );

        const fat = Math.round(
            hasServing
                ? nutriments.fat_serving || 0
                : nutriments.fat_100g || 0
        );

        return {
            product: {
                name,
                brand: product.brands,
                calories,
                protein,
                carbs,
                fat,
                servingSize: hasServing ? product.serving_size : "100g",
                imageUrl: product.image_front_url || product.image_url,
                barcode: cleanBarcode,
            },
            success: true,
        };
    } catch (error) {
        console.error("Error fetching product from OpenFoodFacts:", error);
        return {
            product: null,
            success: false,
            error: `Network error: ${error}`,
        };
    }
};

/**
 * Search for products by name (useful as a fallback)
 * @param query Search term
 * @param limit Maximum number of results
 */
export const searchProducts = async (
    query: string,
    limit: number = 10
): Promise<{
    products: OpenFoodFactsProduct[];
    success: boolean;
    error?: string;
}> => {
    try {
        const encodedQuery = encodeURIComponent(query.trim());

        const response = await fetch(
            `${OPENFOODFACTS_API_BASE}/search?search_terms=${encodedQuery}&page_size=${limit}&json=true`,
            {
                headers: {
                    "User-Agent": "Calry - Food Tracker App",
                },
            }
        );

        if (!response.ok) {
            return {
                products: [],
                success: false,
                error: `API error: ${response.status}`,
            };
        }

        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            return {
                products: [],
                success: false,
                error: "No products found",
            };
        }

        const products: OpenFoodFactsProduct[] = data.products
            .filter((p: any) => p.product_name)
            .map((product: any) => {
                const nutriments = product.nutriments || {};
                const hasServing = nutriments["energy-kcal_serving"] !== undefined;

                return {
                    name: product.product_name_en || product.product_name || "Unknown",
                    brand: product.brands,
                    calories: Math.round(
                        hasServing
                            ? nutriments["energy-kcal_serving"] || 0
                            : nutriments["energy-kcal_100g"] || 0
                    ),
                    protein: Math.round(
                        hasServing
                            ? nutriments.proteins_serving || 0
                            : nutriments.proteins_100g || 0
                    ),
                    carbs: Math.round(
                        hasServing
                            ? nutriments.carbohydrates_serving || 0
                            : nutriments.carbohydrates_100g || 0
                    ),
                    fat: Math.round(
                        hasServing
                            ? nutriments.fat_serving || 0
                            : nutriments.fat_100g || 0
                    ),
                    servingSize: hasServing ? product.serving_size : "100g",
                    imageUrl: product.image_front_url || product.image_url,
                    barcode: product.code,
                };
            });

        return {
            products,
            success: true,
        };
    } catch (error) {
        console.error("Error searching OpenFoodFacts:", error);
        return {
            products: [],
            success: false,
            error: `Network error: ${error}`,
        };
    }
};
