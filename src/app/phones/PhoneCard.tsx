"use client";

import { useState } from "react";
import Link from "next/link";
import type { Phone } from "@/lib/phones";

export default function PhoneCard({ phone }: { phone: Phone }) {
  const [color, setColor] = useState(phone.colors[0]);

  return (
    <div className="relative flex flex-col items-center gap-4 rounded-2xl p-6 text-center transition-colors hover:bg-card">
      {/* Whole-card link to the detail page (z-10, below the dots at z-20). */}
      <Link
        href={`/phones/${phone.slug}`}
        aria-label={phone.name}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      {/* Phone image — reflects the selected color */}
      <div className="relative grid w-full place-items-center py-2">
        <div className="glow-layer" />
        <div
          className="device"
          data-size="card"
          style={
            {
              "--screen-a": color.screenA,
              "--screen-b": color.screenB,
            } as React.CSSProperties
          }
        >
          <div className="screen">
            <div className="glare" />
          </div>
          <div className="cam" />
        </div>
      </div>

      {/* Color dots — above the click overlay, so they're interactive */}
      <div className="relative z-20 flex gap-2.5">
        {phone.colors.map((c) => (
          <button
            key={c.name}
            onClick={() => setColor(c)}
            aria-label={c.name}
            className={`h-4 w-4 rounded-full transition ${
              c.name === color.name ? "ring-2 ring-accent" : "ring-1 ring-line"
            }`}
            style={{
              background: `linear-gradient(135deg, ${c.screenA}, ${c.screenB})`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        {phone.bestValue && (
          <span className="mb-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
            Best value
          </span>
        )}
        <span className="text-base font-semibold">{phone.name}</span>
        <span className="text-sm text-muted">{phone.tagline}</span>
      </div>

      <span className="text-sm font-semibold text-accent">
        From ${phone.price.toLocaleString("en-US")}
      </span>
    </div>
  );
}
