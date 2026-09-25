"use client";

import { useState } from "react";
import Link from "next/link";
import type { Audio } from "@/lib/audio";
import AudioArt from "./AudioArt";

export default function AudioCard({ item }: { item: Audio }) {
  const [color, setColor] = useState(item.colors[0]);

  return (
    <div className="relative flex flex-col items-center gap-4 rounded-2xl p-6 text-center transition-colors hover:bg-card">
      <Link
        href={`/audio/${item.slug}`}
        aria-label={item.name}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      <div className="relative grid w-full place-items-center py-2">
        <div className="glow-layer" />
        <AudioArt shape={item.shape} size="card" a={color.screenA} b={color.screenB} />
      </div>

      {/* Color dots — above the click overlay */}
      <div className="relative z-20 flex gap-2.5">
        {item.colors.map((c) => (
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
        <span className="text-base font-semibold">{item.name}</span>
        <span className="text-sm text-muted">{item.tagline}</span>
      </div>

      <span className="text-sm font-semibold text-accent">
        From ${item.price.toLocaleString("en-US")}
      </span>
    </div>
  );
}
