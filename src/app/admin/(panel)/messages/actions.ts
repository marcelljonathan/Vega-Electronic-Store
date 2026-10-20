"use server";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { MESSAGE_MAX, MESSAGE_MIN, type ThreadStatus } from "@/lib/support-threads";

export type AdminMessageResult = { ok: true } | { ok: false; message: string };

// An admin's reply: saved as "Vega Support", and the buyer gets a "new reply" dot.
export async function replyToThread(
  threadId: string,
  message: string,
): Promise<AdminMessageResult> {
  const { user } = await requireAdmin();
  const body = typeof message === "string" ? message.trim() : "";
  if (body.length < MESSAGE_MIN || body.length > MESSAGE_MAX) {
    return { ok: false, message: `Replies need ${MESSAGE_MIN}–${MESSAGE_MAX} characters.` };
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await admin.from("support_messages").insert({
    thread_id: threadId,
    sender: "admin",
    author_id: user.id,
    body,
    created_at: now,
  });
  if (error) {
    console.error("replyToThread:", error.message);
    return { ok: false, message: "Couldn't send the reply. Please try again." };
  }
  await admin
    .from("support_threads")
    .update({ status: "replied", customer_unread: true, admin_unread: false, last_message_at: now })
    .eq("id", threadId);
  return { ok: true };
}

// Mark resolved, or reopen.
export async function setThreadStatus(
  threadId: string,
  status: ThreadStatus,
): Promise<AdminMessageResult> {
  await requireAdmin();
  if (!["open", "replied", "resolved"].includes(status)) {
    return { ok: false, message: "Unknown status." };
  }
  const { error } = await createAdminClient()
    .from("support_threads")
    .update({ status, admin_unread: false })
    .eq("id", threadId);
  if (error) return { ok: false, message: "Couldn't update the conversation." };
  return { ok: true };
}

// Opening a conversation clears its "new" dot in the inbox.
export async function markReadByAdmin(threadId: string) {
  await requireAdmin();
  await createAdminClient()
    .from("support_threads")
    .update({ admin_unread: false })
    .eq("id", threadId);
}
