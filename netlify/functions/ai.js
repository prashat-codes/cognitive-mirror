
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Groq API key is not configured" })
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
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Groq request failed",
          details: result.error?.message || "Unknown provider error"
        })
      };
    }

    const text = result.choices?.[0]?.message?.content || "";

    if (!text) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Groq returned an empty response"
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "AI request failed",
        details: error.message
      })
    };
  }
};
