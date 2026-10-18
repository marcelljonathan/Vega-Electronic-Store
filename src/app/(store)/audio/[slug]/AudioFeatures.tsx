import type { Audio } from "@/lib/audio";
import AudioIcon from "../AudioIcon";

// "Why Vega Audio" — animated equalizer hero + feature grid. No client JS.
export default function AudioFeatures({ item }: { item: Audio }) {
  return (
    <section className="mt-16 flex flex-col gap-10 border-t border-line pt-14">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Why Vega Audio
        </span>
        <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          Made to disappear into the music.
        </h2>
      </div>

      {/* Sound hero — the signature animated equalizer */}
      <div className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-card p-8 sm:p-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Sound
          </span>
          <h3 className="text-balance text-2xl font-semibold sm:text-3xl">
            {item.sound.headline}
          </h3>
          <p className="leading-relaxed text-muted">{item.sound.body}</p>
        </div>

        <div className="flex justify-center">
          <div className="eq" role="img" aria-label="Animated equalizer">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {item.features.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-3 rounded-2xl border border-line p-6"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-line text-accent">
              <AudioIcon name={f.icon} />
            </span>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
