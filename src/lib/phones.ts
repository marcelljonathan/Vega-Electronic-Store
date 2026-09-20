// The Vega phone lineup — 4 families x 3 variants, the source of truth.

export type SpecIconName = "display" | "camera" | "battery" | "chip";

export type Phone = {
  slug: string; // unique URL id, e.g. "spark-plus"
  family: string; // groups variants on the listing, e.g. "Spark"
  name: string; // "Vega Spark Plus"
  tier: string; // "Base" | "Plus" | "Pro"
  tagline: string;
  price: number; // base price (the lowest storage option)
  bestValue?: boolean; // shows the "Best value" badge
  description: string;
  colors: { name: string; screenA: string; screenB: string }[];
  storage: { size: string; ram: string; priceDelta: number }[];
  keySpecs: { icon: SpecIconName; label: string; value: string }[];
  specGroups: { group: string; items: { label: string; value: string }[] }[];
};

// Shared per-family colors.
const sparkColors = [
  { name: "Coral", screenA: "#ff8a5c", screenB: "#ffd9c0" },
  { name: "Mint", screenA: "#5fd0b0", screenB: "#c8f2e6" },
  { name: "Sky", screenA: "#6aa8ff", screenB: "#cfe2ff" },
];
const lumenColors = [
  { name: "Silver", screenA: "#b9c6da", screenB: "#eef3fa" },
  { name: "Graphite", screenA: "#8890a0", screenB: "#c9cfda" },
  { name: "Blue", screenA: "#6aa8ff", screenB: "#cfe2ff" },
];
const emberColors = [
  { name: "Azure", screenA: "#4f8bff", screenB: "#a9c6ff" },
  { name: "Ember", screenA: "#ff7a4d", screenB: "#ffcaa8" },
  { name: "Violet", screenA: "#9b7bff", screenB: "#d3c4ff" },
];
const haloColors = [
  { name: "Violet", screenA: "#9b7bff", screenB: "#d3c4ff" },
  { name: "Titanium", screenA: "#9aa0ab", screenB: "#d7dbe2" },
  { name: "Gold", screenA: "#e6c07a", screenB: "#f7e6c2" },
];

export const phones: Phone[] = [
  // ----- Spark family (entry) -----
  {
    slug: "spark",
    family: "Spark",
    name: "Vega Spark",
    tier: "Base",
    tagline: "The first light.",
    price: 249,
    description:
      "Vega's most approachable phone. A bright, dependable display and all-day battery in a light, colorful body.",
    colors: sparkColors,
    storage: [
      { size: "128GB", ram: "6GB", priceDelta: 0 },
      { size: "256GB", ram: "8GB", priceDelta: 50 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.1" OLED' },
      { icon: "camera", label: "Camera", value: "Dual 48MP" },
      { icon: "battery", label: "Battery", value: "4,200 mAh" },
      { icon: "chip", label: "Chip", value: "Vega S1" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.1" OLED' },
          { label: "Refresh rate", value: "90Hz" },
          { label: "Resolution", value: "2340 × 1080" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "48MP" },
          { label: "Ultra-wide", value: "8MP" },
          { label: "Front", value: "16MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega S1" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "4,200 mAh" },
          { label: "Charging", value: "33W wired" },
        ],
      },
    ],
  },
  {
    slug: "spark-plus",
    family: "Spark",
    name: "Vega Spark Plus",
    tier: "Plus",
    tagline: "More light, more life.",
    price: 329,
    bestValue: true,
    description:
      "The Spark, with room to spare — more storage and memory for a phone that keeps up with a busy day.",
    colors: sparkColors,
    storage: [
      { size: "256GB", ram: "8GB", priceDelta: 0 },
      { size: "512GB", ram: "8GB", priceDelta: 80 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.1" OLED' },
      { icon: "camera", label: "Camera", value: "Dual 48MP" },
      { icon: "battery", label: "Battery", value: "4,200 mAh" },
      { icon: "chip", label: "Chip", value: "Vega S1+" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.1" OLED' },
          { label: "Refresh rate", value: "90Hz" },
          { label: "Resolution", value: "2340 × 1080" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "48MP" },
          { label: "Ultra-wide", value: "8MP" },
          { label: "Front", value: "16MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega S1+" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "4,200 mAh" },
          { label: "Charging", value: "33W wired" },
        ],
      },
    ],
  },
  {
    slug: "spark-pro",
    family: "Spark",
    name: "Vega Spark Pro",
    tier: "Pro",
    tagline: "Spark, elevated.",
    price: 399,
    description:
      "The top Spark — a faster chip and a triple camera bring flagship touches to the entry line.",
    colors: sparkColors,
    storage: [
      { size: "256GB", ram: "8GB", priceDelta: 0 },
      { size: "512GB", ram: "8GB", priceDelta: 80 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.1" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP" },
      { icon: "battery", label: "Battery", value: "4,200 mAh" },
      { icon: "chip", label: "Chip", value: "Vega S2" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.1" OLED' },
          { label: "Refresh rate", value: "90Hz" },
          { label: "Resolution", value: "2340 × 1080" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Ultra-wide", value: "12MP" },
          { label: "Front", value: "20MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega S2" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "4,200 mAh" },
          { label: "Charging", value: "33W wired" },
        ],
      },
    ],
  },

  // ----- Lumen family (core) -----
  {
    slug: "lumen",
    family: "Lumen",
    name: "Vega Lumen",
    tier: "Base",
    tagline: "Everyday brilliance.",
    price: 449,
    description:
      "The everyday flagship. A brilliant 120Hz display and a fast chip, balanced for most people.",
    colors: lumenColors,
    storage: [
      { size: "128GB", ram: "8GB", priceDelta: 0 },
      { size: "256GB", ram: "8GB", priceDelta: 60 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.4" OLED' },
      { icon: "camera", label: "Camera", value: "Dual 50MP" },
      { icon: "battery", label: "Battery", value: "4,600 mAh" },
      { icon: "chip", label: "Chip", value: "Vega L1" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.4" OLED' },
          { label: "Refresh rate", value: "120Hz" },
          { label: "Resolution", value: "2400 × 1080" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Ultra-wide", value: "12MP" },
          { label: "Front", value: "20MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega L1" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "4,600 mAh" },
          { label: "Charging", value: "45W wired" },
        ],
      },
    ],
  },
  {
    slug: "lumen-plus",
    family: "Lumen",
    name: "Vega Lumen Plus",
    tier: "Plus",
    tagline: "Brilliance, extended.",
    price: 549,
    bestValue: true,
    description:
      "More storage and a sharper camera tune — the Lumen most people should buy.",
    colors: lumenColors,
    storage: [
      { size: "256GB", ram: "8GB", priceDelta: 0 },
      { size: "512GB", ram: "12GB", priceDelta: 100 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.4" OLED' },
      { icon: "camera", label: "Camera", value: "Dual 50MP" },
      { icon: "battery", label: "Battery", value: "4,600 mAh" },
      { icon: "chip", label: "Chip", value: "Vega L2" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.4" OLED' },
          { label: "Refresh rate", value: "120Hz" },
          { label: "Resolution", value: "2400 × 1080" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Ultra-wide", value: "12MP" },
          { label: "Front", value: "20MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega L2" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "4,600 mAh" },
          { label: "Charging", value: "45W wired" },
        ],
      },
    ],
  },
  {
    slug: "lumen-pro",
    family: "Lumen",
    name: "Vega Lumen Pro",
    tier: "Pro",
    tagline: "The bright standard, perfected.",
    price: 649,
    description:
      "A triple camera, more memory, and generous storage — the Lumen at its fullest.",
    colors: lumenColors,
    storage: [
      { size: "512GB", ram: "12GB", priceDelta: 0 },
      { size: "1TB", ram: "12GB", priceDelta: 150 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.4" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP" },
      { icon: "battery", label: "Battery", value: "4,600 mAh" },
      { icon: "chip", label: "Chip", value: "Vega L2+" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.4" OLED' },
          { label: "Refresh rate", value: "120Hz" },
          { label: "Resolution", value: "2400 × 1080" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Telephoto", value: "12MP" },
          { label: "Front", value: "24MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega L2+" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "4,600 mAh" },
          { label: "Charging", value: "45W wired" },
        ],
      },
    ],
  },

  // ----- Ember family (pro) -----
  {
    slug: "ember",
    family: "Ember",
    name: "Vega Ember",
    tier: "Base",
    tagline: "Made to glow.",
    price: 799,
    description:
      "Our brightest, sharpest display yet — engineered to come alive in your hand, with pro cameras.",
    colors: emberColors,
    storage: [
      { size: "256GB", ram: "8GB", priceDelta: 0 },
      { size: "512GB", ram: "12GB", priceDelta: 120 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.7" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP" },
      { icon: "battery", label: "Battery", value: "5,000 mAh" },
      { icon: "chip", label: "Chip", value: "Vega E2" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.7" LTPO OLED' },
          { label: "Refresh rate", value: "120Hz" },
          { label: "Resolution", value: "2796 × 1290" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Ultra-wide", value: "12MP" },
          { label: "Front", value: "24MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega E2" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "5,000 mAh" },
          { label: "Charging", value: "67W wired" },
        ],
      },
    ],
  },
  {
    slug: "ember-plus",
    family: "Ember",
    name: "Vega Ember Plus",
    tier: "Plus",
    tagline: "Glow, amplified.",
    price: 899,
    bestValue: true,
    description:
      "More memory for heavier days, plus the full Ember display and camera experience.",
    colors: emberColors,
    storage: [
      { size: "256GB", ram: "12GB", priceDelta: 0 },
      { size: "512GB", ram: "12GB", priceDelta: 100 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.7" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP" },
      { icon: "battery", label: "Battery", value: "5,000 mAh" },
      { icon: "chip", label: "Chip", value: "Vega E3" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.7" LTPO OLED' },
          { label: "Refresh rate", value: "120Hz" },
          { label: "Resolution", value: "2796 × 1290" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Ultra-wide", value: "12MP" },
          { label: "Front", value: "24MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega E3" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "5,000 mAh" },
          { label: "Charging", value: "67W wired" },
        ],
      },
    ],
  },
  {
    slug: "ember-pro",
    family: "Ember",
    name: "Vega Ember Pro",
    tier: "Pro",
    tagline: "The pro that glows brightest.",
    price: 1099,
    description:
      "A telephoto camera, more storage, and the fastest Ember chip — pro photography, redefined.",
    colors: emberColors,
    storage: [
      { size: "512GB", ram: "12GB", priceDelta: 0 },
      { size: "1TB", ram: "16GB", priceDelta: 200 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.7" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP + Tele" },
      { icon: "battery", label: "Battery", value: "5,000 mAh" },
      { icon: "chip", label: "Chip", value: "Vega E3 Pro" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.7" LTPO OLED' },
          { label: "Refresh rate", value: "120Hz" },
          { label: "Resolution", value: "2796 × 1290" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Telephoto", value: "50MP" },
          { label: "Front", value: "24MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega E3 Pro" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "5,000 mAh" },
          { label: "Charging", value: "67W wired, 30W wireless" },
        ],
      },
    ],
  },

  // ----- Halo family (ultra) -----
  {
    slug: "halo",
    family: "Halo",
    name: "Vega Halo",
    tier: "Base",
    tagline: "Radiance, perfected.",
    price: 1099,
    description:
      "The most advanced Vega display and camera system in a titanium body — light, perfected.",
    colors: haloColors,
    storage: [
      { size: "256GB", ram: "12GB", priceDelta: 0 },
      { size: "512GB", ram: "16GB", priceDelta: 150 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.9" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP" },
      { icon: "battery", label: "Battery", value: "5,400 mAh" },
      { icon: "chip", label: "Chip", value: "Vega H3" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.9" LTPO OLED' },
          { label: "Refresh rate", value: "144Hz" },
          { label: "Resolution", value: "3200 × 1440" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Ultra-wide", value: "48MP" },
          { label: "Front", value: "24MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega H3" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "5,400 mAh" },
          { label: "Charging", value: "90W wired, 50W wireless" },
        ],
      },
    ],
  },
  {
    slug: "halo-plus",
    family: "Halo",
    name: "Vega Halo Plus",
    tier: "Plus",
    tagline: "Radiance, without limits.",
    price: 1299,
    bestValue: true,
    description:
      "More storage and 16GB of memory for the most demanding days — the Halo, unleashed.",
    colors: haloColors,
    storage: [
      { size: "512GB", ram: "16GB", priceDelta: 0 },
      { size: "1TB", ram: "16GB", priceDelta: 200 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.9" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP" },
      { icon: "battery", label: "Battery", value: "5,400 mAh" },
      { icon: "chip", label: "Chip", value: "Vega H4" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.9" LTPO OLED' },
          { label: "Refresh rate", value: "144Hz" },
          { label: "Resolution", value: "3200 × 1440" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Ultra-wide", value: "48MP" },
          { label: "Front", value: "24MP" },
        ],
      },
      { group: "Performance", items: [{ label: "Chip", value: "Vega H4" }] },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "5,400 mAh" },
          { label: "Charging", value: "90W wired, 50W wireless" },
        ],
      },
    ],
  },
  {
    slug: "halo-pro",
    family: "Halo",
    name: "Vega Halo Pro",
    tier: "Pro",
    tagline: "The pinnacle of Vega.",
    price: 1499,
    description:
      "1TB of storage, a telephoto camera, and the fastest Vega chip ever. Nothing sits above it.",
    colors: haloColors,
    storage: [
      { size: "1TB", ram: "16GB", priceDelta: 0 },
      { size: "2TB", ram: "16GB", priceDelta: 300 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.9" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP + Tele" },
      { icon: "battery", label: "Battery", value: "5,400 mAh" },
      { icon: "chip", label: "Chip", value: "Vega H4 Ultra" },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Size", value: '6.9" LTPO OLED' },
          { label: "Refresh rate", value: "144Hz" },
          { label: "Resolution", value: "3200 × 1440" },
        ],
      },
      {
        group: "Camera",
        items: [
          { label: "Main", value: "50MP" },
          { label: "Telephoto", value: "50MP" },
          { label: "Front", value: "24MP" },
        ],
      },
      {
        group: "Performance",
        items: [{ label: "Chip", value: "Vega H4 Ultra" }],
      },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "5,400 mAh" },
          { label: "Charging", value: "90W wired, 50W wireless" },
        ],
      },
    ],
  },
];
