"use server";

import { createClient } from "@/lib/supabase/server";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { paymentWindowFor, paymentsReady, syncPayment } from "@/lib/midtrans";

export type StartPaymentResult =
  | { ok: true; token: string }
  | { ok: false; message: string };

// "Pay now" on an unpaid order: checks it with Midtrans first, then returns
// its payment window (the same one as before while it's still open).
export async function startPayment(number: string): Promise<StartPaymentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  if (!paymentsReady()) return { ok: false, message: "Payments aren't set up yet." };

  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("number", number)
    .eq("user_id", user.id) // only the buyer's own order
    .maybeSingle();
  if (!data) return { ok: false, message: "Order not found." };
  const order = data as OrderRow;

  const { status } = await syncPayment(order);
  if (status !== "awaiting_payment") {
    return {
      ok: false,
      message:
        status === "cancelled"
          ? "The time to pay for this order has run out."
          : "This order is already paid.",
    };
  }

  const token = await paymentWindowFor(order);
  if (!token) {
    return { ok: false, message: "We couldn't open the payment window. Please try again." };
  }
  return { ok: true, token };
}
