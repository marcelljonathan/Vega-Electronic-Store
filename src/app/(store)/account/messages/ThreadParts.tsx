"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MESSAGE_MAX, MESSAGE_MIN } from "@/lib/support-threads";
import type { MessageResult } from "./actions";

// Runs an action once when a conversation is opened (clears its unread dot),
// then refreshes so the badges update.
export function MarkRead({ action }: { action: () => Promise<void> }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return; // once per visit — the refresh below re-renders this
    done.current = true;
    action().then(() => router.refresh());
  }, [action, router]);
  return null;
}

// The reply box under a conversation — used by buyers and admins.
export function ReplyBox({
  send,
  placeholder,
  buttonLabel = "Send",
}: {
  send: (message: string) => Promise<MessageResult | { ok: true } | { ok: false; message: string }>;
  placeholder: string;
  buttonLabel?: string;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (text.trim().length < MESSAGE_MIN) {
      setError(`Please write at least ${MESSAGE_MIN} characters.`);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await send(text);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label htmlFor="reply" className="sr-only">
        Your message
      </label>
      <textarea
        id="reply"
        rows={4}
        value={text}
        maxLength={MESSAGE_MAX}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "reply-error" : undefined}
        className={`w-full resize-y rounded-xl border bg-bg px-4 py-3 text-sm outline-none transition-colors focus:border-accent placeholder:text-muted/60 ${
          error ? "border-red-500" : "border-line"
        }`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span id="reply-error" className="text-sm text-red-500">
          {error}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {pending ? "Sending…" : buttonLabel}
        </button>
      </div>
    </form>
  );
}
