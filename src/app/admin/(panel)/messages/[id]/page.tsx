import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
import { formatOrderDate, type OrderStatus } from "@/lib/orders";
import {
  THREAD_SELECT,
  formatMessageTime,
  threadTitle,
  type SupportThread,
} from "@/lib/support-threads";
import {
  OrderContextCard,
  ThreadMessages,
  ThreadStatusPill,
} from "@/app/(store)/account/messages/ThreadView";
import { MarkRead, ReplyBox } from "@/app/(store)/account/messages/ThreadParts";
import { StatusPill } from "@/app/(store)/orders/OrderParts";
import { markReadByAdmin, replyToThread } from "../actions";
import ThreadStatusButton from "../ThreadStatusButton";

export const metadata: Metadata = {
  title: "Conversation",
};

export default async function AdminConversationPage({
  params,
}: PageProps<"/admin/messages/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const { data } = await supabase
    .from("support_threads")
    .select(THREAD_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const thread = data as SupportThread;

  // The customer's recent orders — handy for "where's my order?" questions.
  const { data: orderRows } = await supabase
    .from("orders")
    .select("number, status, total, created_at")
    .eq("user_id", thread.user_id)
    .order("created_at", { ascending: false })
    .limit(5);
  const orders = (orderRows ?? []) as {
    number: string;
    status: OrderStatus;
    total: number;
    created_at: string;
  }[];

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      {thread.admin_unread && <MarkRead action={markReadByAdmin.bind(null, thread.id)} />}

      <div className="flex flex-col gap-3">
        <Link
          href="/messages"
          className="text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          ← Messages
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            {threadTitle(thread)}
          </h1>
          <ThreadStatusPill status={thread.status} side="admin" />
        </div>
        <p className="text-sm text-muted">
          From <span className="font-semibold text-fg">{thread.name}</span> · {thread.email} ·
          started {formatMessageTime(thread.created_at)}
        </p>
      </div>

      {thread.follow_up_of && (
        <Link
          href={`/messages/${thread.follow_up_of}`}
          className="self-start text-sm font-semibold text-accent"
        >
          ↩ Follow-up to an earlier conversation →
        </Link>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {thread.order && <OrderContextCard order={thread.order} />}
          <ThreadMessages thread={thread} viewer="admin" />
          <div className="flex flex-col gap-4 rounded-2xl border border-line p-5">
            <ReplyBox
              send={replyToThread.bind(null, thread.id)}
              placeholder={`Reply to ${thread.name.split(" ")[0]}…`}
              buttonLabel="Send reply"
            />
          </div>
          <ThreadStatusButton threadId={thread.id} status={thread.status} />
        </div>

        <aside className="flex flex-col gap-3 rounded-2xl bg-card p-5">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Recent orders
          </span>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {orders.map((o) => (
                <li key={o.number}>
                  <Link
                    href={`/orders/${o.number}`}
                    className="flex flex-col gap-1 rounded-xl bg-bg p-3 transition-colors hover:ring-1 hover:ring-line"
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {o.number}
                      <StatusPill status={o.status} />
                    </span>
                    <span className="text-xs text-muted">
                      {formatOrderDate(o.created_at, "short")} · {formatRupiah(o.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
