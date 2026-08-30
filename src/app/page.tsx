const features = [
  {
    num: "2,600",
    title: "nits of Ember display",
    sub: "6.7″ · 120Hz · readable in full sun",
  },
  {
    num: "50MP",
    title: "Triple camera system",
    sub: "Low-light photography, redefined",
  },
  {
    num: "22 min",
    title: "Full charge, two-day battery",
    sub: "From empty to 100% before you leave",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-280 px-7">
      <section className="grid justify-items-center gap-9 py-16 text-center">
        <div className="flex max-w-[36ch] flex-col items-center gap-4.5">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Introducing Ember
          </span>
          <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Made to <span className="text-accent">glow</span>.
          </h1>
          <p className="max-w-[42ch] text-lg leading-relaxed text-muted">
            Our brightest, sharpest display yet — engineered to come alive in
            your hand.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4.5">
            <button className="rounded-full bg-accent px-7.5 py-3.25 text-[0.95rem] font-semibold text-white">
              Buy from $899
            </button>
            <a className="cursor-pointer text-[0.95rem] font-semibold text-accent">
              Learn more →
            </a>
          </div>
        </div>
        <div className="relative grid w-full place-items-center py-6">
          <div className="glow-layer" />
          <div className="device">
            <div className="screen">
              <div className="glare" />
            </div>
            <div className="cam" />
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-2 rounded-[15px] border border-line bg-card p-6"
          >
            <span className="text-3xl font-extrabold tracking-tight text-accent">
              {f.num}
            </span>
            <span className="text-base font-semibold">{f.title}</span>
            <span className="text-sm text-muted">{f.sub}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
