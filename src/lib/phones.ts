// A Vega phone — the shape of one product (4 families x 3 tiers today).
// The products themselves live in Supabase (table "products"), read through
// lib/catalog.ts and edited from the admin site. The original catalog is kept
// in supabase/005_products_seed.sql.

export const specIconNames = ["display", "camera", "battery", "chip"] as const;
export type SpecIconName = (typeof specIconNames)[number];

// Icons for feature cards
export const phoneFeatureIcons = ["camera", "display", "charge", "shield"] as const;
export type PhoneFeatureIcon = (typeof phoneFeatureIcons)[number];

export type Phone = {
  slug: string; // unique URL id, e.g. "spark-plus"
  family: string; // groups variants on the listing, e.g. "Spark"
  name: string; // "Vega Spark Plus"
  tier: string; // "Base" | "Plus" | "Pro"
  tagline: string;
  price: number; // base price in Rupiah (the lowest storage option)
  available: boolean; // false = sold out
  bestValue?: boolean; // shows the "Best value" badge
  description: string;
  colors: { name: string; screenA: string; screenB: string; image?: string }[];
  storage: { size: string; ram: string; priceDelta: number }[];
  keySpecs: { icon: SpecIconName; label: string; value: string }[];
  antutu: number; // AnTuTu score — drives the animated performance bar
  battery: { screen: string; gaming: string }; // hero battery stats
  perf: { headline: string; body: string }; // performance hero copy
  features: { icon: PhoneFeatureIcon; title: string; body: string }[];
  specGroups: { group: string; items: { label: string; value: string }[] }[];
};
