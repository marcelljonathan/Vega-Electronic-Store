"use client";

import { useState } from "react";
import type { Phone, SpecIconName } from "@/lib/phones";
import { useCart } from "@/app/CartProvider";

export default function PhoneConfigurator({ phone }: { phone: Phone }) {
  const [color, setColor] = useState(phone.colors[0]);
  const [storage, setStorage] = useState(phone.storage[0]);
  const [specsOpen, setSpecsOpen] = useState(false);

  const price = phone.price + storage.priceDelta;
  const { addItem, openCart } = useCart();

  function handleAdd() {
    addItem({
      productSlug: phone.slug,
      kind: "phone",
      name: phone.name,
      colorName: color.name,
      screenA: color.screenA,
      screenB: color.screenB,
      option: `${storage.size} · ${storage.ram} RAM`,
      unitPrice: price,
    });
    openCart();
  }

  return (
    <div className="grid grid-cols-1 gap-12 py-8 lg:grid-cols-2">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-balance text-center text-4xl font-medium tracking-tight sm:text-5xl">
          {phone.name}
        </h1>
        <div className="relative grid w-full place-items-center py-6">
          <div className="glow-layer" />
          <div
            className="device"
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
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold">
            Color — <span className="font-normal text-muted">{color.name}</span>
          </span>
          <div className="flex gap-3">
            {phone.colors.map((c) => (
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

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold">Storage & memory</span>
          <div className="flex flex-col gap-2">
            {phone.storage.map((s) => {
              const selected = s.size === storage.size;
              return (
                <button
                  key={s.size}
                  onClick={() => setStorage(s)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-accent"
                      : "border-line hover:border-muted"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {s.size} · {s.ram} RAM
                  </span>
                  <span className="text-sm text-muted">
                    {s.priceDelta === 0
                      ? "Included"
                      : `+$${s.priceDelta.toLocaleString("en-US")}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-3xl font-semibold">
            ${price.toLocaleString("en-US")}
          </span>
          <button
            onClick={handleAdd}
            className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white"
          >
            Add to cart
          </button>
        </div>

        <div className="flex flex-col gap-4 border-t border-line pt-6">
          {phone.keySpecs.map((spec) => (
            <div key={spec.label} className="flex items-center gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line">
                <SpecIcon name={spec.icon} />
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
              {phone.specGroups.map((group) => (
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
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecIcon({ name }: { name: SpecIconName }) {
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
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
      </svg>
    );
  }
  if (name === "camera") {
    return (
      <svg {...common}>
        <path d="M4 8.5h2.6l1.2-1.9h8.4l1.2 1.9H20a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5V10A1.5 1.5 0 0 1 4 8.5z" />
        <circle cx="12" cy="13.5" r="3.1" />
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

  return (
    <svg {...common}>
      <rect x="7.5" y="7.5" width="9" height="9" rx="1.5" />
      <path d="M10 4v3.5M14 4v3.5M10 16.5V20M14 16.5V20M4 10h3.5M4 14h3.5M16.5 10H20M16.5 14H20" />
    </svg>
  );
}
