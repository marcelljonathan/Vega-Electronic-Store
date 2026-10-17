import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductThumb from "../../ProductThumb";
import { StatusPill } from "../OrderParts";
import { formatRupiah } from "@/lib/format";
import { deliveryOptions, paymentOptions } from "@/lib/checkout";
import {
  ORDER_SELECT,
  toCartItem,
  sortedItems,
  formatOrderDate,
  formatPhone,
  type OrderRow,
  type OrderStatus,
} from "@/lib/orders";

export async function generateMetadata({
  params,
}: PageProps<"/orders/[number]">): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${number} — Vega` };
}

const steps: { label: string; reachedAt: OrderStatus[] }[] = [
  { label: "Placed", reachedAt: ["processing", "shipped", "delivered"] },
  { label: "Processing", reachedAt: ["processing", "shipped", "delivered"] },
  { label: "Shipped", reachedAt: ["shipped", "delivered"] },
  { label: "Delivered", reachedAt: ["delivered"] },
];

// One order's page — also the confirmation shown right after checkout
// (?placed=1 adds the "Order placed" banner).
export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/orders/[number]">) {
  const { number } = await params;
  const { placed } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/signin?next=/orders/${encodeURIComponent(number)}`);

  // RLS: someone else's order number simply isn't found.
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("number", number)
    .maybeSingle();
  if (!data) notFound();

  const order = data as OrderRow;
  const items = sortedItems(order);
  const a = order.address;
  const delivery = deliveryOptions.find((d) => d.id === order.delivery);
  const payment = paymentOptions.find((p) => p.id === order.payment);
  const firstName = a.fullName.split(" ")[0];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-7 py-16">
      {placed === "1" && (
        <div
          role="status"
          className="flex items-center gap-4 rounded-3xl bg-accent/10 p-5 sm:p-6"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-lg text-white">
            ✓
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Order placed. Thanks, {firstName}!</span>
            <span className="text-sm text-muted">
              It&apos;s saved to your account — this is a demo store, so nothing
              was charged.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/orders"
          className="text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          ← All orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
            Order {order.number}
          </h1>
          <StatusPill status={order.status} />
        </div>
        <p className="text-muted">Placed {formatOrderDate(order.created_at)}</p>
      </div>

      {order.status === "cancelled" ? (
        <p className="rounded-2xl border border-line p-5 text-sm text-muted">
          This order was cancelled.
        </p>
      ) : (
        <ol className="grid grid-cols-4">
          {steps.map((step, i) => {
            const reached = step.reachedAt.includes(order.status);
            const nextReached = steps[i + 1]?.reachedAt.includes(order.status);
            return (
              <li key={step.label} className="relative flex flex-col items-center gap-2">
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
                <span
                  className={`text-xs sm:text-sm ${reached ? "font-semibold" : "text-muted"}`}
                >
                  {step.label}
                  <span className="sr-only">{reached ? " (done)" : " (not yet)"}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <InfoCard title="Shipping to">
          <span className="font-semibold text-fg">{a.fullName}</span>
          <span>{formatPhone(a.phone)}</span>
          <span>{a.street}</span>
          <span>
            {a.district}, {a.city}
          </span>
          <span>
            {a.province} {a.postalCode}
          </span>
        </InfoCard>
        <InfoCard title="Delivery">
          <span className="font-semibold text-fg">{delivery?.label}</span>
          <span>{delivery?.time}</span>
        </InfoCard>
        <InfoCard title="Payment">
          <span className="font-semibold text-fg">{payment?.label}</span>
          <span>Demo — not charged</span>
        </InfoCard>
      </div>

      <section className="flex flex-col gap-5 rounded-3xl border border-line p-6">
        <h2 className="text-lg font-semibold">Items</h2>
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4">
              <div className="grid h-20 w-14 shrink-0 place-items-center rounded-lg bg-card">
                <ProductThumb item={toCartItem(item)} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{item.name}</span>
                <span className="text-xs text-muted">
                  {item.option ? `${item.color_name} · ${item.option}` : item.color_name}{" "}
                  · ×{item.quantity}
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
            <dd>
              {order.shipping_fee === 0 ? "Free" : formatRupiah(order.shipping_fee)}
            </dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
            <dt className="font-semibold">Total</dt>
            <dd className="text-xl font-semibold">{formatRupiah(order.total)}</dd>
          </div>
        </dl>
      </section>

      <p className="text-sm text-muted">
        Need help with this order?{" "}
        <Link href="/support#contact" className="font-semibold text-accent">
          Contact support →
        </Link>
      </p>
    </div>
  );
}

function InfoCard({
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
