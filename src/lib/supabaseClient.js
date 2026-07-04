import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the app — just warn loudly so it's obvious in dev/build logs
  // that the .env file is missing. See README.md → "Environment variables".
  console.warn(
    "[Together] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env and fill in your Supabase project credentials."
  );
}

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-anon-key");
