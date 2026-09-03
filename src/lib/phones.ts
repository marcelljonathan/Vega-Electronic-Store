export type Phone = {
  slug: string;
  name: string;
  tier: string;
  tagline: string;
  price: number;
};

export const phones: Phone[] = [
  {
    slug: "spark",
    name: "Vega Spark",
    tier: "Entry",
    tagline: "The first light.",
    price: 499,
  },
  {
    slug: "lumen",
    name: "Vega Lumen",
    tier: "Core",
    tagline: "Everyday brilliance.",
    price: 699,
  },
  {
    slug: "ember",
    name: "Vega Ember",
    tier: "Pro",
    tagline: "Made to glow.",
    price: 899,
  },
  {
    slug: "halo",
    name: "Vega Halo",
    tier: "Ultra",
    tagline: "Radiance, perfected.",
    price: 1199,
  },
];
