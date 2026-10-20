import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { deliveryOptions, paymentOptions } from "@/lib/checkout";
import { ORDER_SELECT, formatOrderDate, formatPhone, type OrderRow } from "@/lib/orders";
import {
  StatusPill,
  OrderTracker,
  OrderItems,
  InfoCard,
} from "@/app/(store)/orders/OrderParts";
import StatusActions from "../StatusActions";
import { formatMessageTime, type ThreadStatus } from "@/lib/support-threads";
import { ThreadStatusPill } from "@/app/(store)/account/messages/ThreadView";

export async function generateMetadata({
  params,
}: PageProps<"/admin/orders/[number]">): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${number}` };
}

export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[number]">) {
  const { supabase } = await requireAdmin();
  const { number } = await params;

  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("number", number)
    .maybeSingle();
  if (!data) notFound();

  const order = data as OrderRow;

  const { data: threadRows } = await supabase
    .from("support_threads")
    .select("id, status, last_message_at")
    .eq("order_id", order.id)
    .order("last_message_at", { ascending: false });
  const threads = (threadRows ?? []) as {
    id: string;
    status: ThreadStatus;
    last_message_at: string;
  }[];
  const a = order.address;
  const delivery = deliveryOptions.find((d) => d.id === order.delivery);
  const payment = paymentOptions.find((p) => p.id === order.payment);

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/orders"
          className="text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          ← Orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Order {order.number}
          </h1>
          <StatusPill status={order.status} />
        </div>
        <p className="text-sm text-muted">
          Placed {formatOrderDate(order.created_at)} ·{" "}
          <span className="text-fg">{order.email}</span>
        </p>
      </div>

      <StatusActions number={order.number} status={order.status} />

      <OrderTracker order={order} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Customer">
          <span className="font-semibold text-fg">{a.fullName}</span>
          <span className="break-all">{order.email}</span>
          <span>{formatPhone(a.phone)}</span>
        </InfoCard>
        <InfoCard title="Shipping to">
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Conversations about this order</h2>
        {threads.length === 0 ? (
          <p className="text-sm text-muted">The customer hasn&apos;t asked about it.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {threads.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/messages/${t.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-muted"
                >
                  <span>Last message {formatMessageTime(t.last_message_at)}</span>
                  <ThreadStatusPill status={t.status} side="admin" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
