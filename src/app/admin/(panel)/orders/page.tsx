import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
import {
  ORDER_SELECT,
  orderStatuses,
  formatOrderDate,
  type OrderRow,
  type OrderStatus,
} from "@/lib/orders";
import { StatusPill } from "@/app/(store)/orders/OrderParts";

export const metadata: Metadata = {
  title: "Orders",
};

const statusList = Object.keys(orderStatuses) as OrderStatus[];

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const status = statusList.find((s) => s === params.status);
  // Search text, stripped of characters that have meaning in the filter syntax.
  const q = typeof params.q === "string" ? params.q.replace(/[,()%*\\]/g, "").trim().slice(0, 60) : "";

  // Summary numbers come from every order (status + total only).
  const { data: all } = await supabase.from("orders").select("status, total");
  const summary = (all ?? []) as { status: OrderStatus; total: number }[];
  const countOf = (s: OrderStatus) => summary.filter((o) => o.status === s).length;
  const revenue = summary
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  // The list, filtered by the tab and the search box.
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`number.ilike.%${q}%,email.ilike.%${q}%`);
  const { data } = await query;
  const orders = (data ?? []) as OrderRow[];

  const tabHref = (s?: OrderStatus) => {
    const sp = new URLSearchParams();
    if (s) sp.set("status", s);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/orders?${qs}` : "/orders";
  };

  const tiles = [
    { label: "Processing", value: String(countOf("processing")), note: "Waiting to ship" },
    { label: "Shipped", value: String(countOf("shipped")), note: "On the way" },
    { label: "Delivered", value: String(countOf("delivered")), note: "Completed" },
    { label: "Revenue", value: formatRupiah(revenue), note: "Excludes cancelled" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Orders</h1>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-1 rounded-2xl border border-line p-5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
              {t.label}
            </span>
            <span className="text-2xl font-semibold tracking-tight tabular-nums">{t.value}</span>
            <span className="text-xs text-muted">{t.note}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[undefined, ...statusList].map((s) => {
            const active = s === status;
            return (
              <Link
                key={s ?? "all"}
                href={tabHref(s)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "border-fg bg-fg text-bg"
                    : "border-line text-muted hover:text-fg"
                }`}
              >
                {s ? orderStatuses[s].label : "All"}{" "}
                <span className="tabular-nums opacity-70">
                  {s ? countOf(s) : summary.length}
                </span>
              </Link>
            );
          })}
        </div>

        <form action="/orders" method="get" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search order number or email"
            aria-label="Search orders"
            className="w-full max-w-md rounded-xl border border-line bg-bg px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-fg"
          >
            Search
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line p-8 text-center text-sm text-muted">
          {summary.length === 0 ? "No orders yet." : "No orders match this filter."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="hidden grid-cols-[1fr_1fr_2fr_0.6fr_1.3fr_1.1fr] gap-4 border-b border-line bg-card px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-muted md:grid">
            <span>Order</span>
            <span>Placed</span>
            <span>Customer</span>
            <span>Items</span>
            <span className="text-right">Total</span>
            <span className="text-right">Status</span>
          </div>
          <ul>
            {orders.map((o) => {
              const itemCount = o.order_items.reduce((n, i) => n + i.quantity, 0);
              return (
                <li key={o.id} className="border-b border-line last:border-b-0">
                  <Link
                    href={`/orders/${o.number}`}
                    className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 py-4 text-sm transition-colors hover:bg-card md:grid-cols-[1fr_1fr_2fr_0.6fr_1.3fr_1.1fr] md:items-center"
                  >
                    <span className="font-semibold">{o.number}</span>
                    <span className="text-right text-muted md:text-left">
                      {formatOrderDate(o.created_at, "short")}
                    </span>
                    <span className="col-span-2 flex min-w-0 flex-col md:col-span-1">
                      <span className="truncate">{o.address.fullName}</span>
                      <span className="truncate text-xs text-muted">{o.email}</span>
                    </span>
                    <span className="text-muted tabular-nums">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                    <span className="text-right font-semibold tabular-nums">
                      {formatRupiah(o.total)}
                    </span>
                    <span className="col-span-2 md:col-span-1 md:text-right">
                      <StatusPill status={o.status} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
