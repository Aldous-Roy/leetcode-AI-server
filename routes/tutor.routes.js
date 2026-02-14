import express from "express";
import { callAI } from "../services/ai.service.js";
import { buildTutorPrompt } from "../services/prompt.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const stats = req.body;

    // Basic validation
    if (
      stats.totalSolved === undefined ||
      stats.easySolved === undefined ||
      stats.mediumSolved === undefined ||
      stats.hardSolved === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: "Complete LeetCode stats object is required"
      });
    }

    const prompt = buildTutorPrompt(stats);

    const aiReply = await callAI(
      [
        { role: "system", content: "You are a strict DSA tutor." },
        { role: "user", content: prompt }
      ],
      0.3 // slight flexibility for planning
    );

    res.json({
      success: true,
      modelUsed: "stepfun/step-3.5-flash:free",
      tutorReply: aiReply
    });

  } catch (err) {
    console.error("Tutor Route Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;