// Support conversations: types and display helpers shared by the store and
// the admin site.

import type { OrderStatus } from "./orders";

export type ThreadStatus = "open" | "replied" | "resolved";

// The order a conversation is about (when started from an order page).
export type ThreadOrder = {
  id: string;
  number: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  order_items: { id: number; name: string; color_name: string; option: string; quantity: number }[];
};

export type SupportMessage = {
  id: number;
  sender: "customer" | "admin";
  body: string;
  created_at: string;
};

export type SupportThread = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  product: string;
  status: ThreadStatus;
  customer_unread: boolean;
  admin_unread: boolean;
  created_at: string;
  last_message_at: string;
  follow_up_of: string | null; // the earlier conversation this continues
  order_id: string | null;
  order: ThreadOrder | null;
  support_messages: SupportMessage[];
};

// A conversation with its messages and (if any) the order it's about.
export const THREAD_SELECT =
  "*, support_messages(id, sender, body, created_at), order:orders(id, number, status, total, created_at, order_items(id, name, color_name, option, quantity))";

// What a conversation is called: its order, its product, or a general question.
export function threadTitle(thread: Pick<SupportThread, "order" | "product">) {
  if (thread.order) return `Order ${thread.order.number}`;
  return thread.product || "General question";
}

// The words each side sees for a status.
export const threadStatuses: Record<
  ThreadStatus,
  { customer: string; admin: string; pill: string }
> = {
  open: {
    customer: "Waiting for Vega",
    admin: "Open",
    pill: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  },
  replied: {
    customer: "Vega replied",
    admin: "Replied",
    pill: "bg-accent/12 text-accent",
  },
  resolved: {
    customer: "Resolved",
    admin: "Resolved",
    pill: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  },
};

// Messages oldest → newest.
export function sortedMessages(thread: SupportThread) {
  return [...thread.support_messages].sort((a, b) => a.id - b.id);
}

export function lastMessage(thread: SupportThread) {
  const messages = sortedMessages(thread);
  return messages[messages.length - 1];
}

// "18 Oct, 14:32" in Jakarta time.
export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 4000;
