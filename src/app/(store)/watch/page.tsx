import type { Metadata } from "next";
import { getWatches } from "@/lib/catalog";
import WatchCard from "./WatchCard";

export const metadata: Metadata = {
  title: "Watch — Vega",
  description: "The Vega watch line — health, training, and time, made to glow.",
};

export default async function WatchPage() {
  const watches = await getWatches();
  return (
    <div className="mx-auto max-w-280 px-7 py-16">
      <header className="flex flex-col items-center gap-3 pb-14 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Vega Watch
        </span>
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          Time to <span className="text-accent">glow</span>.
        </h1>
        <p className="max-w-[46ch] text-lg leading-relaxed text-muted">
          Health, training, and time — three watches, one obsession with light.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {watches.map((watch) => (
          <WatchCard key={watch.slug} watch={watch} />
        ))}
      </div>
    </div>
  );
}
