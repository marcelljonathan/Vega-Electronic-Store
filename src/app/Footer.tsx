import Link from "next/link";
import { supportContact } from "@/lib/contact";

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
      { label: "Shipping & returns", href: "/support#shipping" },
      { label: "Warranty", href: "/support#warranty" },
    ],
  },
];

const contactLines = [
  { icon: "clock", text: supportContact.hours },
  { icon: "email", text: supportContact.email },
  { icon: "phone", text: supportContact.phone },
] as const;

// Site-wide footer — rendered by AppShell under every page.
export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-280 flex-col gap-10 px-7 py-12 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-lg font-extrabold tracking-[0.16em]">
              VEGA
            </Link>
            <p className="text-sm text-muted">Made to glow.</p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {contactLines.map((c) => (
              <li key={c.icon} className="flex items-center gap-2.5 text-sm text-muted">
                <FooterIcon name={c.icon} />
                {c.text}
              </li>
            ))}
          </ul>
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
          A fictional brand. Products, prices and checkout are for
          demonstration only.
        </p>
      </div>
    </footer>
  );
}

function FooterIcon({ name }: { name: "clock" | "email" | "phone" }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "shrink-0",
  };

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  if (name === "email") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M4 7l8 6 8-6" />
      </svg>
    );
  }
  // phone
  return (
    <svg {...common}>
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}
