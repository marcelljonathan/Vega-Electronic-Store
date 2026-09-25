import Link from "next/link";
import { useCart } from "./CartProvider";

type Mode = "light" | "dark";

const links = [
  { label: "Phones", href: "/phones" },
  { label: "Watch", href: "/watch" },
  { label: "Audio", href: "/audio" },
  { label: "Support", href: "#" },
];

export default function Nav({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const { count, openCart } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-280 items-center gap-6 px-7 py-5">
        <Link href="/" className="text-lg font-extrabold tracking-[0.16em]">
          VEGA
        </Link>

        <div className="mx-auto hidden gap-6 sm:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          <button
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            aria-label={
              mode === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
          >
            {mode === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

function MoonIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
