import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE_URL:", supabaseUrl); // debug

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables not loaded properly");
}

export const supabase = createClient(supabaseUrl, supabaseKey);