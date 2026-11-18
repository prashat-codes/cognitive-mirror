
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
  "https://generativelanguage.googleapis.com/v1beta/interactions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      model: "gemini-3.5-flash-lite",
      input: prompt
    }),
    signal: AbortSignal.timeout(25000)
  }
);
    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Gemini request failed",
          details: result.error?.message || JSON.stringify(result)
        })
      };
    }

    const text = result.outputs
      ?.filter(item => item.type === "text")
      .map(item => item.text || "")
      .join("") || "";

    if (!text) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Gemini returned an empty response"
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
        details: error.name === "TimeoutError"
          ? "Gemini took too long to respond"
          : error.message
      })
    };
  }
};
