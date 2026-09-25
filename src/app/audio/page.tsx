import type { Metadata } from "next";
import { audio } from "@/lib/audio";
import AudioCard from "./AudioCard";

export const metadata: Metadata = {
  title: "Audio — Vega",
  description: "The Vega audio line — earbuds and headphones, made to glow.",
};

export default function AudioPage() {
  return (
    <div className="mx-auto max-w-280 px-7 py-16">
      <header className="flex flex-col items-center gap-3 pb-14 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Vega Audio
        </span>
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          Sound that <span className="text-accent">glows</span>.
        </h1>
        <p className="max-w-[46ch] text-lg leading-relaxed text-muted">
          Earbuds and headphones tuned by Vega — big sound, quiet world,
          all-day battery.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {audio.map((item) => (
          <AudioCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
