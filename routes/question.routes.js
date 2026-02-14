import express from "express";
import { callAI } from "../services/ai.service.js";
import { buildQuestionPrompt } from "../services/prompt.service.js";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    // Handle "random" explicitly
    if (name.toLowerCase() === "random") {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // 1. Check Supabase for existing daily challenge
      const { data: existingDaily, error: dbError } = await supabase
        .from("daily_challenges")
        .select("question")
        .eq("date", today)
        .single();

      if (existingDaily && existingDaily.question) {
        // HIT: Return cached question
        return res.json({
          success: true,
          data: existingDaily.question,
          source: "database_cache"
        });
      }

      // MISS: Generate new random question via AI
      const prompt = buildQuestionPrompt("a random LeetCode problem (not Two Sum)");
      const aiReply = await callAI(
        [
          { role: "system", content: "You are a LeetCode problem generator." },
          { role: "user", content: prompt }
        ],
        0.8 // High creativity for new problems
      );

      let problemData;
      try {
        const cleanedReply = aiReply.replace(/```json/g, "").replace(/```/g, "").trim();
        problemData = JSON.parse(cleanedReply);
      } catch (e) {
        console.error("AI Parse Error:", e);
        return res.status(500).json({ success: false, error: "AI generation failed" });
      }

      // 2. Store in Supabase
      const { error: insertError } = await supabase
        .from("daily_challenges")
        .insert([{ date: today, question: problemData }]);

      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        // Continue anyway, just return the data without caching
      }

      return res.json({
        success: true,
        data: problemData,
        source: "ai_generated"
      });
    }

    // Normal non-random flow
    const prompt = buildQuestionPrompt(name);
    const aiReply = await callAI(
      [
        { role: "system", content: "You are a LeetCode problem generator." },
        { role: "user", content: prompt }
      ],
      0.5
    );

    let problemData;
    try {
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
