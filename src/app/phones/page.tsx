import type { Metadata } from "next";
import { phones } from "@/lib/phones";
import PhoneCard from "./PhoneCard";

export const metadata: Metadata = {
  title: "Phones — Vega",
  description: "The Vega phone lineup — four families, one obsession with light.",
};

export default function PhonesPage() {
  // Families in first-appearance order.
  const families = Array.from(new Set(phones.map((p) => p.family)));

  return (
    <div className="mx-auto max-w-280 px-7 py-16">
      {/* Page header */}
      <header className="flex flex-col items-center gap-3 pb-14 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          The lineup
        </span>
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          Find your <span className="text-accent">glow</span>.
        </h1>
        <p className="max-w-[46ch] text-lg leading-relaxed text-muted">
          Four families, three tiers each. Whichever you choose, it was made to
          shine.
        </p>
      </header>

      {/* One section per family */}
      <div className="flex flex-col gap-16">
        {families.map((family) => (
          <section key={family} className="flex flex-col gap-8">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              {family} Series
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {phones
                .filter((phone) => phone.family === family)
                .map((phone) => (
                  <PhoneCard key={phone.slug} phone={phone} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
