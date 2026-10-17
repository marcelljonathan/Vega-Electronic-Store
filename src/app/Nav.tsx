import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";

type Mode = "light" | "dark";

const links = [
  { label: "Phones", href: "/phones" },
  { label: "Watch", href: "/watch" },
  { label: "Audio", href: "/audio" },
  { label: "Support", href: "/support" },
];

export default function Nav({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const { count, openCart } = useCart();
  const { user, ready } = useAuth();
  const hidden = useHideOnScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  // While the mobile menu is open: lock the page scroll, close on Escape,
  // and close if the window grows to desktop width (where the menu is hidden).
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    const desktop = window.matchMedia("(min-width: 40rem)");
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b border-line bg-bg/70 backdrop-blur-md transition-transform duration-300 focus-within:translate-y-0 motion-reduce:transition-none ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-280 items-center gap-6 px-7 py-5">
          <Link
            href="/"
            onClick={closeMenu}
            className="text-lg font-extrabold tracking-[0.16em]"
          >
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
              onClick={() => {
                closeMenu();
                openCart();
              }}
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
            {/* Signed in: initial → My account. Signed out: person icon → Sign in.
                Until the session is known, link to /account (it redirects if needed). */}
            <Link
              href={user || !ready ? "/account" : "/signin"}
              onClick={closeMenu}
              aria-label={user ? "My account" : "Sign in"}
              className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-colors ${
                user
                  ? "bg-accent text-white"
                  : "border border-line text-muted hover:text-fg"
              }`}
            >
              {user ? user.fullName.charAt(0).toUpperCase() : <PersonIcon />}
            </Link>
            {/* Mobile menu toggle — phones only */}
            <button
              ref={menuButton}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg sm:hidden"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel — drops down under the bar */}
        <div
          id="mobile-menu"
          className={`absolute inset-x-0 top-full border-b border-line bg-bg transition-[opacity,translate,visibility] duration-200 motion-reduce:transition-none sm:hidden ${
            menuOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0"
          }`}
        >
          <ul className="mx-auto flex max-w-280 flex-col px-7 py-3">
            {links.map((link) => (
              <li key={link.label} className="border-b border-line">
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center justify-between py-4 text-2xl font-medium tracking-tight"
                >
                  {link.label}
                  <span className="text-lg text-muted" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={user ? "/account" : "/signin"}
                onClick={closeMenu}
                className="flex items-center justify-between py-4 text-lg font-medium text-muted"
              >
                {user ? "My account" : "Sign in"}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Dimmed backdrop — tapping outside the menu closes it */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 motion-reduce:transition-none sm:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
    </>
  );
}

// Hides the nav while scrolling down and brings it back on any scroll up.
// It always shows near the top of the page, and small jitters are ignored.
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) setHidden(false);
      else if (delta > 8) setHidden(true);
      else if (delta < -8) setHidden(false);
      if (Math.abs(delta) > 8 || y < 80) lastY.current = y;
    };
    lastY.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
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

function MenuIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function PersonIcon() {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
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
