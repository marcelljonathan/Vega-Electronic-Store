import { requireAdmin, storeUrl } from "@/lib/admin";
import AdminShell from "./AdminShell";

// Admin pages with the sidebar. Each page also checks admin access itself.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  const store = await storeUrl();

  return (
    <AdminShell email={user.email ?? ""} storeUrl={store}>
      {children}
    </AdminShell>
  );
}
