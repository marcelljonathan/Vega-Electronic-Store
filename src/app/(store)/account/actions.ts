"use server";

import { createClient as createPlainClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { MIN_PASSWORD } from "@/lib/account";

export type PasswordResult =
  | { ok: true }
  | { ok: false; field: "current" | "next" | "form"; message: string };

// Changing the password needs the current one. It's checked first on a
// throwaway session, so a wrong password can't disturb the buyer's own.
// Then the buyer gets a fresh sign-in and the password is changed on it:
// Supabase signs out every *other* session (other devices) and keeps this one.
export async function changePassword(
  current: string,
  next: string,
): Promise<PasswordResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, field: "form", message: "Please sign in again." };
  }
  if (typeof next !== "string" || next.length < MIN_PASSWORD) {
    return { ok: false, field: "next", message: `Use at least ${MIN_PASSWORD} characters.` };
  }
  if (next === current) {
    return { ok: false, field: "next", message: "Choose a password different from your current one." };
  }

  const check = createPlainClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { error: signInError } = await check.auth.signInWithPassword({
    email: user.email,
    password: typeof current === "string" ? current : "",
  });
  if (signInError) {
    return { ok: false, field: "current", message: "That password isn't right." };
  }
  await check.auth.signOut({ scope: "local" }); // closes only the throwaway session

  const { error: refreshError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (refreshError) {
    console.error("changePassword (sign-in):", refreshError.message);
    return { ok: false, field: "form", message: "We couldn't change your password. Please try again." };
  }
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    console.error("changePassword:", error.message);
    if (error.code === "weak_password") {
      return { ok: false, field: "next", message: "That password is too easy to guess. Try a longer one." };
    }
    return { ok: false, field: "form", message: "We couldn't change your password. Please try again." };
  }
  return { ok: true };
}
