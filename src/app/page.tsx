import Link from "next/link";
import { phones } from "@/lib/phones";
import { watches } from "@/lib/watches";
import { audio } from "@/lib/audio";
import AudioArt from "./audio/AudioArt";

// The hero features the base Vega Ember. Every price and stat on this page
// is read from the catalog files, so the homepage can't drift out of date.
function getEmber() {
  const phone = phones.find((p) => p.slug === "ember");
  if (!phone) throw new Error('Homepage hero: phone "ember" not found in phones.ts');
  return phone;
}

const fromPrice = (items: { price: number }[]) =>
  Math.min(...items.map((i) => i.price));

const lineup = [
  {
    href: "/phones",
    label: "Phones",
    line: "Four families, from everyday to extraordinary.",
    from: fromPrice(phones),
    art: "phone",
  },
  {
    href: "/watch",
    label: "Watch",
    line: "Health, fitness and time, right on your wrist.",
    from: fromPrice(watches),
    art: "watch",
  },
  {
    href: "/audio",
    label: "Audio",
    line: "Earbuds and headphones, tuned by Vega.",
    from: fromPrice(audio),
    art: "audio",
  },
] as const;

const promises = [
  {
    icon: "shipping",
    title: "Free shipping",
    body: "On every order — arriving in 3–5 business days.",
  },
  {
    icon: "returns",
    title: "30-day returns",
    body: "Changed your mind? Send it back for a full refund.",
  },
  {
    icon: "warranty",
    title: "1-year warranty",
    body: "Every product is covered against manufacturing defects.",
  },
] as const;

export default function Home() {
  const ember = getEmber();
  const display = ember.keySpecs.find((s) => s.icon === "display");
  const displayFeature = ember.features.find((f) => f.icon === "display");

  const stats = [
    {
      num: ember.antutu.toLocaleString("en-US"),
      title: "AnTuTu score",
      sub: ember.perf.headline,
    },
    {
      num: ember.battery.screen,
      title: "Battery life",
      sub: `${ember.battery.gaming} of gaming on a single charge`,
    },
    {
      num: display?.value ?? "",
      title: "Display",
      sub: displayFeature?.body ?? "",
    },
  ];

  return (
    <div className="mx-auto max-w-280 px-7">
      {/* Hero — Vega Ember */}
      <section className="grid justify-items-center gap-9 py-16 text-center">
        <div className="flex max-w-[36ch] flex-col items-center gap-4.5">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Introducing {ember.family}
          </span>
          <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Made to <span className="text-accent">glow</span>.
          </h1>
          <p className="max-w-[42ch] text-lg leading-relaxed text-muted">
            {ember.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4.5">
            {/* Buy jumps straight to the configurator; Learn more opens the story */}
            <Link
              href={`/phones/${ember.slug}#configure`}
              className="rounded-full bg-accent px-7.5 py-3.25 text-[0.95rem] font-semibold text-white"
            >
              Buy from ${ember.price.toLocaleString("en-US")}
            </Link>
            <Link
              href={`/phones/${ember.slug}`}
              className="text-[0.95rem] font-semibold text-accent"
            >
              Learn more →
            </Link>
          </div>
        </div>
        <div className="relative grid w-full place-items-center py-6">
          <div className="glow-layer" />
          <div
            className="device"
            style={
              {
                "--screen-a": ember.colors[0].screenA,
                "--screen-b": ember.colors[0].screenB,
              } as React.CSSProperties
            }
          >
            <div className="screen">
              <div className="glare" />
            </div>
            <div className="cam" />
          </div>
        </div>
      </section>

      {/* Ember stats */}
      <section className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.title}
            className="flex flex-col gap-2 rounded-[15px] border border-line bg-card p-6"
          >
            <span className="text-3xl font-extrabold tracking-tight text-accent">
              {s.num}
            </span>
            <span className="text-base font-semibold">{s.title}</span>
            <span className="text-sm text-muted">{s.sub}</span>
          </div>
        ))}
      </section>

      {/* Explore the lineup */}
      <section className="mt-16 flex flex-col gap-10 border-t border-line pt-14">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            The lineup
          </span>
          <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">
            Something to glow about, everywhere.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {lineup.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex flex-col items-center gap-5 rounded-3xl bg-card p-6 text-center transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"
            >
              <div className="relative grid h-88 w-full place-items-center">
                <div className="glow-layer" />
                <LineupArt art={c.art} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-semibold">{c.label}</h3>
                <p className="text-sm text-muted">{c.line}</p>
              </div>
              <span className="text-sm font-semibold text-accent">
                From ${c.from.toLocaleString("en-US")} · Shop →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop with confidence */}
      <section className="mt-16 flex flex-col gap-8 rounded-3xl border border-line p-8 sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-balance text-2xl font-medium tracking-tight sm:text-3xl">
            Shop with confidence.
          </h2>
          <Link href="/support" className="text-sm font-semibold text-accent">
            Our support policies →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {promises.map((p) => (
            <div key={p.title} className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-accent">
                <PromiseIcon name={p.icon} />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Card-size placeholder art for each lineup tile.
function LineupArt({ art }: { art: "phone" | "watch" | "audio" }) {
  if (art === "phone") {
    return (
      <div className="device" data-size="card" data-color="halo">
        <div className="screen">
          <div className="glare" />
        </div>
        <div className="cam" />
      </div>
    );
  }
  if (art === "watch") {
    return (
      <div
        className="watch"
        data-size="card"
        style={
          { "--band-a": "#b6e34d", "--band-b": "#e6f7b0" } as React.CSSProperties
        }
      >
        <div className="band" />
        <div className="case">
          <div className="face" />
        </div>
        <div className="crown" />
      </div>
    );
  }
  return <AudioArt shape="buds" size="card" a="#ff8a5c" b="#ffd9c0" />;
}

function PromiseIcon({ name }: { name: "shipping" | "returns" | "warranty" }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "shipping") {
    return (
      <svg {...common}>
        <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
        <path d="M3 8l9 5 9-5" />
        <path d="M12 13v8" />
      </svg>
    );
  }
  if (name === "returns") {
    return (
      <svg {...common}>
        <path d="M9 14L4 9l5-5" />
        <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
      </svg>
    );
  }
  // warranty
  return (
    <svg {...common}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9.3 12l1.9 1.9L15 10.2" />
    </svg>
  );
}
