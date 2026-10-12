"use client";

import { useState } from "react";
import { faqs, faqCategories, type Faq } from "@/lib/support";

// Hero search + FAQ accordion in one column: the search box filters the
// answers directly below it as you type.
export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // A match in the question, the answer, or the category name
  // (so "audio" shows the whole Audio group).
  const q = query.trim().toLowerCase();
  const results = faqs.filter(
    (f) =>
      q === "" ||
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      faqCategories
        .find((c) => c.id === f.category)
        ?.label.toLowerCase()
        .includes(q),
  );

  // Group the matching answers under their category, in display order.
  const groups = faqCategories
    .map((c) => ({ ...c, items: results.filter((f) => f.category === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      {/* Hero + search */}
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Vega Support
        </span>
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          How can we <span className="text-accent">help</span>?
        </h1>
        <p className="max-w-[46ch] text-lg leading-relaxed text-muted">
          Search the answers below, or get in touch with the team.
        </p>
        <label className="relative mt-4 w-full">
          <span className="sr-only">Search help answers</span>
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "battery" or "pairing"'
            className="w-full rounded-full border border-line bg-card py-4 pr-5 pl-12 text-base outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </label>
        {/* Result count — always rendered so screen readers announce changes */}
        <p aria-live="polite" className="min-h-5 text-sm text-muted">
          {q !== "" && (
            <>
              {results.length} {results.length === 1 ? "answer" : "answers"}{" "}
              for “{query.trim()}” ·{" "}
              <button
                onClick={() => setQuery("")}
                className="font-semibold text-accent"
              >
                Clear
              </button>
            </>
          )}
        </p>
      </header>

      {/* FAQ */}
      {groups.length === 0 ? (
        <p className="rounded-2xl border border-line p-8 text-center text-muted">
          No answers match “{query.trim()}”. Try a different word, or send us a
          message below.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <div key={g.id} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-accent">{g.label}</h2>
              <div className="flex flex-col divide-y divide-line rounded-2xl border border-line">
                {g.items.map((f) => (
                  <FaqItem
                    key={f.id}
                    faq={f}
                    open={openId === f.id}
                    onToggle={() => setOpenId(openId === f.id ? null : f.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// One question/answer row. The answer slides open by animating the grid
// row from 0fr (collapsed) to 1fr (its natural height).
function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `faq-${faq.id}`;

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:text-accent"
      >
        {faq.question}
        <span
          aria-hidden="true"
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        id={panelId}
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-muted"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}
