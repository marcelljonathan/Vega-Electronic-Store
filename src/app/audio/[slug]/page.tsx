import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { audio } from "@/lib/audio";
import AudioConfigurator from "./AudioConfigurator";
import AudioFeatures from "./AudioFeatures";

export function generateStaticParams() {
  return audio.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = audio.find((a) => a.slug === slug);
  if (!item) return { title: "Audio not found — Vega" };
  return { title: `${item.name} — Vega`, description: item.description };
}

export default async function AudioDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = audio.find((a) => a.slug === slug);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-280 px-7 py-10">
      <Link
        href="/audio"
        className="text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        ← All audio
      </Link>

      <header className="flex flex-col items-center gap-3 pt-10 pb-4 text-center">
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          {item.name}
        </h1>
        <p className="max-w-[46ch] text-lg text-muted">{item.tagline}</p>
      </header>

      <AudioFeatures item={item} />
      <AudioConfigurator item={item} />
    </div>
  );
}
