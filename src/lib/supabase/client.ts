import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam estar definidas (.env.local em dev, env vars do projeto na Vercel em produção)."
  );
}

/** Cliente Supabase para uso no browser (respeita RLS, usa a chave anônima/publicável). */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
