import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusPill, OrderTracker, OrderItems, InfoCard, PaymentInfo } from "../OrderParts";
import { PayButton, PaymentWatcher } from "../PaymentParts";
import { deliveryOptions } from "@/lib/checkout";
import { formatRupiah } from "@/lib/format";
import { syncPayment } from "@/lib/midtrans";
import {
  ORDER_SELECT,
  formatDateTime,
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
  const loadOrder = async () =>
    (
      await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("number", number)
        .eq("user_id", user.id)
        .maybeSingle()
    ).data as OrderRow | null;
  let order = await loadOrder();
  if (!order) notFound();

  // Unpaid? Ask Midtrans whether it's been paid (or expired) since.
  if ((await syncPayment(order)).changed) order = (await loadOrder()) ?? order;

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
  const firstName = a.fullName.split(" ")[0];
  const awaiting = order.status === "awaiting_payment";
  const banner = awaiting
    ? { title: `Order placed. Thanks, ${firstName}!`, body: "One step left: complete your payment below." }
    : order.paid_at
      ? { title: `Payment received. Thanks, ${firstName}!`, body: "We're getting your order ready. This was a test payment, so no real money moved." }
      : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-7 py-16">
      {placed === "1" && banner && (
        <div
          role="status"
          className="flex items-center gap-4 rounded-3xl bg-accent/10 p-5 sm:p-6"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-lg text-white">
            ✓
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{banner.title}</span>
            <span className="text-sm text-muted">{banner.body}</span>
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

      {awaiting && (
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border-2 border-accent/40 p-5 sm:p-6">
          <div className="flex max-w-[44ch] flex-col gap-1">
            <span className="text-lg font-semibold">Complete your payment</span>
            <span className="text-sm text-muted">
              Pay <span className="font-semibold text-fg">{formatRupiah(order.total)}</span>
              {order.payment_expires_at
                ? ` by ${formatDateTime(order.payment_expires_at)}, or the order is cancelled.`
                : "."}
              {order.payment_method &&
                ` You chose ${order.payment_method} — reopen the payment window to see the details again.`}
            </span>
          </div>
          <PayButton
            number={order.number}
            label={order.payment_method ? "Continue payment" : "Pay now"}
          />
          <PaymentWatcher />
        </section>
      )}

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
        <PaymentInfo order={order} />
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
