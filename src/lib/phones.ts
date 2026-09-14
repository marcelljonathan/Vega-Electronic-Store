export type SpecIconName = "display" | "camera" | "battery" | "chip";

export type Phone = {
  slug: string;
  name: string;
  tier: string;
  tagline: string;
  price: number;
  description: string;
  colors: { name: string; screenA: string; screenB: string }[];
  storage: { size: string; ram: string; priceDelta: number }[];
  keySpecs: { icon: SpecIconName; label: string; value: string }[];
  specGroups: { group: string; items: { label: string; value: string }[] }[];
};

export const phones: Phone[] = [
  {
    slug: "spark",
    name: "Vega Spark",
    tier: "Entry",
    tagline: "The first light.",
    price: 499,
    description:
      "Vega's most approachable phone, tuned for everyone. A bright, dependable display and all-day battery in a light, colorful body.",
    colors: [
      { name: "Coral", screenA: "#ff8a5c", screenB: "#ffd9c0" },
      { name: "Mint", screenA: "#5fd0b0", screenB: "#c8f2e6" },
      { name: "Sky", screenA: "#6aa8ff", screenB: "#cfe2ff" },
    ],
    storage: [
      { size: "64GB", ram: "6GB", priceDelta: 0 },
      { size: "128GB", ram: "6GB", priceDelta: 40 },
      { size: "256GB", ram: "8GB", priceDelta: 80 },
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
          { label: "Ultra-wide", value: "12MP" },
          { label: "Front", value: "16MP" },
        ],
      },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "4,200 mAh" },
          { label: "Charging", value: "33W wired" },
        ],
      },
      {
        group: "Design",
        items: [
          { label: "Weight", value: "189 g" },
          { label: "Build", value: "Aluminium & glass" },
          { label: "Water resistance", value: "IP54" },
        ],
      },
    ],
  },
  {
    slug: "lumen",
    name: "Vega Lumen",
    tier: "Core",
    tagline: "Everyday brilliance.",
    price: 699,
    description:
      "The everyday flagship. A brilliant display, a fast chip, and a camera that keeps up with your day — balanced for most people.",
    colors: [
      { name: "Silver", screenA: "#b9c6da", screenB: "#eef3fa" },
      { name: "Graphite", screenA: "#8890a0", screenB: "#c9cfda" },
      { name: "Blue", screenA: "#6aa8ff", screenB: "#cfe2ff" },
    ],
    storage: [
      { size: "128GB", ram: "8GB", priceDelta: 0 },
      { size: "256GB", ram: "8GB", priceDelta: 70 },
      { size: "512GB", ram: "12GB", priceDelta: 140 },
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
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "4,600 mAh" },
          { label: "Charging", value: "45W wired" },
        ],
      },
      {
        group: "Design",
        items: [
          { label: "Weight", value: "196 g" },
          { label: "Build", value: "Aluminium & glass" },
          { label: "Water resistance", value: "IP67" },
        ],
      },
    ],
  },
  {
    slug: "ember",
    name: "Vega Ember",
    tier: "Pro",
    tagline: "Made to glow.",
    price: 899,
    description:
      "Our brightest, sharpest display yet — engineered to come alive in your hand. Pro cameras and a chip built for more.",
    colors: [
      { name: "Azure", screenA: "#4f8bff", screenB: "#a9c6ff" },
      { name: "Ember", screenA: "#ff7a4d", screenB: "#ffcaa8" },
      { name: "Violet", screenA: "#9b7bff", screenB: "#d3c4ff" },
    ],
    storage: [
      { size: "128GB", ram: "8GB", priceDelta: 0 },
      { size: "256GB", ram: "12GB", priceDelta: 100 },
      { size: "512GB", ram: "12GB", priceDelta: 200 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.7" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP" },
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
          { label: "Telephoto", value: "12MP" },
          { label: "Front", value: "24MP" },
        ],
      },
      {
        group: "Battery",
        items: [
          { label: "Capacity", value: "5,000 mAh" },
          { label: "Charging", value: "67W wired, 30W wireless" },
        ],
      },
      {
        group: "Design",
        items: [
          { label: "Weight", value: "201 g" },
          { label: "Build", value: "Aluminium & glass" },
          { label: "Water resistance", value: "IP68" },
        ],
      },
    ],
  },
  {
    slug: "halo",
    name: "Vega Halo",
    tier: "Ultra",
    tagline: "Radiance, perfected.",
    price: 1199,
    description:
      "The pinnacle. A radiant display, the most advanced Vega camera system, and titanium craft — light, perfected.",
    colors: [
      { name: "Violet", screenA: "#9b7bff", screenB: "#d3c4ff" },
      { name: "Titanium", screenA: "#9aa0ab", screenB: "#d7dbe2" },
      { name: "Gold", screenA: "#e6c07a", screenB: "#f7e6c2" },
    ],
    storage: [
      { size: "256GB", ram: "12GB", priceDelta: 0 },
      { size: "512GB", ram: "16GB", priceDelta: 150 },
      { size: "1TB", ram: "16GB", priceDelta: 300 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '6.9" OLED' },
      { icon: "camera", label: "Camera", value: "Triple 50MP" },
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
        group: "Battery",
        items: [
          { label: "Capacity", value: "5,400 mAh" },
          { label: "Charging", value: "90W wired, 50W wireless" },
        ],
      },
      {
        group: "Design",
        items: [
          { label: "Weight", value: "221 g" },
          { label: "Build", value: "Titanium & glass" },
          { label: "Water resistance", value: "IP68" },
        ],
      },
    ],
  },
];
