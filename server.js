import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const REQUIRED_ENV = ["OPENROUTER_API_KEY"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
}

console.log("OPENROUTER_API_KEY loaded");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

// ---------- OPENROUTER CONFIG ----------
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "stepfun/step-3.5-flash:free";

//promt builder
function buildTutorPrompt(stats) {
  return `
You are a strict Data Structures and Algorithms tutor.

Student LeetCode Statistics:
- Total Solved: ${stats.totalSolved}
- Easy: ${stats.easySolved}/${stats.totalEasy}
- Medium: ${stats.mediumSolved}/${stats.totalMedium}
- Hard: ${stats.hardSolved}/${stats.totalHard}
- Ranking: ${stats.ranking}

TASKS:
1. Classify DSA level.
2. Identify weak areas.
3. Provide a STEP-BY-STEP improvement plan.
4. List topics in correct learning order.
5. Define a daily problem-solving routine.

RULES:
- No motivation
- No praise
- No encouragement
- No emotional language
- No emojis
- Only steps and factual guidance
- Use numbered lists and bullet points
`;
}


app.get("/", (req, res) => {
  res.json({
    success: true,
    status: "API running",
    model: MODEL
  });
});


app.get("/api/check-key", async (req, res) => {
  try {
    const test = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: "Reply with OK" }],
        temperature: 0
      })
    });

    const text = await test.text();

    if (!test.ok) {
      return res.status(test.status).json({
        success: false,
        error: text
      });
    }

    res.json({
      success: true,
      message: "API key is valid",
      rawResponse: JSON.parse(text)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


app.post("/api/dsa-tutor", async (req, res) => {
  try {
    const stats = req.body;

    if (!stats || stats.totalSolved === undefined) {
      return res.status(400).json({
        success: false,
        error: "LeetCode stats object is required"
      });
    }

    const prompt = buildTutorPrompt(stats);

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "DSA AI Tutor"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a strict DSA tutor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    const rawText = await response.text();
    console.log("🔹 OpenRouter status:", response.status);

    if (!response.ok) {
      console.error("🔴 OpenRouter error:", rawText);
      return res.status(response.status).json({
        success: false,
        error: rawText
      });
    }

    const data = JSON.parse(rawText);

    res.json({
      success: true,
      modelUsed: MODEL,
      tutorReply: data?.choices?.[0]?.message?.content || ""
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


app.listen(PORT, () => {
  console.log(`✅ DSA Tutor API running on http://localhost:${PORT}`);
});