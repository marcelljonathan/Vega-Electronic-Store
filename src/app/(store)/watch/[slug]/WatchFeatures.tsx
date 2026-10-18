import type { Watch, WatchFeatureIcon } from "@/lib/watches";

// "Why Vega Watch" — animated heart hero + feature grid. No client JS.
export default function WatchFeatures({ watch }: { watch: Watch }) {
  return (
    <section className="mt-16 flex flex-col gap-10 border-t border-line pt-14">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Why Vega Watch
        </span>
        <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          More than a clock on your wrist.
        </h2>
      </div>

      {/* Heart hero — the signature animated pulse line */}
      <div className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-card p-8 sm:p-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Heart
          </span>
          <h3 className="text-balance text-2xl font-semibold sm:text-3xl">
            {watch.pulse.headline}
          </h3>
          <p className="leading-relaxed text-muted">{watch.pulse.body}</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <svg
            className="pulse-svg"
            viewBox="0 0 300 80"
            role="img"
            aria-label="Animated heart-rate line"
          >
            <path
              className="pulse-base"
              pathLength={300}
              d="M0 40 H108 L118 40 L126 22 L134 58 L142 12 L150 54 L158 40 H300"
            />
            <path
              className="pulse-beam"
              pathLength={300}
              d="M0 40 H108 L118 40 L126 22 L134 58 L142 12 L150 54 L158 40 H300"
            />
          </svg>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums">
              {watch.pulse.bpm}
            </span>
            <span className="text-sm text-muted">BPM</span>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {watch.features.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-3 rounded-2xl border border-line p-6"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-line text-accent">
              <FeatureIcon name={f.icon} />
            </span>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureIcon({ name }: { name: WatchFeatureIcon }) {
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

  if (name === "sleep") {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (name === "safety") {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="M9.3 12l1.9 1.9L15 10.2" />
      </svg>
    );
  }
  if (name === "everyday") {
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
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
  if (name === "ecg") {
    return (
      <svg {...common}>
        <path d="M2 12h4l2-5 3 10 2-5h9" />
      </svg>
    );
  }
  if (name === "gps") {
    return (
      <svg {...common}>
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  if (name === "activity") {
    return (
      <svg {...common}>
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
      </svg>
    );
  }
  if (name === "recovery") {
    return (
      <svg {...common}>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </svg>
    );
  }
  // water
  return (
    <svg {...common}>
      <path d="M12 3.2s6 6.4 6 10.8a6 6 0 0 1-12 0c0-4.4 6-10.8 6-10.8z" />
    </svg>
  );
}
