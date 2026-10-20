"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MESSAGE_MAX, MESSAGE_MIN } from "@/lib/support-threads";

export type MessageResult =
  | { ok: true; threadId: string }
  | { ok: false; reason: "signin" | "invalid" | "limit" | "failed"; message: string };

// Spam guard: at most this many messages per buyer in the last 10 minutes.
const MAX_PER_10_MIN = 8;

// Every write runs here on the server: the sign-in and the conversation's
// owner are checked first, then the secret key does the writing.
async function signedInUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function cleanBody(body: unknown) {
  const text = typeof body === "string" ? body.trim() : "";
  if (text.length < MESSAGE_MIN) return { error: `Please write at least ${MESSAGE_MIN} characters.` };
  if (text.length > MESSAGE_MAX) return { error: `Please keep it under ${MESSAGE_MAX} characters.` };
  return { text };
}

async function tooManyRecent(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("support_messages")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", since);
  return (count ?? 0) >= MAX_PER_10_MIN;
}

// The Support page form: starts a new conversation.
export async function startConversation(input: {
  product: string;
  message: string;
  followUpOf?: string;
  orderNumber?: string;
}): Promise<MessageResult> {
  const user = await signedInUser();
  if (!user || !user.email) {
    return { ok: false, reason: "signin", message: "Please sign in to message us." };
  }
  const body = cleanBody(input.message);
  if ("error" in body) return { ok: false, reason: "invalid", message: body.error ?? "" };

  const admin = createAdminClient();
  if (await tooManyRecent(admin, user.id)) {
    return {
      ok: false,
      reason: "limit",
      message: "You've sent a lot of messages just now. Please wait a few minutes.",
    };
  }

  // A follow-up may only point at one of the buyer's own conversations.
  let followUpOf: string | null = null;
  if (typeof input.followUpOf === "string" && input.followUpOf) {
    const { data: earlier } = await admin
      .from("support_threads")
      .select("id")
      .eq("id", input.followUpOf)
      .eq("user_id", user.id)
      .maybeSingle();
    followUpOf = earlier?.id ?? null;
  }

  // …and an order link may only point at one of the buyer's own orders.
  let orderId: string | null = null;
  if (typeof input.orderNumber === "string" && input.orderNumber) {
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("number", input.orderNumber)
      .eq("user_id", user.id)
      .maybeSingle();
    orderId = order?.id ?? null;
  }

  const name: string = user.user_metadata?.full_name || user.email.split("@")[0];
  const { data: thread, error } = await admin
    .from("support_threads")
    .insert({
      user_id: user.id,
      name,
      email: user.email,
      product: typeof input.product === "string" ? input.product.trim().slice(0, 80) : "",
      follow_up_of: followUpOf,
      order_id: orderId,
    })
    .select("id")
    .single();
  if (error || !thread) {
    console.error("startConversation:", error?.message);
    return { ok: false, reason: "failed", message: "We couldn't send your message. Please try again." };
  }

  const { error: msgError } = await admin.from("support_messages").insert({
    thread_id: thread.id,
    sender: "customer",
    author_id: user.id,
    body: body.text,
  });
  if (msgError) {
    console.error("startConversation (message):", msgError.message);
    await admin.from("support_threads").delete().eq("id", thread.id);
    return { ok: false, reason: "failed", message: "We couldn't send your message. Please try again." };
  }
  return { ok: true, threadId: thread.id };
}

// A buyer's reply inside one of their own conversations.
export async function sendCustomerMessage(
  threadId: string,
  message: string,
): Promise<MessageResult> {
  const user = await signedInUser();
  if (!user) return { ok: false, reason: "signin", message: "Please sign in again." };
  const body = cleanBody(message);
  if ("error" in body) return { ok: false, reason: "invalid", message: body.error ?? "" };

  const admin = createAdminClient();
  const { data: thread } = await admin
    .from("support_threads")
    .select("id, status")
    .eq("id", threadId)
    .eq("user_id", user.id) // only their own conversation
    .maybeSingle();
  if (!thread) return { ok: false, reason: "invalid", message: "Conversation not found." };
  if (thread.status === "resolved") {
    return {
      ok: false,
      reason: "invalid",
      message: "This conversation is resolved. Please start a follow-up instead.",
    };
  }
  if (await tooManyRecent(admin, user.id)) {
    return {
      ok: false,
      reason: "limit",
      message: "You've sent a lot of messages just now. Please wait a few minutes.",
    };
  }

  const now = new Date().toISOString();
  const { error } = await admin.from("support_messages").insert({
    thread_id: threadId,
    sender: "customer",
    author_id: user.id,
    body: body.text,
    created_at: now,
  });
  if (error) {
    console.error("sendCustomerMessage:", error.message);
    return { ok: false, reason: "failed", message: "We couldn't send your message. Please try again." };
  }
  // The customer wrote last, so it's back on the admins' to-do list.
  await admin
    .from("support_threads")
    .update({ status: "open", admin_unread: true, customer_unread: false, last_message_at: now })
    .eq("id", threadId);
  return { ok: true, threadId };
}

// Opening a conversation clears its "new reply" dot.
export async function markReadByCustomer(threadId: string) {
  const user = await signedInUser();
  if (!user) return;
  await createAdminClient()
    .from("support_threads")
    .update({ customer_unread: false })
    .eq("id", threadId)
    .eq("user_id", user.id);
}
