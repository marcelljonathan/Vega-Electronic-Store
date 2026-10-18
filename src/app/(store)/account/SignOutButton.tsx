"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      disabled={pending}
      className="self-start rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-fg disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
