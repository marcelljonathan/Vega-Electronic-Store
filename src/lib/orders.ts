import type { CartItem } from "@/app/(store)/CartProvider";
import type { Address, DeliveryId, PaymentId } from "./checkout";

export type OrderStatus =
  | "awaiting_payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

// Rows as they come from Supabase (snake_case columns).
export type OrderItemRow = {
  id: number;
  product_slug: string;
  kind: CartItem["kind"];
  name: string;
  color_name: string;
  option: string;
  screen_a: string;
  screen_b: string;
  unit_price: number;
  quantity: number;
};

export type OrderRow = {
  id: string;
  number: string;
  status: OrderStatus;
  email: string;
  address: Address;
  delivery: DeliveryId;
  payment: PaymentId;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  paid_at: string | null;
  payment_method: string | null; // what the buyer paid with in Midtrans
  payment_token: string | null;
  payment_expires_at: string | null;
  cancel_reason: "payment_expired" | null;
  order_items: OrderItemRow[];
};

export const orderStatuses: Record<
  OrderStatus,
  { label: string; pill: string; dot: string }
> = {
  awaiting_payment: {
    label: "Awaiting payment",
    pill: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  processing: {
    label: "Processing",
    pill: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  shipped: {
    label: "Shipped",
    pill: "bg-accent/12 text-accent",
    dot: "bg-accent",
  },
  delivered: {
    label: "Delivered",
    pill: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-red-500/12 text-red-500",
    dot: "bg-red-500",
  },
};

// Which status an order can move to next, and the admin button for it.
// Delivered and cancelled orders are finished. An unpaid order only moves
// on when Midtrans confirms the payment — admins can only cancel it.
export const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  awaiting_payment: ["cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const statusActionLabels: Record<OrderStatus, string> = {
  awaiting_payment: "Mark as awaiting payment",
  processing: "Mark as processing",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel order",
};

// An order line in the shape ProductThumb and the cart already use.
export function toCartItem(row: OrderItemRow): CartItem {
  return {
    productSlug: row.product_slug,
    kind: row.kind,
    name: row.name,
    colorName: row.color_name,
    screenA: row.screen_a,
    screenB: row.screen_b,
    option: row.option,
    unitPrice: row.unit_price,
    quantity: row.quantity,
  };
}

// Items in the order they were added.
export function sortedItems(order: OrderRow) {
  return [...order.order_items].sort((a, b) => a.id - b.id);
}

export function formatOrderDate(iso: string, month: "long" | "short" = "long") {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

// "27 Oct, 14:30" — payment deadlines and times.
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

// "18 Oct" — for the status tracker.
export function formatDayMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
}

// "812345678901" -> "+62 812-3456-78901"
export function formatPhone(digits: string) {
  return `+62 ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// Columns to load for an order with its items.
export const ORDER_SELECT = "*, order_items(*)";
