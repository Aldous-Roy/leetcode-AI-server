import express from "express";
import { callAI } from "../services/ai.service.js";
import { buildJudgePrompt } from "../services/prompt.service.js";
import { supabase } from "../config/supabase.js";

const router = express.Router();

/* =========================
   SUBMIT (Store in DB)
========================= */
router.post("/submit", async (req, res) => {
  try {
    const { name, problem, code, language } = req.body;

    if (!name || !problem || !code || !language) {
      return res.status(400).json({
        success: false,
        error: "name, problem, code and language required"
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

    // 🔥 Safe JSON Parsing
    let parsed;
    try {
      const cleaned = aiReply
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON",
        raw: aiReply
      });
    }

    // 🔥 Store in Supabase
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
      mode: "submit",
      submission: data[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


/* =========================
   RUN (No DB Storage)
========================= */
router.post("/run", async (req, res) => {
  try {
    const { problem, code, language } = req.body;

    if (!problem || !code || !language) {
      return res.status(400).json({
        success: false,
        error: "problem, code and language required"
      });
    }

    const prompt = buildJudgePrompt(problem, code, language);

    const aiReply = await callAI(
      [
        { role: "system", content: "You are a coding evaluator." },
        { role: "user", content: prompt }
      ],
      0
    );

    // 🔥 Safe JSON Parsing
    let parsed;
    try {
      const cleaned = aiReply
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON",
        raw: aiReply
      });
    }

    // ❌ Do NOT store in DB
    res.json({
      success: true,
      mode: "run",
      result: parsed
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;