
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key is not configured" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "A prompt is required" })
      };
    }

    if (prompt.length > 12000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is too long" })
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Gemini request failed",
          details: result.error?.message || "Unknown API error"
        })
      };
    }

    const text = result.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("") || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
