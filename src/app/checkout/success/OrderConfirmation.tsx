"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import ProductThumb from "../../ProductThumb";
import { formatRupiah } from "@/lib/format";
import { useIsClient } from "@/lib/useIsClient";
import {
  deliveryOptions,
  paymentOptions,
  LAST_ORDER_KEY,
  type Order,
} from "@/lib/checkout";

const subscribe = () => () => {};

function readLastOrder() {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

// "812345678901" -> "+62 812-3456-78901"
function formatPhone(digits: string) {
  return `+62 ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// Shows the order just placed at checkout (read from this tab's sessionStorage).
export default function OrderConfirmation() {
  const isClient = useIsClient();
  const saved = useSyncExternalStore(subscribe, readLastOrder, () => null);

  if (!isClient) return <div className="min-h-[60vh]" />;

  let order: Order | null = null;
  try {
    order = saved ? (JSON.parse(saved) as Order) : null;
  } catch {}

  if (!order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-280 flex-col items-center justify-center gap-4 px-7 py-16 text-center">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          No recent order here.
        </h1>
        <p className="text-muted">Orders you place will show up on this page.</p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  const delivery = deliveryOptions.find((d) => d.id === order.delivery);
  const payment = paymentOptions.find((p) => p.id === order.payment);
  const firstName = order.address.fullName.split(" ")[0];
  const a = order.address;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-7 py-16">
      <div role="status" className="flex flex-col items-center gap-4 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-white">
          ✓
        </span>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Order placed.
        </h1>
        <p className="max-w-[46ch] leading-relaxed text-muted">
          Thanks, {firstName}! Your order{" "}
          <span className="font-semibold text-fg">{order.number}</span> is
          confirmed. A confirmation would be sent to {order.email} — this is a
          demo store, so nothing was charged or sent.
        </p>
      </div>

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
        <h2 className="text-lg font-semibold">Your order</h2>
        <ul className="flex flex-col gap-4">
          {order.items.map((item) => (
            <li
              key={`${item.productSlug}-${item.colorName}-${item.option}`}
              className="flex items-center gap-4"
            >
              <div className="grid h-20 w-14 shrink-0 place-items-center rounded-lg bg-card">
                <ProductThumb item={item} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{item.name}</span>
                <span className="text-xs text-muted">
                  {item.option
                    ? `${item.colorName} · ${item.option}`
                    : item.colorName}{" "}
                  · ×{item.quantity}
                </span>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {formatRupiah(item.unitPrice * item.quantity)}
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
              {order.shippingFee === 0 ? "Free" : formatRupiah(order.shippingFee)}
            </dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
            <dt className="font-semibold">Total</dt>
            <dd className="text-xl font-semibold">{formatRupiah(order.total)}</dd>
          </div>
        </dl>
      </section>

      <Link
        href="/"
        className="self-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white"
      >
        Continue shopping
      </Link>
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
