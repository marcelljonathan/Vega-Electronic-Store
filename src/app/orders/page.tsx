import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { OrderListItem } from "./OrderParts";

export const metadata: Metadata = {
  title: "My orders — Vega",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/orders");

  // RLS returns only this buyer's orders.
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as OrderRow[];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-7 py-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/account"
          className="text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          ← My account
        </Link>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-3xl bg-card p-8">
          <p className="font-semibold">No orders yet.</p>
          <p className="text-sm text-muted">Orders you place will show up here.</p>
          <Link href="/" className="mt-2 text-sm font-semibold text-accent">
            Start shopping →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderListItem order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
