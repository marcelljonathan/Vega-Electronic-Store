"use client";

import { useState, useTransition } from "react";
import { setProductAvailability } from "./actions";

// On sale / Sold out switch for one product in the list. Saves immediately.
export default function AvailabilitySwitch({
  slug,
  name,
  available,
}: {
  slug: string;
  name: string;
  available: boolean;
}) {
  const [on, setOn] = useState(available);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !on;
    setOn(next); // show it straight away; undo if saving fails
    setError(null);
    startTransition(async () => {
      const result = await setProductAvailability(slug, next);
      if (!result.ok) {
        setOn(!next);
        setError(result.message);
      }
    });
  }

  return (
    <span className="flex flex-col items-start gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`${name}: ${on ? "on sale" : "sold out"}`}
        onClick={toggle}
        disabled={pending}
        className="flex items-center gap-2 text-sm font-medium disabled:opacity-60"
      >
        <span
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            on ? "bg-emerald-500" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-4.5" : "translate-x-0.5"
            }`}
          />
        </span>
        <span className={`w-16 text-left ${on ? "" : "text-muted"}`}>
          {on ? "On sale" : "Sold out"}
        </span>
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  );
}
