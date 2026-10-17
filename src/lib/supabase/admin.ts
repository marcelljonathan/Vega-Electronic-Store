import "server-only";
import { createClient } from "@supabase/supabase-js";

// Supabase with the SECRET key — full access, skips RLS. Server code only:
// the "server-only" import makes the build fail if a browser file imports this.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is missing from .env.local");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
