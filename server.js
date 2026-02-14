import dotenv from "dotenv";
import express from "express";
import cors from "cors";
// import dotenv from "dotenv";
dotenv.config(); 
console.log("ENV CHECK:", process.env.SUPABASE_URL);
import judgeRoutes from "./routes/judge.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";


// 🔒 Ensure API key exists
if (!process.env.OPENROUTER_API_KEY) {
  console.error("Missing OPENROUTER_API_KEY");
  process.exit(1);
}

const app = express();

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// ---------- PORT ----------
const PORT = process.env.PORT || 8000;

// ---------- HEALTH CHECK ----------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI DSA Platform running",
    model: "stepfun/step-3.5-flash:free"
  });
});

// ---------- ROUTES ----------
app.use("/api/judge", judgeRoutes);
app.use("/api/tutor", tutorRoutes);

// ---------- 404 HANDLER ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// ---------- GLOBAL ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal Server Error"
  });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});