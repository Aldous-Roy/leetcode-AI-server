import fetch from "node-fetch";
import { OPENROUTER_URL, MODEL } from "../config/openrouter.js";

export async function callAI(messages, temperature = 0) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:8000",
      "X-Title": "AI DSA Platform"
    },
    body: JSON.stringify({
      model: MODEL,  // ALWAYS this model
      messages,
      temperature
    })
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(rawText);
  }

  const data = JSON.parse(rawText);

  return data?.choices?.[0]?.message?.content || "";
}