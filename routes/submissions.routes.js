
import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { name } = req.query;

    let query = supabase.from("submissions").select("*");

    if (name) {
      query = query.eq("name", name);
    }
    
    // Sort by latest first if 'created_at' exists, otherwise default Supabase order
    // Assuming 'created_at' column exists as it's standard, but if not it will just ignore
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      count: data.length,
      submissions: data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
