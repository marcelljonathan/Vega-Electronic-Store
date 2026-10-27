import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";
import ProfileCard from "./ProfileCard";
import { OrderListItem } from "../orders/OrderParts";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { THREAD_SELECT, type SupportThread } from "@/lib/support-threads";
import { ThreadRow } from "./messages/ThreadView";

export const metadata: Metadata = {
  title: "My account — Vega",
};

export default async function AccountPage() {
  // Checked on the server with Supabase — signed-out visitors go to Sign in.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/signin?next=/account");

  const email = user.email ?? "";
  const fullName: string = user.user_metadata?.full_name || email.split("@")[0];
  // This buyer's 3 most recent orders.
  const { data: recent } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);
  const orders = (recent ?? []) as OrderRow[];

  // This buyer's 3 most recent support conversations.
  const { data: recentThreads } = await supabase
    .from("support_threads")
    .select(THREAD_SELECT)
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false })
    .limit(3);
  const threads = (recentThreads ?? []) as SupportThread[];
  const unreadReplies = threads.filter((t) => t.customer_unread).length;

  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-280 flex-col gap-10 px-7 py-16">
      <h1 className="text-center text-base font-bold uppercase tracking-[0.24em] text-fg">
        My account
      </h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.4fr]">
        <ProfileCard fullName={fullName} email={email} memberSince={memberSince} />

        <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Orders</h2>
            {orders.length > 0 && (
              <Link href="/orders" className="text-sm font-semibold text-accent">
                View all orders →
              </Link>
            )}
          </div>
          {orders.length === 0 ? (
            <div className="flex flex-1 flex-col items-start justify-center gap-2">
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
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            Support
            {unreadReplies > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                {unreadReplies} new {unreadReplies === 1 ? "reply" : "replies"}
              </span>
            )}
          </h2>
          <Link
            href={threads.length > 0 ? "/account/messages" : "/support#contact"}
            className="text-sm font-semibold text-accent"
          >
            {threads.length > 0 ? "View all conversations →" : "Message us →"}
          </Link>
        </div>
        {threads.length === 0 ? (
          <p className="text-sm text-muted">
            Questions about a product or an order? Message us and the reply will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {threads.map((t) => (
              <li key={t.id}>
                <ThreadRow thread={t} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <SignOutButton />
    </div>
  );
}
