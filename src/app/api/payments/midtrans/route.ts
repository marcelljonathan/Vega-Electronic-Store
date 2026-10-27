import { createAdminClient } from "@/lib/supabase/admin";
import { isGenuineNotification, syncPayment } from "@/lib/midtrans";

// Midtrans calls this address whenever a payment changes (set it as the
// "Payment Notification URL" in the Midtrans dashboard once the site is
// online: https://<your site>/api/payments/midtrans). It only works on a
// public address — while developing, the order page checks with Midtrans
// instead.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  // Only messages signed with our server key are from Midtrans.
  if (!isGenuineNotification(body)) {
    return Response.json({ error: "Invalid signature." }, { status: 403 });
  }

  const { data: order } = await createAdminClient()
    .from("orders")
    .select("id, number, status, total, payment_expires_at, payment_method")
    .eq("number", (body as { order_id: string }).order_id)
    .maybeSingle();
  // The message is only a nudge: the real status is asked from Midtrans.
  if (order) await syncPayment(order);

  return Response.json({ ok: true });
}
