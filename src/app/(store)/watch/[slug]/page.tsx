import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWatches, getWatch } from "@/lib/catalog";
import WatchConfigurator from "./WatchConfigurator";
import WatchFeatures from "./WatchFeatures";

export async function generateStaticParams() {
  return (await getWatches()).map((watch) => ({ slug: watch.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const watch = await getWatch(slug);
  if (!watch) return { title: "Watch not found — Vega" };
  return { title: `${watch.name} — Vega`, description: watch.description };
}

export default async function WatchDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const watch = await getWatch(slug);
  if (!watch) notFound();

  return (
    <div className="mx-auto max-w-280 px-7 py-10">
      <Link
        href="/watch"
        className="text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        ← All watches
      </Link>

      <header className="flex flex-col items-center gap-3 pt-10 pb-4 text-center">
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          {watch.name}
        </h1>
        <p className="max-w-[46ch] text-lg text-muted">{watch.tagline}</p>
      </header>

      <WatchFeatures watch={watch} />
      <WatchConfigurator watch={watch} />
    </div>
  );
}
