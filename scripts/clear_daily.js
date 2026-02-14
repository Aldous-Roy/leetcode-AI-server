import { supabase } from "../config/supabase.js";

async function clearDaily() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`Clearing daily challenge for ${today}...`);
  
  const { error } = await supabase
    .from("daily_challenges")
    .delete()
    .eq("date", today);

  if (error) {
    console.error("Error clearing daily:", error);
  } else {
    console.log("Successfully cleared daily challenge.");
  }
}

clearDaily();
