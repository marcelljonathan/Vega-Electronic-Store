import type { Metadata } from "next";
import HelpCenter from "./HelpCenter";
import { Suspense } from "react";
import ContactForm from "./ContactForm";
import { getPhones, getWatches, getAudio } from "@/lib/catalog";
import { supportContact } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Support — Vega",
  description: "Answers, policies and ways to reach the Vega support team.",
};

type SupportIconName =
  | "warranty"
  | "repair"
  | "shipping"
  | "email"
  | "phone"
  | "chat";

const policies = [
  {
    id: "warranty",
    icon: "warranty",
    title: "1-year warranty",
    body: "Every Vega product is covered for a full year against manufacturing defects, at no extra cost.",
  },
  {
    id: "repairs",
    icon: "repair",
    title: "Easy repairs",
    body: "Something broken? Tell us what happened and we'll arrange the pickup, the repair and the trip back — usually within 5 business days.",
  },
  {
    id: "shipping",
    icon: "shipping",
    title: "Free shipping & 30-day returns",
    body: "Every order ships free, and you have 30 days from delivery to return anything for a full refund.",
  },
] as const;

const contacts = [
  { icon: "email", label: "Email", value: supportContact.email, note: "Replies within 24 hours" },
  { icon: "phone", label: "Phone", value: supportContact.phone, note: supportContact.hours },
  { icon: "chat", label: "Live chat", value: "Coming soon", note: "An AI shopping assistant, on every page" },
] as const;

export default async function SupportPage() {
  const [phones, watches, audio] = await Promise.all([
    getPhones(),
    getWatches(),
    getAudio(),
  ]);
  const productGroups = [
    { label: "Phones", names: phones.map((p) => p.name) },
    { label: "Watch", names: watches.map((w) => w.name) },
    { label: "Audio", names: audio.map((a) => a.name) },
  ];

  return (
    <div className="mx-auto max-w-280 px-7 py-16">
      <HelpCenter />

      {/* Policies */}
      <section className="mt-16 flex flex-col gap-8 border-t border-line pt-14">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Our promise
          </span>
          <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">
            Covered from day one.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {policies.map((p) => (
            <div
              key={p.id}
              id={p.id}
              className="flex scroll-mt-24 flex-col gap-3 rounded-2xl bg-card p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-line text-accent">
                <SupportIcon name={p.icon} />
              </span>
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mt-16 grid scroll-mt-24 grid-cols-1 gap-12 border-t border-line pt-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
              Contact
            </span>
            <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">
              Still need help?
            </h2>
            <p className="leading-relaxed text-muted">
              Send us a message and a real person will reply in your account —
              every day of the week.
            </p>
          </div>
          <ul className="flex flex-col gap-5">
            {contacts.map((c) => (
              <li key={c.label} className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-accent">
                  <SupportIcon name={c.icon} />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-muted">{c.label}</span>
                  <span className="text-sm font-semibold">{c.value}</span>
                  <span className="text-xs text-muted">{c.note}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Suspense fallback={<div className="min-h-80 rounded-3xl bg-card" />}>
          <ContactForm productGroups={productGroups} />
        </Suspense>
      </section>
    </div>
  );
}

function SupportIcon({ name }: { name: SupportIconName }) {
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

  if (name === "warranty") {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="M9.3 12l1.9 1.9L15 10.2" />
      </svg>
    );
  }
  if (name === "repair") {
    return (
      <svg {...common}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.4 2.4-2.1-.6-.6-2.1z" />
      </svg>
    );
  }
  if (name === "shipping") {
    return (
      <svg {...common}>
        <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
        <path d="M3 8l9 5 9-5" />
        <path d="M12 13v8" />
      </svg>
    );
  }
  if (name === "email") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M4 7l8 6 8-6" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
    );
  }
  // chat
  return (
    <svg {...common}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    </svg>
  );
}
