import express from "express";
import { callAI } from "../services/ai.service.js";
import { buildJudgePrompt } from "../services/prompt.service.js";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { name, problem, code, language } = req.body;

    if (!problem || !code || !language) {
      return res.status(400).json({
        success: false,
        error: "problem, code and language required"
      });
    }

    const prompt = buildJudgePrompt(problem, code, language);

    const aiReply = await callAI(
      [
        { role: "system", content: "You are a strict coding judge." },
        { role: "user", content: prompt }
      ],
      0
    );

    let parsed;
    try {
      parsed = JSON.parse(aiReply);
    } catch {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON",
        raw: aiReply
      });
    }

    // 🔥 STORE IN SUPABASE
    const { data, error } = await supabase
      .from("submissions")
      .insert([
        {
          name,
          problem,
          language,
          code,
          status: parsed.status,
          score: parsed.score,
          complexity: parsed.complexity,
          generated_test_cases: parsed.generatedTestCases,
          feedback: parsed.feedback
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      submission: data[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;