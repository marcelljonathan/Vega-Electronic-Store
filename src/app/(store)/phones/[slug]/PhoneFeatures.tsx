import type { Phone, PhoneFeatureIcon } from "@/lib/phones";

// The highest score in the lineup — the bar fills relative to this.
const MAX_ANTUTU = 2600000;

// "Why Vega [phone]" — performance hero (AnTuTu + battery) + feature grid.
// No client JS: the bar fill is a pure CSS animation.
export default function PhoneFeatures({ phone }: { phone: Phone }) {
  const fill = Math.min(phone.antutu / MAX_ANTUTU, 1);

  return (
    <section className="mt-16 flex flex-col gap-10 border-t border-line pt-14">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Why {phone.name}
        </span>
        <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          {phone.perf.headline}
        </h2>
      </div>

      {/* Performance hero — AnTuTu bar + battery stats */}
      <div className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-card p-8 sm:p-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Performance
          </span>
          <p className="leading-relaxed text-muted">{phone.perf.body}</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums">
              {phone.antutu.toLocaleString("en-US")}
            </span>
            <span className="text-sm text-muted">AnTuTu</span>
          </div>
          <div
            className="perf-bar"
            style={{ "--fill": fill } as React.CSSProperties}
            role="img"
            aria-label={`AnTuTu score ${phone.antutu.toLocaleString("en-US")}`}
          />
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-xs text-muted">Screen time</span>
              <span className="text-lg font-semibold">
                {phone.battery.screen}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Gaming</span>
              <span className="text-lg font-semibold">
                {phone.battery.gaming}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {phone.features.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-3 rounded-2xl border border-line p-6"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-line text-accent">
              <PhoneIcon name={f.icon} />
            </span>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Repetitive SVG icons (same pattern as WatchIcon) — safe to copy-paste.
function PhoneIcon({ name }: { name: PhoneFeatureIcon }) {
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

  if (name === "camera") {
    return (
      <svg {...common}>
        <path d="M3 9a2 2 0 0 1 2-2h1.5L8 5h8l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <circle cx="12" cy="13" r="3.2" />
      </svg>
    );
  }
  if (name === "display") {
    return (
      <svg {...common}>
        <rect x="6" y="2.5" width="12" height="19" rx="3" />
        <line x1="10" y1="18.5" x2="14" y2="18.5" />
      </svg>
    );
  }
  if (name === "charge") {
    return (
      <svg {...common}>
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
      </svg>
    );
  }
  // shield
  return (
    <svg {...common}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    </svg>
  );
}
