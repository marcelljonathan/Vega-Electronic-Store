import Link from "next/link";
import { phones } from "@/lib/phones";

// Shared frame for Sign in / Sign up: the form on the left, the glowing
// Vega Ember on the right (large screens only).
export default function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const ember = phones.find((p) => p.slug === "ember") ?? phones[0];

  return (
    <div className="mx-auto grid max-w-280 grid-cols-1 gap-12 px-7 py-12 sm:py-16 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="text-muted">{subtitle}</p>
        </div>
        {children}
        <p className="text-sm text-muted">{footer}</p>
      </div>

      <div className="relative hidden h-140 flex-col items-center justify-center gap-10 overflow-hidden rounded-3xl bg-card lg:flex">
        <div className="relative grid place-items-center">
          <div className="glow-layer" />
          <div
            className="device"
            data-size="card"
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
        <div className="flex flex-col items-center gap-1 text-center">
          <Link href="/" className="text-2xl font-medium tracking-tight">
            Made to <span className="text-accent">glow</span>.
          </Link>
          <p className="text-sm text-muted">Your cart and orders, on every device.</p>
        </div>
      </div>
    </div>
  );
}
