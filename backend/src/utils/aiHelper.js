import dotenv from "dotenv";

dotenv.config();

async function callGemini(prompt) {
  const key = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

  if (!key) {
    console.error("❌ Thiếu GROQ_API_KEY trong file .env");
    return {
      word: "Lỗi Config",
      meaning_vi: "Chưa cấu hình Key Groq",
      description: "Vui lòng kiểm tra file .env",
      examples: [],
    };
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful JSON assistant. You must output valid JSON only. No markdown.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("❌ Groq API Error:", JSON.stringify(errData, null, 2));
      throw new Error("Lỗi kết nối AI (Groq)");
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "{}";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ AI Crash:", error.message);
    return {
      word: "Error",
      meaning_vi: "Hệ thống đang bận",
      description: "Vui lòng thử lại sau.",
      examples: [],
    };
  }
}

export { callGemini };
