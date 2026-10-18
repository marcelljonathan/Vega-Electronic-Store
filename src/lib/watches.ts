// A Vega watch — the shape of one product (configured by band + case size).
// The products themselves live in Supabase (table "products"), read through
// lib/catalog.ts and edited from the admin site. The original catalog is kept
// in supabase/005_products_seed.sql.

export const watchIconNames = ["display", "battery", "health", "water"] as const;
export type WatchIconName = (typeof watchIconNames)[number];

// Icon names for the "Why Vega Watch" feature cards.
export const watchFeatureIcons = [
  "sleep",
  "safety",
  "everyday",
  "battery",
  "ecg",
  "gps",
  "activity",
  "recovery",
  "water",
] as const;
export type WatchFeatureIcon = (typeof watchFeatureIcons)[number];

export type Watch = {
  slug: string;
  name: string;
  tagline: string;
  price: number; // base price in Rupiah (smallest size)
  available: boolean; // false = sold out
  description: string;
  bands: { name: string; bandA: string; bandB: string; image?: string }[];
  sizes: { label: string; priceDelta: number }[];
  keySpecs: { icon: WatchIconName; label: string; value: string }[];
  // Heart hero — animated pulse line + heading.
  pulse: { bpm: number; headline: string; body: string };
  // The "Why Vega Watch" usage features.
  features: { icon: WatchFeatureIcon; title: string; body: string }[];
  specGroups: { group: string; items: { label: string; value: string }[] }[];
};
