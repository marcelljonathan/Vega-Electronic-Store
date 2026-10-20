import { requireAdmin, storeUrl } from "@/lib/admin";
import AdminShell from "./AdminShell";

// Admin pages with the sidebar. Each page also checks admin access itself.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const store = await storeUrl();
  // New customer messages, shown as a count beside "Messages".
  const { count } = await supabase
    .from("support_threads")
    .select("id", { count: "exact", head: true })
    .eq("admin_unread", true);

  return (
    <AdminShell email={user.email ?? ""} storeUrl={store} unreadMessages={count ?? 0}>
      {children}
    </AdminShell>
  );
}
