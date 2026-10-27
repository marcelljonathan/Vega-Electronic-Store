import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "./supabase/admin";
import { deliveryOptions } from "./checkout";
import { sortedItems, type OrderRow, type OrderStatus } from "./orders";

// Payments through Midtrans, in Sandbox (test) mode: test cards and payment
// simulators, no real money. Everything here runs on the Vega server — the
// server key never reaches the browser. (For real payments these addresses
// become app.midtrans.com / api.midtrans.com, with production keys.)

const SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";
const API_URL = "https://api.sandbox.midtrans.com/v2";

// How long a buyer has to pay before the order is cancelled.
export const PAYMENT_WINDOW_HOURS = 24;

export function paymentsReady() {
  return Boolean(process.env.MIDTRANS_SERVER_KEY && process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
}

function serverKey() {
  return process.env.MIDTRANS_SERVER_KEY ?? "";
}

function midtransHeaders() {
  return {
    Authorization: `Basic ${Buffer.from(`${serverKey()}:`).toString("base64")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// This site's address, for the "back to Vega" link after paying.
export async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

type PayableOrder = Pick<
  OrderRow,
  "id" | "number" | "email" | "address" | "delivery" | "shipping_fee" | "total" | "order_items"
>;

const clip = (text: string) => (text.length > 50 ? `${text.slice(0, 49)}…` : text);

// Asks Midtrans for a payment window (Snap) for a saved order. The amount
// and items come from the order in our database, never from the browser.
async function createPaymentWindow(order: PayableOrder) {
  const a = order.address;
  const phone = `+62${a.phone}`;
  const items = sortedItems(order as OrderRow).map((i) => ({
    id: clip(i.product_slug),
    name: clip(`${i.name}${i.option ? ` ${i.option}` : ""}, ${i.color_name}`),
    price: i.unit_price,
    quantity: i.quantity,
  }));
  if (order.shipping_fee > 0) {
    const delivery = deliveryOptions.find((d) => d.id === order.delivery);
    items.push({
      id: "shipping",
      name: `${delivery?.label ?? "Express"} shipping`,
      price: order.shipping_fee,
      quantity: 1,
    });
  }

  const res = await fetch(SNAP_URL, {
    method: "POST",
    headers: midtransHeaders(),
    body: JSON.stringify({
      transaction_details: { order_id: order.number, gross_amount: order.total },
      item_details: items,
      customer_details: {
        first_name: a.fullName,
        email: order.email,
        phone,
        shipping_address: {
          first_name: a.fullName,
          phone,
          address: a.street,
          city: a.city,
          postal_code: a.postalCode,
          country_code: "IDN",
        },
      },
      expiry: { unit: "hours", duration: PAYMENT_WINDOW_HOURS },
      callbacks: { finish: `${await siteOrigin()}/orders/${order.number}` },
    }),
  }).catch((error) => {
    console.error("midtrans: unreachable:", error);
    return null;
  });
  if (!res?.ok) {
    if (res) console.error("midtrans: payment window", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) return null;
  return {
    token: data.token,
    expiresAt: new Date(Date.now() + PAYMENT_WINDOW_HOURS * 3_600_000).toISOString(),
  };
}

// The order's payment window: the saved one while it's still open, or a new
// one (saved on the order, so "Pay now" reopens the same payment later).
export async function paymentWindowFor(order: PayableOrder & Pick<OrderRow, "payment_token" | "payment_expires_at">) {
  if (order.payment_token && order.payment_expires_at && Date.parse(order.payment_expires_at) > Date.now()) {
    return order.payment_token;
  }
  const created = await createPaymentWindow(order);
  if (!created) return null;
  await createAdminClient()
    .from("orders")
    .update({ payment_token: created.token, payment_expires_at: created.expiresAt })
    .eq("id", order.id)
    .eq("status", "awaiting_payment");
  return created.token;
}

type MidtransStatus = {
  status_code?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount?: string;
  card_type?: string;
  va_numbers?: { bank: string }[];
  permata_va_number?: string;
  store?: string;
};

// Midtrans's own record of the payment for an order (asked server-to-server,
// so the browser can't fake a "paid").
async function fetchStatus(number: string): Promise<MidtransStatus | null> {
  const res = await fetch(`${API_URL}/${encodeURIComponent(number)}/status`, {
    headers: midtransHeaders(),
    cache: "no-store",
  }).catch((error) => {
    console.error("midtrans: unreachable:", error);
    return null;
  });
  if (!res) return null;
  return (await res.json().catch(() => null)) as MidtransStatus | null;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// "BCA virtual account", "QRIS", "Credit card"…
function paymentLabel(s: MidtransStatus): string | null {
  switch (s.payment_type) {
    case undefined:
      return null;
    case "credit_card":
      return s.card_type === "debit" ? "Debit card" : "Credit card";
    case "bank_transfer": {
      const bank = s.va_numbers?.[0]?.bank ?? (s.permata_va_number ? "permata" : "");
      return bank ? `${bank.toUpperCase()} virtual account` : "Bank transfer";
    }
    case "echannel":
      return "Mandiri bill payment";
    case "qris":
      return "QRIS";
    case "gopay":
      return "GoPay";
    case "shopeepay":
      return "ShopeePay";
    case "cstore":
      return s.store ? capitalize(s.store) : "Convenience store";
    default:
      return capitalize(s.payment_type.replace(/_/g, " "));
  }
}

type SyncableOrder = Pick<OrderRow, "id" | "number" | "status" | "total" | "payment_expires_at" | "payment_method">;

// Checks an unpaid order with Midtrans and moves it on: paid → Processing;
// expired or cancelled at Midtrans (or never paid in time) → Cancelled.
// Safe to run any number of times — it only ever changes an unpaid order.
export async function syncPayment(order: SyncableOrder): Promise<{ status: OrderStatus; changed: boolean }> {
  const unchanged = { status: order.status, changed: false };
  if (order.status !== "awaiting_payment" || !paymentsReady()) return unchanged;

  const s = await fetchStatus(order.number);
  if (!s) return unchanged;

  const now = new Date().toISOString();
  const save = async (fields: Record<string, unknown>) => {
    const { data } = await createAdminClient()
      .from("orders")
      .update({ ...fields, updated_at: now })
      .eq("id", order.id)
      .eq("status", "awaiting_payment")
      .select("id");
    return Boolean(data?.length);
  };
  const cancelUnpaid = async (method: string | null) =>
    (await save({ status: "cancelled", cancelled_at: now, cancel_reason: "payment_expired", payment_method: method }))
      ? { status: "cancelled" as const, changed: true }
      : unchanged;

  const expired = Boolean(order.payment_expires_at && Date.parse(order.payment_expires_at) < Date.now());
  const started = s.status_code !== "404" && Boolean(s.transaction_status);
  if (!started) return expired ? cancelUnpaid(null) : unchanged; // never paid

  const method = paymentLabel(s);
  const t = s.transaction_status;
  const paid = t === "settlement" || (t === "capture" && s.fraud_status === "accept");
  if (paid) {
    if (Math.round(Number(s.gross_amount)) !== order.total) {
      console.error("midtrans: paid amount doesn't match order", order.number, s.gross_amount);
      return unchanged;
    }
    return (await save({ status: "processing", paid_at: now, payment_method: method }))
      ? { status: "processing", changed: true }
      : unchanged;
  }
  if (t === "expire" || t === "cancel" || (expired && t !== "pending")) return cancelUnpaid(method);
  if (method && method !== order.payment_method) {
    return { status: order.status, changed: await save({ payment_method: method }) };
  }
  return unchanged;
}

// When Vega cancels an unpaid order, close its payment at Midtrans too
// (best effort — an unpaid order can't be marked paid afterwards anyway).
export async function cancelAtMidtrans(number: string) {
  if (!paymentsReady()) return;
  await fetch(`${API_URL}/${encodeURIComponent(number)}/cancel`, {
    method: "POST",
    headers: midtransHeaders(),
  }).catch(() => null);
}

// Midtrans signs every payment notification with our server key:
// SHA-512 of order_id + status_code + gross_amount + server key.
export function isGenuineNotification(body: unknown) {
  if (!body || typeof body !== "object" || !serverKey()) return false;
  const { order_id, status_code, gross_amount, signature_key } = body as Record<string, unknown>;
  if (![order_id, status_code, gross_amount, signature_key].every((v) => typeof v === "string")) return false;
  const expected = createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey()}`)
    .digest("hex");
  const given = String(signature_key);
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
