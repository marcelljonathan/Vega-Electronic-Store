import type { Metadata } from "next";
import AdminFrame from "./AdminFrame";

export const metadata: Metadata = {
  title: { template: "%s — Vega Admin", default: "Vega Admin" },
  robots: { index: false, follow: false },
};

// The admin site (served on the admin address — see src/proxy.ts).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminFrame>{children}</AdminFrame>;
}
