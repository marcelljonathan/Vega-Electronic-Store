import Link from "next/link";
import ProductThumb from "../ProductThumb";
import { formatRupiah } from "@/lib/format";
import {
  orderStatuses,
  toCartItem,
  sortedItems,
  formatOrderDate,
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
