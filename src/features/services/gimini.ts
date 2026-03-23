const GEMINI_API_KEY = '';

/**
 * FIXED 2026 ENDPOINT:
 * 1. Switched from 'v1beta' to 'v1' (Stable)
 * 2. Switched from 'gemini-1.5-flash' to 'gemini-2.5-flash'
 */
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const analyzeSkinWithGemini = async (base64Image: string) => {
  const prompt = `
    Perform a quantitative dermatological scan. Return ONLY a JSON object:
    {
      "overall_score": 85,
      "main_report": "Text summary",
      "detections": [{"label": "Acne", "score": 20}],
      "advice": "Treatment"
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }]
        // Note: No generationConfig here to avoid 'Unknown name' errors
      })
    });

    const json = await response.json();

    // Catch API errors (like "Model not found")
    if (json.error) {
      throw new Error(`Google AI Error: ${json.error.message}`);
    }

    const textResponse = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) throw new Error("AI returned an empty response.");

    // Extract JSON (handles cases where AI adds markdown code blocks)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON data found in response.");

    return JSON.parse(jsonMatch[0]);

  } catch (error: any) {
    console.error("Dermatology Scan Error:", error.message);
    throw error;
  }
};
