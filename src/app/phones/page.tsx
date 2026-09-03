import type { Metadata } from "next";
import { phones } from "@/lib/phones";

export const metadata: Metadata = {
  title: "Phones — Vega",
  description: "The Vega phone lineup — four phones, one obsession with light.",
};

export default function PhonesPage() {
  return (
    <div className="mx-auto max-w-280 px-7 py-16">
      <header className="flex flex-col items-center gap-3 pb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          The lineup
        </span>
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          Find your <span className="text-accent">glow</span>.
        </h1>
        <p className="max-w-[46ch] text-lg leading-relaxed text-muted">
          Four phones, one obsession with light. Whichever you choose, it was
          made to shine.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {phones.map((phone) => (
          <div
            key={phone.slug}
            className="flex flex-col items-center gap-5 rounded-[18px] border border-line bg-card p-7 text-center"
          >
            <div className="relative grid w-full place-items-center py-2">
              <div className="glow-layer" />
              <div className="device" data-color={phone.slug} data-size="card">
                <div className="screen">
                  <div className="glare" />
                </div>
                <div className="cam" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {phone.tier}
              </span>
              <span className="text-lg font-semibold">{phone.name}</span>
              <span className="text-sm text-muted">{phone.tagline}</span>
            </div>

            <span className="text-sm font-semibold text-accent">
              From ${phone.price.toLocaleString("en-US")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
