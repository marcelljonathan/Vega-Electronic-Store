"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ThreadStatus } from "@/lib/support-threads";
import { setThreadStatus } from "./actions";

// "Mark as resolved" / "Reopen" on an admin conversation page.
export default function ThreadStatusButton({
  threadId,
  status,
}: {
  threadId: string;
  status: ThreadStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const resolved = status === "resolved";

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await setThreadStatus(threadId, resolved ? "open" : "resolved");
      if (!result.ok) setError(result.message);
      else router.refresh();
    });
  }

  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60 ${
          resolved
            ? "border border-line hover:border-fg"
            : "bg-emerald-500 text-white"
        }`}
      >
        {pending ? "Saving…" : resolved ? "Reopen" : "Mark as resolved"}
      </button>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </span>
  );
}
