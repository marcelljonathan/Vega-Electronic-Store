// The Vega phone lineup — 4 families x 3 variants, the source of truth.

export type SpecIconName = "display" | "camera" | "battery" | "chip";

// Icons for feature cards
export type PhoneFeatureIcon = "camera" | "display" | "charge" | "shield";

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
  antutu: number; // AnTuTu score — drives the animated performance bar
  battery: { screen: string; gaming: string }; // hero battery stats
  perf: { headline: string; body: string }; // performance hero copy
  features: { icon: PhoneFeatureIcon; title: string; body: string }[];
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

// Shared per-family performance copy, battery stats, and feature cards.
// (AnTuTu scores differ per variant; everything here is shared per family.)
const sparkPerf = {
  headline: "Everyday speed, no fuss.",
  body: "The Vega S-series chip keeps scrolling, switching and shooting smooth — plenty of muscle for everything a normal day throws at it.",
};
const sparkBattery = { screen: "~2 days", gaming: "~7 hrs" };
const sparkFeatures = [
  {
    icon: "camera" as const,
    title: "Dual 48MP camera",
    body: "A 48MP main and ultra-wide capture bright, sharp shots in a single tap.",
  },
  {
    icon: "display" as const,
    title: '6.1" 90Hz OLED',
    body: "A crisp OLED with a smooth 90Hz refresh that feels quick under your thumb.",
  },
  {
    icon: "charge" as const,
    title: "33W fast charging",
    body: "A quick plug-in returns hours of use before you head out the door.",
  },
  {
    icon: "shield" as const,
    title: "Built to last",
    body: "A toughened glass front and sturdy frame stand up to everyday knocks.",
  },
];

const lumenPerf = {
  headline: "Power for the long day.",
  body: "A faster Vega chip and more memory glide through heavy multitasking and the occasional game without a stutter.",
};
const lumenBattery = { screen: "~2 days", gaming: "~8 hrs" };
const lumenFeatures = [
  {
    icon: "camera" as const,
    title: "Triple 50MP system",
    body: "A 50MP main with OIS and an ultra-wide for confident low-light and wide shots.",
  },
  {
    icon: "display" as const,
    title: '6.4" 120Hz OLED',
    body: "A larger, brighter OLED with a fluid 120Hz refresh for smoother scrolling.",
  },
  {
    icon: "charge" as const,
    title: "45W fast charging",
    body: "Around half a charge in 20 minutes, so a short break goes a long way.",
  },
  {
    icon: "shield" as const,
    title: "IP68 water resistance",
    body: "Sealed against dust and water, ready for rain, spills and the pool edge.",
  },
];

const emberPerf = {
  headline: "Flagship performance.",
  body: "The Vega E-series chip handles the heaviest games and pro workflows without breaking a sweat or throttling.",
};
const emberBattery = { screen: "~1.5 days", gaming: "~6 hrs" };
const emberFeatures = [
  {
    icon: "camera" as const,
    title: "50MP triple, sensor-shift OIS",
    body: "A pro camera system with telephoto zoom and sensor-shift stabilization.",
  },
  {
    icon: "display" as const,
    title: '6.7" LTPO 120Hz, 2,000 nits',
    body: "An adaptive LTPO panel that saves power at rest and hits 2,000 nits in sun.",
  },
  {
    icon: "charge" as const,
    title: "80W wired, 30W wireless",
    body: "0 to 50% in about 15 minutes, plus genuinely fast wireless charging.",
  },
  {
    icon: "shield" as const,
    title: "Reinforced frame",
    body: "A stiffened metal frame and toughened glass protect the pro hardware inside.",
  },
];

const haloPerf = {
  headline: "The peak of Vega.",
  body: "The H-series chip is the fastest silicon Vega makes — desktop-class power that never keeps you waiting.",
};
const haloBattery = { screen: "~1.5 days", gaming: "~6.5 hrs" };
const haloFeatures = [
  {
    icon: "camera" as const,
    title: "200MP with periscope zoom",
    body: "A 200MP main and periscope telephoto for pro-grade detail at any distance.",
  },
  {
    icon: "display" as const,
    title: '6.9" LTPO 144Hz, 2,500 nits',
    body: "The brightest, smoothest Vega display — 144Hz and a searing 2,500 nits.",
  },
  {
    icon: "charge" as const,
    title: "100W wired, 50W wireless",
    body: "A full charge in about 20 minutes, and the fastest wireless charging Vega offers.",
  },
  {
    icon: "shield" as const,
    title: "Titanium body, IP68",
    body: "An aerospace-grade titanium body, sealed to IP68 for total peace of mind.",
  },
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
    antutu: 620000,
    battery: sparkBattery,
    perf: sparkPerf,
    features: sparkFeatures,
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
    antutu: 710000,
    battery: sparkBattery,
    perf: sparkPerf,
    features: sparkFeatures,
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
    antutu: 850000,
    battery: sparkBattery,
    perf: sparkPerf,
    features: sparkFeatures,
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
    antutu: 950000,
    battery: lumenBattery,
    perf: lumenPerf,
    features: lumenFeatures,
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
    antutu: 1100000,
    battery: lumenBattery,
    perf: lumenPerf,
    features: lumenFeatures,
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
    antutu: 1250000,
    battery: lumenBattery,
    perf: lumenPerf,
    features: lumenFeatures,
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
    antutu: 1600000,
    battery: emberBattery,
    perf: emberPerf,
    features: emberFeatures,
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
    antutu: 1800000,
    battery: emberBattery,
    perf: emberPerf,
    features: emberFeatures,
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
    antutu: 2000000,
    battery: emberBattery,
    perf: emberPerf,
    features: emberFeatures,
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
    antutu: 2100000,
    battery: haloBattery,
    perf: haloPerf,
    features: haloFeatures,
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
    antutu: 2350000,
    battery: haloBattery,
    perf: haloPerf,
    features: haloFeatures,
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
    antutu: 2600000,
    battery: haloBattery,
    perf: haloPerf,
    features: haloFeatures,
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
