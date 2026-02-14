import express from "express";
import { callAI } from "../services/ai.service.js";
import { buildQuestionPrompt } from "../services/prompt.service.js";

const router = express.Router();

router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;

    // Handle "random" explicitly
    const topic = name.toLowerCase() === "random" ? "a random LeetCode problem (not Two Sum)" : name;
    
    const prompt = buildQuestionPrompt(topic);

    const aiReply = await callAI(
      [
        { role: "system", content: "You are a LeetCode problem generator." },
        { role: "user", content: prompt }
      ],
      0.7 // Higher creativity for varying details if needed, but strict structure
    );

    // Attempt to parse JSON strictly
    let problemData;
    try {
        // sometimes AI wraps JSON in code blocks
        const cleanedReply = aiReply.replace(/```json/g, "").replace(/```/g, "").trim();
        problemData = JSON.parse(cleanedReply);
    } catch (e) {
        console.error("Failed to parse AI response:", aiReply);
        return res.status(500).json({
            success: false,
            error: "Failed to generate valid JSON question data from AI."
        });
    }

    res.json({
      success: true,
      data: problemData
    });

  } catch (err) {
    console.error("Question Route Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
