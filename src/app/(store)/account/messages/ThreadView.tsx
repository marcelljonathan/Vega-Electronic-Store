import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { formatOrderDate } from "@/lib/orders";
import { StatusPill } from "@/app/(store)/orders/OrderParts";
import {
  threadTitle,
  lastMessage,
  sortedMessages,
  formatMessageTime,
  threadStatuses,
  type SupportThread,
  type ThreadOrder,
  type ThreadStatus,
} from "@/lib/support-threads";

export function ThreadStatusPill({
  status,
  side,
}: {
  status: ThreadStatus;
  side: "customer" | "admin";
}) {
  const s = threadStatuses[status];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${s.pill}`}>
      {s[side]}
    </span>
  );
}

// The conversation as chat bubbles. "viewer" decides which side is "you".
export function ThreadMessages({
  thread,
  viewer,
}: {
  thread: SupportThread;
  viewer: "customer" | "admin";
}) {
  return (
    <ol className="flex flex-col gap-4">
      {sortedMessages(thread).map((m) => {
        const mine = m.sender === viewer;
        const who = m.sender === "admin" ? "Vega Support" : viewer === "admin" ? thread.name : "You";
        return (
          <li key={m.id} className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
            <span className="px-1 text-xs text-muted">
              {who} · {formatMessageTime(m.created_at)}
            </span>
            <p
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[70%] ${
                mine ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-card"
              }`}
            >
              {m.body}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

// One conversation in the buyer's list — opens the conversation.
export function ThreadRow({ thread }: { thread: SupportThread }) {
  const last = lastMessage(thread);
  return (
    <Link
      href={`/account/messages/${thread.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-line bg-bg p-5 transition-colors hover:border-muted"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {thread.customer_unread && (
            <span className="h-2 w-2 rounded-full bg-accent" aria-label="New reply" />
          )}
          {threadTitle(thread)}
          <span className="font-normal text-muted">
            · {formatMessageTime(thread.last_message_at)}
          </span>
        </span>
        <ThreadStatusPill status={thread.status} side="customer" />
      </div>
      {last && (
        <p className="truncate text-sm text-muted">
          {last.sender === "admin" ? "Vega: " : "You: "}
          {last.body}
        </p>
      )}
    </Link>
  );
}

// The order a conversation is about — shown at the top for buyer and admin.
// "/orders/<number>" opens the store's order page on the store, and the
// admin order page on the admin site.
export function OrderContextCard({ order }: { order: ThreadOrder }) {
  const items = [...order.order_items].sort((a, b) => a.id - b.id);
  return (
    <Link
      href={`/orders/${order.number}`}
      className="flex flex-col gap-3 rounded-2xl border border-line p-5 transition-colors hover:border-muted"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">
          About order {order.number}
          <span className="font-normal text-muted">
            {" "}
            · placed {formatOrderDate(order.created_at, "short")}
          </span>
        </span>
        <StatusPill status={order.status} />
      </div>
      <ul className="flex flex-col gap-1 text-sm text-muted">
        {items.map((i) => (
          <li key={i.id}>
            {i.quantity}× {i.name} — {i.option ? `${i.color_name} · ${i.option}` : i.color_name}
          </li>
        ))}
      </ul>
      <span className="text-sm">
        Total <span className="font-semibold">{formatRupiah(order.total)}</span>
        <span className="text-accent"> · View order →</span>
      </span>
    </Link>
  );
}
