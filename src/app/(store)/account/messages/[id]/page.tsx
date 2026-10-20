import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { THREAD_SELECT, threadTitle, type SupportThread } from "@/lib/support-threads";
import { OrderContextCard, ThreadMessages, ThreadStatusPill } from "../ThreadView";
import { MarkRead, ReplyBox } from "../ThreadParts";
import { markReadByCustomer, sendCustomerMessage } from "../actions";

export const metadata: Metadata = {
  title: "Conversation — Vega",
};

export default async function ConversationPage({
  params,
  searchParams,
}: PageProps<"/account/messages/[id]">) {
  const { id } = await params;
  const { sent } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/signin?next=/account/messages/${encodeURIComponent(id)}`);

  const { data } = await supabase
    .from("support_threads")
    .select(THREAD_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) notFound();
  const thread = data as SupportThread;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-7 py-16">
      {thread.customer_unread && <MarkRead action={markReadByCustomer.bind(null, thread.id)} />}

      {sent === "1" && (
        <div role="status" className="flex items-center gap-4 rounded-3xl bg-accent/10 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white">
            ✓
          </span>
          <div className="flex flex-col">
            <span className="font-semibold">Message sent.</span>
            <span className="text-sm text-muted">
              Our team usually replies within 24 hours — the reply will appear here.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/account/messages"
          className="text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          ← All conversations
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            {threadTitle(thread)}
          </h1>
          <ThreadStatusPill status={thread.status} side="customer" />
        </div>
      </div>

      {thread.follow_up_of && (
        <Link
          href={`/account/messages/${thread.follow_up_of}`}
          className="self-start text-sm font-semibold text-accent"
        >
          ↩ Follow-up to an earlier conversation →
        </Link>
      )}

      {thread.order && <OrderContextCard order={thread.order} />}

      <ThreadMessages thread={thread} viewer="customer" />

      {thread.status === "resolved" ? (
        // Resolved is final: more questions go into a new, linked conversation.
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-card p-5">
          <div className="flex flex-col">
            <span className="font-semibold">✓ This conversation is resolved.</span>
            <span className="text-sm text-muted">Need more help with this?</span>
          </div>
          <Link
            href={`/support?followUp=${thread.id}${
              thread.product ? `&product=${encodeURIComponent(thread.product)}` : ""
            }${thread.order ? `&order=${thread.order.number}` : ""}#contact`}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white"
          >
            Start a follow-up
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-line p-5">
          <ReplyBox send={sendCustomerMessage.bind(null, thread.id)} placeholder="Write a reply…" />
        </div>
      )}
    </div>
  );
}
