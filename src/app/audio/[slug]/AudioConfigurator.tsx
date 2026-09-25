"use client";

import { useState } from "react";
import type { Audio } from "@/lib/audio";
import { useCart } from "@/app/CartProvider";
import AudioArt from "../AudioArt";
import AudioIcon from "../AudioIcon";

export default function AudioConfigurator({ item }: { item: Audio }) {
  const [color, setColor] = useState(item.colors[0]);
  const [specsOpen, setSpecsOpen] = useState(false);

  const { addItem, openCart } = useCart();

  function handleAdd() {
    addItem({
      productSlug: item.slug,
      kind: item.shape,
      name: item.name,
      colorName: color.name,
      screenA: color.screenA,
      screenB: color.screenB,
      option: "",
      unitPrice: item.price,
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
          Configure your {item.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: product picture */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative grid w-full place-items-center py-6">
            <div className="glow-layer" />
            <AudioArt
              shape={item.shape}
              a={color.screenA}
              b={color.screenB}
            />
          </div>
        </div>

        {/* Right: color + price + key specs */}
        <div className="flex flex-col gap-8">
          {/* Color */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">
              Color — <span className="font-normal text-muted">{color.name}</span>
            </span>
            <div className="flex gap-3">
              {item.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c)}
                  aria-label={c.name}
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                    c.name === color.name ? "border-accent" : "border-line"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${c.screenA}, ${c.screenB})`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Price + Buy */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-semibold">
              ${item.price.toLocaleString("en-US")}
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
            {item.keySpecs.map((spec) => (
              <div key={spec.label} className="flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line">
                  <AudioIcon name={spec.icon} />
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
                {item.specGroups.map((group) => (
                  <div key={group.group} className="flex flex-col gap-1">
                    <span className="pb-1 text-sm font-semibold text-accent">
                      {group.group}
                    </span>
                    {group.items.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-center justify-between border-b border-line py-2 last:border-b-0"
                      >
                        <span className="text-sm text-muted">{spec.label}</span>
                        <span className="text-sm font-medium">{spec.value}</span>
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
