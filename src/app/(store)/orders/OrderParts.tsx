import Link from "next/link";
import ProductThumb from "../ProductThumb";
import { formatRupiah } from "@/lib/format";
import { paymentOptions } from "@/lib/checkout";
import {
  orderStatuses,
  toCartItem,
  sortedItems,
  formatOrderDate,
  formatDateTime,
  formatDayMonth,
  type OrderRow,
  type OrderStatus,
} from "@/lib/orders";

// A colored status label, e.g. "● Processing".
export function StatusPill({ status }: { status: OrderStatus }) {
  const s = orderStatuses[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

// One order in a list — opens its order page.
export function OrderListItem({ order }: { order: OrderRow }) {
  const items = sortedItems(order);
  const names = [...new Set(items.map((i) => i.name))].join(", ");

  return (
    <Link
      href={`/orders/${order.number}`}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-bg p-5 transition-colors hover:border-muted"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">
          {order.number}
          <span className="font-normal text-muted">
            {" "}
            · {formatOrderDate(order.created_at, "short")}
          </span>
        </span>
        <StatusPill status={order.status} />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 -space-x-3">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="grid h-16 w-12 place-items-center rounded-lg border-2 border-bg bg-card"
            >
              <ProductThumb item={toCartItem(item)} />
            </div>
          ))}
        </div>
        <span className="min-w-0 flex-1 truncate text-sm text-muted">{names}</span>
        <span className="text-sm font-semibold whitespace-nowrap">
          {formatRupiah(order.total)}
        </span>
        <span className="text-muted" aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );
}

// Placed → Paid → Shipped → Delivered, with the date each step happened.
export function OrderTracker({ order }: { order: OrderRow }) {
  if (order.status === "cancelled") {
    return (
      <p className="rounded-2xl border border-line p-5 text-sm text-muted">
        {order.cancel_reason === "payment_expired"
          ? "This order was cancelled because it wasn't paid in time"
          : "This order was cancelled"}
        {order.cancelled_at ? ` on ${formatOrderDate(order.cancelled_at)}` : ""}.
      </p>
    );
  }

  const steps: { label: string; reachedAt: OrderStatus[]; date: string | null }[] = [
    {
      label: "Placed",
      reachedAt: ["awaiting_payment", "processing", "shipped", "delivered"],
      date: order.created_at,
    },
    {
      label: "Paid",
      reachedAt: ["processing", "shipped", "delivered"],
      date: order.paid_at,
    },
    { label: "Shipped", reachedAt: ["shipped", "delivered"], date: order.shipped_at },
    { label: "Delivered", reachedAt: ["delivered"], date: order.delivered_at },
  ];

  return (
    <ol className="grid grid-cols-4">
      {steps.map((step, i) => {
        const reached = step.reachedAt.includes(order.status);
        const nextReached = steps[i + 1]?.reachedAt.includes(order.status);
        return (
          <li key={step.label} className="relative flex flex-col items-center gap-2 text-center">
            {i < steps.length - 1 && (
              <span
                className={`absolute top-2 left-1/2 h-0.5 w-full ${
                  nextReached ? "bg-accent" : "bg-line"
                }`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative h-4 w-4 rounded-full border-2 ${
                reached ? "border-accent bg-accent" : "border-line bg-bg"
              }`}
              aria-hidden="true"
            />
            <span className="flex flex-col">
              <span
                className={`text-xs sm:text-sm ${reached ? "font-semibold" : "text-muted"}`}
              >
                {step.label}
                <span className="sr-only">{reached ? " (done)" : " (not yet)"}</span>
              </span>
              {reached && step.date && (
                <span className="text-xs text-muted">{formatDayMonth(step.date)}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// The items in an order with subtotal, shipping and total.
export function OrderItems({ order }: { order: OrderRow }) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line p-6">
      <h2 className="text-lg font-semibold">Items</h2>
      <ul className="flex flex-col gap-4">
        {sortedItems(order).map((item) => (
          <li key={item.id} className="flex items-center gap-4">
            <div className="grid h-20 w-14 shrink-0 place-items-center rounded-lg bg-card">
              <ProductThumb item={toCartItem(item)} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold">{item.name}</span>
              <span className="text-xs text-muted">
                {item.option ? `${item.color_name} · ${item.option}` : item.color_name} ·
                ×{item.quantity}
              </span>
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              {formatRupiah(item.unit_price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col gap-2.5 border-t border-line pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatRupiah(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>{order.shipping_fee === 0 ? "Free" : formatRupiah(order.shipping_fee)}</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
          <dt className="font-semibold">Total</dt>
          <dd className="text-xl font-semibold">{formatRupiah(order.total)}</dd>
        </div>
      </dl>
    </section>
  );
}

// The "Payment" card: how and when it was paid, or what's still due.
export function PaymentInfo({ order }: { order: OrderRow }) {
  let lines: [string, string];
  if (order.payment !== "midtrans") {
    // Orders from before payments were added.
    const legacy = paymentOptions.find((p) => p.id === order.payment);
    lines = [legacy?.label ?? "—", "Demo — not charged"];
  } else if (order.paid_at) {
    lines = [order.payment_method ?? "Midtrans", `Paid ${formatDateTime(order.paid_at)} · test mode`];
  } else if (order.status === "awaiting_payment") {
    lines = [
      order.payment_method ?? "Not paid yet",
      order.payment_expires_at ? `Pay by ${formatDateTime(order.payment_expires_at)}` : "Waiting for payment",
    ];
  } else {
    lines = [
      "Not paid",
      order.cancel_reason === "payment_expired" ? "Payment time ran out" : "Order cancelled",
    ];
  }
  return (
    <InfoCard title="Payment">
      <span className="font-semibold text-fg">{lines[0]}</span>
      <span>{lines[1]}</span>
    </InfoCard>
  );
}

// A small labelled card (shipping address, delivery, payment…).
export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-card p-5 text-sm text-muted">
      <span className="mb-1 text-xs font-bold uppercase tracking-[0.2em]">
        {title}
      </span>
      {children}
    </div>
  );
}
