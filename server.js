import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "stepfun/step-3.5-flash:free";

// ---------- STRICT PROMPT (NO MOTIVATION) ----------
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
1. Classify the student's DSA level.
2. Identify weak areas based on statistics.
3. Provide a STEP-BY-STEP improvement plan.
4. Provide a 30-day roadmap (week-wise).
5. List topics to study in correct order.
6. Define a daily problem-solving routine.

STRICT RULES:
- NO motivation
- NO encouragement
- NO praise
- NO emotional language
- NO emojis
- ONLY steps and factual guidance
- Use numbered lists and bullet points
- Be structured and complete
`;
}

// ---------- HEALTH CHECK ----------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DSA Tutor API running"
  });
});

// ---------- AI TUTOR ENDPOINT ----------
app.post("/api/dsa-tutor", async (req, res) => {
  try {
    const stats = req.body;

    // Basic validation
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
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: rawText
      });
    }

    const data = JSON.parse(rawText);

    const tutorReply =
      data?.choices?.[0]?.message?.content || "";

    res.json({
      success: true,
      modelUsed: MODEL,
      tutorReply
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ DSA Tutor API running on http://localhost:${PORT}`);
});