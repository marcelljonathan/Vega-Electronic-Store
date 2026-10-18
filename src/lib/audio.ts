// A Vega audio product — the shape of one product (configured by color only).
// The products themselves live in Supabase (table "products"), read through
// lib/catalog.ts and edited from the admin site. The original catalog is kept
// in supabase/005_products_seed.sql.

export type AudioIconName =
  | "sound"
  | "battery"
  | "water"
  | "mic"
  | "anc"
  | "spatial"
  | "charge"
  | "fit";

// "buds" or "headphone" picks which CSS placeholder to draw.
export type AudioShape = "buds" | "headphone";

export type Audio = {
  slug: string;
  name: string;
  tagline: string;
  price: number; // Rupiah
  available: boolean; // false = sold out
  description: string;
  shape: AudioShape;
  colors: { name: string; screenA: string; screenB: string; image?: string }[];
  keySpecs: { icon: AudioIconName; label: string; value: string }[];
  // Sound hero — headline + copy beside the animated equalizer.
  sound: { headline: string; body: string };
  // The "Why Vega Audio" usage features.
  features: { icon: AudioIconName; title: string; body: string }[];
  specGroups: { group: string; items: { label: string; value: string }[] }[];
};
