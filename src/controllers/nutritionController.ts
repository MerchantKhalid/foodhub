import { Request, Response } from 'express';

interface UsdaNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface UsdaFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients: UsdaNutrient[];
}

interface UsdaSearchResponse {
  foods: UsdaFood[];
  totalHits: number;
}

const NUTRIENT_IDS = {
  CALORIES: 1008, // Energy in kcal
  PROTEIN: 1003, // Protein in grams
  CARBS: 1005, // Carbohydrate by difference in grams
  FAT: 1004, // Total lipid (fat) in grams
  SODIUM: 1093, // Sodium in mg
};

function findNutrient(nutrients: UsdaNutrient[], id: number): number {
  const found = nutrients.find((n) => n.nutrientId === id);
  // If not found, return 0. Math.round removes decimals
  return found ? Math.round(found.value) : 0;
}

// Main controller function — handles GET /api/nutrition?query=...
export const getNutrition = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = req.query.query as string;

  // Step 2: Validate input — don't proceed if nothing was typed
  if (!query || query.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Please provide a meal name to search for.',
    });
    return;
  }

  // Step 3: Check that the API key is configured
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      success: false,
      message:
        'Nutrition API key not configured. Add USDA_API_KEY to your .env file.',
    });
    return;
  }

  try {
    // Step 4: Build the USDA API URL
    // We use the "Branded + Foundation" data type for restaurant-style foods
    // pageSize=5 means we get the top 5 results (we'll show the best match)
    const usdaUrl = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
    usdaUrl.searchParams.set('query', query.trim());
    usdaUrl.searchParams.set('api_key', apiKey);
    usdaUrl.searchParams.set('pageSize', '5');
    usdaUrl.searchParams.set('dataType', 'Branded,Foundation,Survey (FNDDS)');

    // Step 5: Call the USDA API using fetch (built into Node.js 18+)
    const usdaResponse = await fetch(usdaUrl.toString());

    // Step 6: Handle HTTP errors from USDA (e.g., invalid API key = 403)
    if (!usdaResponse.ok) {
      if (usdaResponse.status === 403) {
        res.status(500).json({
          success: false,
          message:
            'Invalid USDA API key. Please check your USDA_API_KEY in .env',
        });
        return;
      }
      res.status(500).json({
        success: false,
        message:
          'Failed to reach the nutrition database. Try again in a moment.',
      });
      return;
    }

    // Step 7: Parse the JSON response from USDA
    const data = (await usdaResponse.json()) as UsdaSearchResponse;

    // Step 8: Handle "no results found" case
    if (!data.foods || data.foods.length === 0) {
      res.json({
        success: false,
        message: `No nutrition data found for "${query}". Try a simpler name like "burger" or "pizza".`,
        suggestions: [
          'Try broader terms: "burger" instead of "chicken burger"',
          'Use common names: "pizza" instead of "margherita pizza"',
          'Check spelling',
        ],
      });
      return;
    }

    // Step 9: Process all results and extract the nutrients we care about
    const results = data.foods.map((food) => ({
      name: food.description,
      brand: food.brandOwner || null, // null if it's a generic food (not branded)
      nutrition: {
        calories: findNutrient(food.foodNutrients, NUTRIENT_IDS.CALORIES),
        protein: findNutrient(food.foodNutrients, NUTRIENT_IDS.PROTEIN), // grams
        carbs: findNutrient(food.foodNutrients, NUTRIENT_IDS.CARBS), // grams
        fat: findNutrient(food.foodNutrients, NUTRIENT_IDS.FAT), // grams
        sodium: findNutrient(food.foodNutrients, NUTRIENT_IDS.SODIUM), // mg
      },
    }));

    // Step 10: Send successful response back to frontend
    res.json({
      success: true,
      query: query,
      totalFound: data.totalHits,
      // bestMatch is the first (most relevant) result
      bestMatch: results[0],
      // alternatives are the other results the user can choose from
      alternatives: results.slice(1),
    });
  } catch (error) {
    // This catches network errors (e.g., no internet, USDA is down)
    console.error('[Nutrition API Error]', error);
    res.status(500).json({
      success: false,
      message:
        'Something went wrong fetching nutrition data. Please try again.',
    });
  }
};
