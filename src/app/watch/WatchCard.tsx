"use client";

import { useState } from "react";
import Link from "next/link";
import type { Watch } from "@/lib/watches";
import { formatRupiah } from "@/lib/format";

export default function WatchCard({ watch }: { watch: Watch }) {
  const [band, setBand] = useState(watch.bands[0]);

  return (
    <div className="relative flex flex-col items-center gap-4 rounded-2xl p-6 text-center transition-colors hover:bg-card">
      <Link
        href={`/watch/${watch.slug}`}
        aria-label={watch.name}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      <div className="relative grid w-full place-items-center py-2">
        <div className="glow-layer" />
        <div
          className="watch"
          data-size="card"
          style={
            { "--band-a": band.bandA, "--band-b": band.bandB } as React.CSSProperties
          }
        >
          <div className="band" />
          <div className="case">
            <div className="face" />
          </div>
          <div className="crown" />
        </div>
      </div>

      {/* Band color dots — above the click overlay */}
      <div className="relative z-20 flex gap-2.5">
        {watch.bands.map((b) => (
          <button
            key={b.name}
            onClick={() => setBand(b)}
            aria-label={b.name}
            className={`h-4 w-4 rounded-full transition ${
              b.name === band.name ? "ring-2 ring-accent" : "ring-1 ring-line"
            }`}
            style={{
              background: `linear-gradient(135deg, ${b.bandA}, ${b.bandB})`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-base font-semibold">{watch.name}</span>
        <span className="text-sm text-muted">{watch.tagline}</span>
      </div>

      <span className="text-sm font-semibold text-accent">
        From {formatRupiah(watch.price)}
      </span>
    </div>
  );
}
