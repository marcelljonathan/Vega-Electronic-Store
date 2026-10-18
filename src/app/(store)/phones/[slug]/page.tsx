import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { phones } from "@/lib/phones";
import PhoneConfigurator from "./PhoneConfigurator";
import PhoneFeatures from "./PhoneFeatures";

export function generateStaticParams() {
  return phones.map((phone) => ({ slug: phone.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const phone = phones.find((p) => p.slug === slug);
  if (!phone) return { title: "Phone not found — Vega" };
  return { title: `${phone.name} — Vega`, description: phone.description };
}

export default async function PhoneDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const phone = phones.find((p) => p.slug === slug);
  if (!phone) notFound();

  return (
    <div className="mx-auto max-w-280 px-7 py-10">
      <Link
        href="/phones"
        className="text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        ← All phones
      </Link>
  
      <header className="flex flex-col items-center gap-3 pt-10 pb-4 text-center">
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          {phone.name}
        </h1>
        <p className="max-w-[46ch] text-lg text-muted">{phone.tagline}</p>
      </header>

      <PhoneFeatures phone={phone} />
      <PhoneConfigurator phone={phone} />

    </div>
  );
}
