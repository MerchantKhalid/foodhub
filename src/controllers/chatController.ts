// ============================================================
// FILE: backend/src/controllers/chatController.ts  (NEW FILE)
//
// PURPOSE: AI chatbot that answers food-related questions
//
// HOW IT WORKS:
//   1. User asks something like "show me vegetarian meals under $10"
//   2. Frontend sends the message to POST /api/chat
//   3. This controller fetches REAL data from your database
//      (meals, categories, providers)
//   4. It sends that data + user's question to Claude AI
//   5. Claude reads your actual menu and gives a smart answer
//   6. The answer is sent back to the frontend
//
// WHY FETCH REAL DATA?
//   Without real data, the AI would just guess or make up meals.
//   By sending your actual menu to Claude, it can say:
//   "Yes! I found 3 vegetarian meals: Veggie Burger ($8),
//    Falafel Wrap ($9), Garden Salad ($7)"
//
// API USED: Anthropic Claude API (claude-haiku — cheapest & fast)
//   Cost: ~$0.001 per conversation (extremely cheap)
//   Get key at: https://console.anthropic.com
// ============================================================

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The main chat handler
export const chat = async (req: Request, res: Response): Promise<void> => {
  // Step 1: Get the user's message from the request body
  const { message, conversationHistory } = req.body;

  // Step 2: Validate input
  if (!message || message.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Please provide a message.',
    });
    return;
  }

  // Step 3: Check API key is configured
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      success: false,
      message:
        'AI service not configured. Add ANTHROPIC_API_KEY to your .env file.',
    });
    return;
  }

  try {
    // Step 4: Fetch REAL data from your database
    // This is what makes the chatbot actually useful —
    // it knows your actual meals, prices, and categories

    const [meals, categories, providers] = await Promise.all([
      // Get all available meals with their details
      prisma.meal.findMany({
        where: { isAvailable: true },
        select: {
          name: true,
          description: true,
          price: true,
          dietaryInfo: true,
          prepTime: true,
          category: { select: { name: true } },
          provider: {
            select: {
              providerProfile: {
                select: { restaurantName: true },
              },
            },
          },
        },
        take: 50, // Limit to 50 meals to keep the AI prompt a reasonable size
        orderBy: { createdAt: 'desc' },
      }),

      // Get all categories
      prisma.category.findMany({
        select: { name: true },
      }),

      // Get all active providers/restaurants
      prisma.providerProfile.findMany({
        select: {
          restaurantName: true,
          cuisineType: true,
          description: true,
        },
        take: 20,
      }),
    ]);

    // Step 5: Format the meals data into a readable text for Claude
    // Claude reads this and uses it to answer the user's question
    const mealsText = meals
      .map(
        (meal) =>
          `- ${meal.name} | $${meal.price.toFixed(2)} | ${meal.category?.name || 'Uncategorized'} | ${meal.dietaryInfo} | ${meal.provider?.providerProfile?.restaurantName || 'Unknown restaurant'} | Prep: ${meal.prepTime || '?'} min | ${meal.description?.substring(0, 80) || ''}`,
      )
      .join('\n');

    const categoriesText = categories.map((c) => c.name).join(', ');

    const restaurantsText = providers
      .map(
        (p) =>
          `- ${p.restaurantName}${p.cuisineType ? ` (${p.cuisineType})` : ''}`,
      )
      .join('\n');

    // Step 6: Build the system prompt
    // This tells Claude WHO it is and WHAT DATA it has access to
    const systemPrompt = `You are FoodHub Assistant 🍔 — a friendly, helpful AI for the FoodHub food ordering app.

Your job is to help customers find meals, answer questions about the menu, and guide them to what they're looking for.

HERE IS THE CURRENT MENU DATA (use this to answer questions accurately):

=== AVAILABLE MEALS ===
${mealsText || 'No meals available right now.'}

=== CATEGORIES ===
${categoriesText || 'No categories available.'}

=== RESTAURANTS ===
${restaurantsText || 'No restaurants available.'}

RULES:
- Only recommend meals that exist in the menu data above
- When recommending meals, mention the name, price, and restaurant
- Be friendly, concise, and helpful
- If asked about something not on the menu, say so honestly
- For dietary questions (vegetarian, vegan, halal etc), filter by dietaryInfo field
- For price questions, filter by the price shown
- Keep responses short — 3-5 sentences max unless listing multiple items
- Use emojis occasionally to be friendly 🍕🥗🍔
- If the menu is empty, apologize and suggest checking back later`;

    // Step 7: Build conversation history for Claude
    // This lets Claude remember what was said earlier in the conversation
    // conversationHistory is an array of {role, content} objects sent from frontend
    const messages = [
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    // Step 8: Call the Anthropic Claude API
    const claudeResponse = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', // Cheapest + fastest Claude model
          max_tokens: 500, // Keep responses concise
          system: systemPrompt,
          messages: messages,
        }),
      },
    );

    // Step 9: Handle API errors
    if (!claudeResponse.ok) {
      const errorData = (await claudeResponse.json()) as any;
      console.error('[Claude API Error]', errorData);

      if (claudeResponse.status === 401) {
        res.status(500).json({
          success: false,
          message:
            'Invalid Anthropic API key. Check your ANTHROPIC_API_KEY in .env',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again.',
      });
      return;
    }

    // Step 10: Parse the response
    const claudeData = (await claudeResponse.json()) as any;
    const aiReply =
      claudeData.content?.[0]?.text ||
      'Sorry, I could not generate a response.';

    // Step 11: Send the reply back to the frontend
    res.json({
      success: true,
      reply: aiReply,
    });
  } catch (error) {
    console.error('[Chat Controller Error]', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  }
};
