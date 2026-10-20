import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { THREAD_SELECT, type SupportThread } from "@/lib/support-threads";
import { ThreadRow } from "./ThreadView";

export const metadata: Metadata = {
  title: "Support messages — Vega",
};

export default async function MyMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/account/messages");

  // Only this buyer's own conversations.
  const { data } = await supabase
    .from("support_threads")
    .select(THREAD_SELECT)
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false });
  const threads = (data ?? []) as SupportThread[];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-7 py-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/account"
          className="text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          ← My account
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Support</h1>
          <Link
            href="/support#contact"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
          >
            New message
          </Link>
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-3xl bg-card p-8">
          <p className="font-semibold">No conversations yet.</p>
          <p className="text-sm text-muted">
            Questions about a product or an order? Our team replies right here.
          </p>
          <Link href="/support#contact" className="mt-2 text-sm font-semibold text-accent">
            Message us →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {threads.map((t) => (
            <li key={t.id}>
              <ThreadRow thread={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
