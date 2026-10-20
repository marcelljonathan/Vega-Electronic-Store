import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
  THREAD_SELECT,
  lastMessage,
  formatMessageTime,
  threadStatuses,
  threadTitle,
  type SupportThread,
  type ThreadStatus,
} from "@/lib/support-threads";
import { ThreadStatusPill } from "@/app/(store)/account/messages/ThreadView";

export const metadata: Metadata = {
  title: "Messages",
};

const statusList = Object.keys(threadStatuses) as ThreadStatus[];

export default async function AdminMessagesPage({
  searchParams,
}: PageProps<"/admin/messages">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  // Default tab: Open (waiting for an answer). "all" shows everything.
  const tab = params.status === "all" ? "all" : (statusList.find((s) => s === params.status) ?? "open");

  const { data } = await supabase
    .from("support_threads")
    .select(THREAD_SELECT)
    .order("last_message_at", { ascending: false })
    .limit(300);
  const all = (data ?? []) as SupportThread[];
  // Unread conversations first, then newest.
  const threads = all
    .filter((t) => tab === "all" || t.status === tab)
    .sort((a, b) => Number(b.admin_unread) - Number(a.admin_unread));

  const tabs: { id: ThreadStatus | "all"; label: string; count: number }[] = [
    ...statusList.map((s) => ({
      id: s,
      label: threadStatuses[s].admin,
      count: all.filter((t) => t.status === s).length,
    })),
    { id: "all", label: "All", count: all.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Messages</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <Link
              key={t.id}
              href={t.id === "open" ? "/messages" : `/messages?status=${t.id}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active ? "border-fg bg-fg text-bg" : "border-line text-muted hover:text-fg"
              }`}
            >
              {t.label} <span className="tabular-nums opacity-70">{t.count}</span>
            </Link>
          );
        })}
      </div>

      {threads.length === 0 ? (
        <p className="rounded-2xl border border-line p-8 text-center text-sm text-muted">
          {tab === "open" ? "No open conversations — all caught up." : "No conversations here."}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line">
          {threads.map((t) => {
            const last = lastMessage(t);
            return (
              <li key={t.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/messages/${t.id}`}
                  className="grid grid-cols-[12px_1fr_auto] items-start gap-x-3 gap-y-1 px-5 py-4 transition-colors hover:bg-card md:grid-cols-[12px_1.2fr_1fr_2.5fr_auto] md:items-center"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full md:mt-0 ${t.admin_unread ? "bg-accent" : ""}`}
                    aria-label={t.admin_unread ? "New" : undefined}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className={`truncate text-sm ${t.admin_unread ? "font-semibold" : ""}`}>
                      {t.name}
                    </span>
                    <span className="truncate text-xs text-muted">{t.email}</span>
                  </span>
                  <span className="hidden truncate text-sm text-muted md:block">
                    {t.follow_up_of && "↩ "}
                    {threadTitle(t)}
                  </span>
                  <span className="col-start-2 truncate text-sm text-muted md:col-start-auto">
                    {last?.sender === "admin" ? "You: " : ""}
                    {last?.body}
                  </span>
                  <span className="col-start-3 row-start-1 flex flex-col items-end gap-1 md:col-start-auto md:row-start-auto">
                    <ThreadStatusPill status={t.status} side="admin" />
                    <span className="text-xs whitespace-nowrap text-muted">
                      {formatMessageTime(t.last_message_at)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
