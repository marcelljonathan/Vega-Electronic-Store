"use client";

import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  return (
    <div
      data-mode={mode}
      className="min-h-screen w-full bg-bg pb-16 font-sans text-fg transition-colors duration-500"
    >
      <div className="mx-auto max-w-280 px-7">
        <nav className="flex items-center gap-6 border-b border-line py-5">
          <span className="text-lg font-extrabold tracking-[0.16em]">VEGA</span>

          <div className="mx-auto hidden gap-6 sm:flex">
            {["Phones", "Watch", "Audio", "Support"].map((link) => (
              <a
                key={link}
                className="cursor-pointer text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <button
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
            >
              {mode === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
            <button className="rounded-full bg-accent px-4.5 py-2 text-sm font-semibold text-white">
              Buy
            </button>
          </div>
        </nav>
      </div>
    </div>
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
