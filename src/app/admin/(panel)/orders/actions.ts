"use server";

import { requireAdmin } from "@/lib/admin";
import { nextStatuses, orderStatuses, type OrderStatus } from "@/lib/orders";

export type UpdateStatusResult = { ok: true } | { ok: false; message: string };

// Moves an order to its next status. Checked twice: requireAdmin() here, and
// the database's RLS rules only let admins update orders.
export async function updateOrderStatus(
  number: string,
  next: OrderStatus,
): Promise<UpdateStatusResult> {
  const { supabase } = await requireAdmin();
  if (!(next in orderStatuses)) return { ok: false, message: "Unknown status." };

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("number", number)
    .maybeSingle();
  if (!order) return { ok: false, message: "Order not found." };

  const current = order.status as OrderStatus;
  if (!nextStatuses[current].includes(next)) {
    return {
      ok: false,
      message: `A ${orderStatuses[current].label.toLowerCase()} order can't be marked ${orderStatuses[next].label.toLowerCase()}.`,
    };
  }

  const now = new Date().toISOString();
  const stamp =
    next === "shipped"
      ? { shipped_at: now }
      : next === "delivered"
        ? { delivered_at: now }
        : next === "cancelled"
          ? { cancelled_at: now }
          : {};

  // ".eq(status, current)" — only update if nobody changed it in the meantime.
  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status: next, updated_at: now, ...stamp })
    .eq("number", number)
    .eq("status", current)
    .select("id");
  if (error || !updated?.length) {
    return {
      ok: false,
      message: "Couldn't update the order — it may have just changed. Refresh and try again.",
    };
  }
  return { ok: true };
}
