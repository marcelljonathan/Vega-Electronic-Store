import Link from "next/link";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Phones", href: "/phones" },
      { label: "Watch", href: "/watch" },
      { label: "Audio", href: "/audio" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Support & FAQ", href: "/support" },
      { label: "Contact us", href: "/support#contact" },
    ],
  },
];

// Site-wide footer — rendered by AppShell under every page.
export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-280 flex-col gap-10 px-7 py-12 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-lg font-extrabold tracking-[0.16em]">
            VEGA
          </Link>
          <p className="text-sm text-muted">Made to glow.</p>
        </div>
        <div className="flex gap-16">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {col.title}
              </span>
              {col.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted transition-colors hover:text-fg"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-280 px-7 py-5 text-xs text-muted">
          © 2026 Vega · A fictional brand made as a portfolio project. Products,
          prices and checkout are for demonstration only.
        </p>
      </div>
    </footer>
  );
}
