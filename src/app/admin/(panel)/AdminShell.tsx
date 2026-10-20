"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminTheme } from "../AdminFrame";
import SignOutButton from "@/app/(store)/account/SignOutButton";

const sections = [
  { label: "Orders", href: "/orders", ready: true },
  { label: "Products", href: "/products", ready: true },
  { label: "Messages", href: "/messages", ready: true },
];

// Sidebar (top bar on small screens) + the page area.
export default function AdminShell({
  email,
  storeUrl,
  unreadMessages,
  children,
}: {
  email: string;
  storeUrl: string;
  unreadMessages: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname().replace(/^\/admin/, "");
  const { mode, toggle } = useAdminTheme();

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <Link href="/orders" className="flex items-center gap-2.5">
            <span className="text-lg font-extrabold tracking-[0.16em]">VEGA</span>
            <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">
              Admin
            </span>
          </Link>
          <button
            onClick={toggle}
            aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-sm text-muted transition-colors hover:text-fg"
          >
            {mode === "light" ? "☾" : "☀"}
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:px-3">
          {sections.map((s) =>
            s.ready ? (
              <Link
                key={s.href}
                href={s.href}
                aria-current={pathname.startsWith(s.href) ? "page" : undefined}
                className={`rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  pathname.startsWith(s.href)
                    ? "bg-bg text-fg shadow-sm"
                    : "text-muted hover:text-fg"
                }`}
              >
                {s.label}
                {s.href === "/messages" && unreadMessages > 0 && (
                  <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            ) : (
              <span
                key={s.href}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap text-muted/60"
              >
                {s.label}
                <span className="rounded-full border border-line px-1.5 text-[10px] uppercase tracking-wider">
                  Soon
                </span>
              </span>
            ),
          )}
        </nav>

        <div className="hidden flex-col gap-3 border-t border-line px-6 py-5 lg:mt-auto lg:flex">
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-muted transition-colors hover:text-fg"
          >
            View store ↗
          </a>
          <span className="truncate text-xs text-muted" title={email}>
            {email}
          </span>
          <SignOutButton />
        </div>
      </aside>

      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
