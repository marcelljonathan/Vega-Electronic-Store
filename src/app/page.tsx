"use client";

import { useState } from "react";

const features = [
  { num: "2,600", title: "nits of Ember display", sub: "6.7″ · 120Hz · readable in full sun" },
  { num: "50MP", title: "Triple camera system", sub: "Low-light photography, redefined" },
  { num: "22 min", title: "Full charge, two-day battery", sub: "From empty to 100% before you leave" },
];

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
              aria-label={
                mode === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
            >
              {mode === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
            <button className="rounded-full bg-accent px-4.5 py-2 text-sm font-semibold text-white">
              Buy
            </button>
          </div>
        </nav>
        <section className="grid justify-items-center gap-9 py-16 text-center">
          <div className="flex max-w-[36ch] flex-col items-center gap-4.5">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
              Introducing Ember
            </span>
            <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Made to <span className="text-accent">glow</span>.
            </h1>
            <p className="max-w-[42ch] text-lg leading-relaxed text-muted">
              Our brightest, sharpest display yet — engineered to come alive in
              your hand.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4.5">
              <button className="cursor-pointer rounded-full bg-accent px-7.5 py-3.25 text-[0.95rem] font-semibold text-white">
                Buy from $899
              </button>
              <a className="cursor-pointer text-[0.95rem] font-semibold text-accent">
                Learn more →
              </a>
            </div>
          </div>
          <div className="relative grid w-full place-items-center py-6">
            <div className="glow-layer" />
            <div className="device">
              <div className="screen">
                <div className="glare" />
              </div>
              <div className="cam" />
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-2 rounded-[15px] border border-line bg-card p-6"
            >
              <span className="text-3xl font-extrabold tracking-tight text-accent">{f.num}</span>
              <span className="text-base font-semibold">{f.title}</span>
              <span className="text-sm text-muted">{f.sub}</span>
            </div>
          ))}
        </section>
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
