import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusPill, OrderTracker, OrderItems, InfoCard } from "../OrderParts";
import { deliveryOptions, paymentOptions } from "@/lib/checkout";
import {
  ORDER_SELECT,
  formatOrderDate,
  formatPhone,
  type OrderRow,
} from "@/lib/orders";

export async function generateMetadata({
  params,
}: PageProps<"/orders/[number]">): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${number} — Vega` };
}

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

  // Only the buyer's own order — someone else's number is simply not found.
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("number", number)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) notFound();

  const order = data as OrderRow;

  // An ongoing (not resolved) conversation about this order, if there is one.
  const { data: activeThread } = await supabase
    .from("support_threads")
    .select("id")
    .eq("order_id", order.id)
    .eq("user_id", user.id)
    .neq("status", "resolved")
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();
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

      <OrderTracker order={order} />

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

      <OrderItems order={order} />

      <OrderHelp
        number={order.number}
        activeThreadId={activeThread?.id ?? null}
      />
    </div>
  );
}

// "Ask about this order" — or continue the conversation already in progress.
function OrderHelp({
  number,
  activeThreadId,
}: {
  number: string;
  activeThreadId: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-card p-5 sm:p-6">
      <div className="flex flex-col">
        <span className="font-semibold">Questions about this order?</span>
        <span className="text-sm text-muted">
          {activeThreadId
            ? "You already have a conversation about it with our team."
            : "Message our team — they'll see this order's details."}
        </span>
      </div>
      <Link
        href={activeThreadId ? `/account/messages/${activeThreadId}` : `/support?order=${number}#contact`}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white"
      >
        {activeThreadId ? "Continue the conversation" : "Ask about this order"}
      </Link>
    </div>
  );
}
