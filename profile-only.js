import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// 🔹 HARD-CODED USERNAME HERE
const USERNAME = "Divyadharshiny37";

app.get("/api/profile", async (req, res) => {
  try {
    console.log("🔵 Fetching profile for:", USERNAME);

    const lcRes = await fetch(
      `https://leetcode-api-ecru.vercel.app/userProfile/${USERNAME}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    console.log("🔵 LeetCode API status:", lcRes.status);

    const data = await lcRes.json();

    // 🔴 LOG FULL PROFILE DATA
    console.log("🔵 Profile data 👇");
    console.log(JSON.stringify(data, null, 2));

    // ✅ Return data directly
    res.status(200).json(data);

  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on port 5000 (hardcoded username mode)");
});