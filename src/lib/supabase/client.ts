import { createBrowserClient } from "@supabase/ssr";

// Supabase for client components. The session lives in cookies, so the
// server can read the same sign-in.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
