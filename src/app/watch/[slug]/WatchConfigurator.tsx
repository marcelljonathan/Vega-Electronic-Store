"use client";

import { useState } from "react";
import type { Watch, WatchIconName } from "@/lib/watches";
import { useCart } from "@/app/CartProvider";
import { formatRupiah } from "@/lib/format";

export default function WatchConfigurator({ watch }: { watch: Watch }) {
  const [band, setBand] = useState(watch.bands[0]);
  const [size, setSize] = useState(watch.sizes[0]);
  const [specsOpen, setSpecsOpen] = useState(false);

  const price = watch.price + size.priceDelta;

  const { addItem, openCart } = useCart();

  function handleAdd() {
    addItem({
      productSlug: watch.slug,
      kind: "watch",
      name: watch.name,
      colorName: band.name,
      screenA: band.bandA,
      screenB: band.bandB,
      option: size.label,
      unitPrice: price,
    });
    openCart();
  }

  return (
    <section className="mt-16 border-t border-line pt-14">
      <div className="flex flex-col items-center gap-2 pb-10 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Make it yours
        </span>
        <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          Configure your {watch.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: watch picture */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative grid w-full place-items-center py-6">
            <div className="glow-layer" />
            <div
              className="watch"
              style={
                {
                  "--band-a": band.bandA,
                  "--band-b": band.bandB,
                } as React.CSSProperties
              }
            >
              <div className="band" />
              <div className="case">
                <div className="face" />
              </div>
              <div className="crown" />
            </div>
          </div>
        </div>

        {/* Right: options + price + key specs */}
        <div className="flex flex-col gap-8">
          {/* Band */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">
              Band — <span className="font-normal text-muted">{band.name}</span>
            </span>
            <div className="flex gap-3">
              {watch.bands.map((b) => (
                <button
                  key={b.name}
                  onClick={() => setBand(b)}
                  aria-label={b.name}
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                    b.name === band.name ? "border-accent" : "border-line"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${b.bandA}, ${b.bandB})`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Case size */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">Case size</span>
            <div className="flex flex-col gap-2">
              {watch.sizes.map((s) => {
                const selected = s.label === size.label;
                return (
                  <button
                    key={s.label}
                    onClick={() => setSize(s)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      selected
                        ? "border-accent"
                        : "border-line hover:border-muted"
                    }`}
                  >
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className="text-sm text-muted">
                      {s.priceDelta === 0
                        ? "Included"
                        : `+${formatRupiah(s.priceDelta)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price + Buy */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-semibold">
              {formatRupiah(price)}
            </span>
            <button
              onClick={handleAdd}
              className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white"
            >
              Add to cart
            </button>
          </div>

          {/* Key specs */}
          <div className="flex flex-col gap-4 border-t border-line pt-6">
            {watch.keySpecs.map((spec) => (
              <div key={spec.label} className="flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line">
                  <WatchIcon name={spec.icon} />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-muted">{spec.label}</span>
                  <span className="text-sm font-medium">{spec.value}</span>
                </div>
              </div>
            ))}
            <button
              onClick={() => setSpecsOpen(true)}
              className="mt-2 self-start text-sm font-semibold text-accent"
            >
              See full specifications →
            </button>
          </div>
        </div>

        {/* Full specifications modal */}
        {specsOpen && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            onClick={() => setSpecsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
              className="relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-bg p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-xl font-semibold">Specifications</h2>
                <button
                  onClick={() => setSpecsOpen(false)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {watch.specGroups.map((group) => (
                  <div key={group.group} className="flex flex-col gap-1">
                    <span className="pb-1 text-sm font-semibold text-accent">
                      {group.group}
                    </span>
                    {group.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between border-b border-line py-2 last:border-b-0"
                      >
                        <span className="text-sm text-muted">{item.label}</span>
                        <span className="text-sm font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function WatchIcon({ name }: { name: WatchIconName }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "display") {
    return (
      <svg {...common}>
        <rect x="5.5" y="5.5" width="13" height="13" rx="4" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    );
  }
  if (name === "battery") {
    return (
      <svg {...common}>
        <rect x="2.5" y="8" width="16" height="8" rx="2" />
        <line x1="21" y1="10.5" x2="21" y2="13.5" />
        <line x1="6" y1="12" x2="11" y2="12" />
      </svg>
    );
  }
  if (name === "health") {
    return (
      <svg {...common}>
        <path d="M20.4 8.6a4.6 4.6 0 0 0-8.4-2.5 4.6 4.6 0 0 0-8.4 2.5c0 3.4 3.1 6 8.4 10 5.3-4 8.4-6.6 8.4-10z" />
      </svg>
    );
  }
  // water
  return (
    <svg {...common}>
      <path d="M12 3.2s6 6.4 6 10.8a6 6 0 0 1-12 0c0-4.4 6-10.8 6-10.8z" />
    </svg>
  );
}
