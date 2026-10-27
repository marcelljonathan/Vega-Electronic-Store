"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceLine, type OrderLineInput } from "@/lib/pricing";
import { getCatalogFresh } from "@/lib/catalog";
import type { CartItem } from "../CartProvider";
import {
  deliveryOptions,
  validateAddress,
  cleanAddress,
  type Address,
} from "@/lib/checkout";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { paymentWindowFor, paymentsReady } from "@/lib/midtrans";

export type PlaceOrderInput = {
  items: OrderLineInput[];
  address: Address;
  delivery: string;
};

export type PlaceOrderResult =
  // token: the Midtrans payment window to open (null if it couldn't be
  // prepared — the order page offers "Pay now" instead).
  | { ok: true; number: string; token: string | null }
  | {
      ok: false;
      reason: "signin" | "invalid" | "unavailable" | "failed";
      message: string;
    };

// Runs on the Vega server when "Place order" is pressed. Nothing from the
// browser is trusted: the sign-in, address and every price are checked here,
// and only this server (with the secret key) can write orders.
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  // 1. Who is ordering? Verified with Supabase, not taken from the browser.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return {
      ok: false,
      reason: "signin",
      message: "Please sign in to place your order.",
    };
  }

  if (!paymentsReady()) {
    return {
      ok: false,
      reason: "failed",
      message: "Payments aren't set up yet, so orders can't be placed right now.",
    };
  }

  // 2. Address and delivery must be valid.
  const raw = input.address ?? {};
  const address: Address = {
    fullName: String(raw.fullName ?? ""),
    phone: String(raw.phone ?? ""),
    street: String(raw.street ?? ""),
    province: String(raw.province ?? ""),
    city: String(raw.city ?? ""),
    district: String(raw.district ?? ""),
    postalCode: String(raw.postalCode ?? ""),
  };
  const delivery = deliveryOptions.find((d) => d.id === input.delivery);
  if (Object.keys(validateAddress(address)).length > 0 || !delivery) {
    return {
      ok: false,
      reason: "invalid",
      message:
        "Some checkout details are missing or invalid. Please check the form.",
    };
  }

  // 3. Re-price every line from the latest catalog (and refuse sold-out items).
  if (
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > 50
  ) {
    return { ok: false, reason: "invalid", message: "Your cart is empty." };
  }
  const catalog = await getCatalogFresh();
  const items: CartItem[] = [];
  for (const line of input.items) {
    const priced = priceLine(line, catalog);
    if ("error" in priced) {
      return {
        ok: false,
        reason: "unavailable",
        message:
          priced.error === "sold-out"
            ? `${priced.name} is sold out. Please remove it from your cart to continue.`
            : "Something in your cart is no longer available. Please remove it and try again.",
      };
    }
    items.push(priced.item);
  }
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingFee = delivery.fee;
  const total = subtotal + shippingFee;

  // 4. Save the order (awaiting payment), then its items. If the items fail,
  //    remove the order so there's never an order without items.
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      status: "awaiting_payment",
      email: user.email,
      address: cleanAddress(address),
      delivery: delivery.id,
      payment: "midtrans",
      subtotal,
      shipping_fee: shippingFee,
      total,
    })
    .select("id, number")
    .single();
  if (error || !order) {
    console.error("placeOrder: could not save the order", error?.message);
    return {
      ok: false,
      reason: "failed",
      message: "We couldn't place your order. Please try again.",
    };
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      product_slug: i.productSlug,
      kind: i.kind,
      name: i.name,
      color_name: i.colorName,
      option: i.option,
      screen_a: i.screenA,
      screen_b: i.screenB,
      unit_price: i.unitPrice,
      quantity: i.quantity,
    })),
  );
  if (itemsError) {
    console.error(
      "placeOrder: could not save the order items",
      itemsError.message,
    );
    await admin.from("orders").delete().eq("id", order.id);
    return {
      ok: false,
      reason: "failed",
      message: "We couldn't place your order. Please try again.",
    };
  }

  // 5. Prepare the Midtrans payment window for exactly this order's total.
  const { data: saved } = await admin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", order.id)
    .single();
  const token = saved ? await paymentWindowFor(saved as OrderRow) : null;

  return { ok: true, number: order.number, token };
}
