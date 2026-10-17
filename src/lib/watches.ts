// The Vega watch lineup — 3 models, each configurable by band + case size.

export type WatchIconName = "display" | "battery" | "health" | "water";

// Icon names for the "Why Vega Watch" feature cards.
export type WatchFeatureIcon =
  | "sleep"
  | "safety"
  | "everyday"
  | "battery"
  | "ecg"
  | "gps"
  | "activity"
  | "recovery"
  | "water";

export type Watch = {
  slug: string;
  name: string;
  tagline: string;
  price: number; // base price (smallest size)
  description: string;
  bands: { name: string; bandA: string; bandB: string }[];
  sizes: { label: string; priceDelta: number }[];
  keySpecs: { icon: WatchIconName; label: string; value: string }[];
  // Heart hero — animated pulse line + heading.
  pulse: { bpm: number; headline: string; body: string };
  // The "Why Vega Watch" usage features.
  features: { icon: WatchFeatureIcon; title: string; body: string }[];
  specGroups: { group: string; items: { label: string; value: string }[] }[];
};

export const watches: Watch[] = [
  {
    slug: "pulse",
    name: "Vega Pulse",
    tagline: "Your day, on your wrist.",
    price: 1_799_000,
    description:
      "The essential Vega watch — a bright always-on display, full health tracking, and multi-day battery in a light aluminium body.",
    bands: [
      { name: "Midnight", bandA: "#2b2f3a", bandB: "#4a4f5e" },
      { name: "Coral", bandA: "#ff8a5c", bandB: "#ffd9c0" },
      { name: "Sky", bandA: "#6aa8ff", bandB: "#cfe2ff" },
    ],
    sizes: [
      { label: "41mm", priceDelta: 0 },
      { label: "45mm", priceDelta: 500_000 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '1.4" AMOLED' },
      { icon: "battery", label: "Battery", value: "3 days" },
      { icon: "health", label: "Health", value: "HR + SpO₂" },
      { icon: "water", label: "Water", value: "5 ATM" },
    ],
    pulse: {
      bpm: 72,
      headline: "Your heart, checked around the clock.",
      body: "Vega Pulse reads your heart rate 24/7 and taps your wrist if it climbs too high or drops too low while you rest — with an on-demand blood-oxygen check whenever you want one.",
    },
    features: [
      {
        icon: "sleep",
        title: "Sleep worth waking up to",
        body: "See your time in light, deep and REM each night, and a simple score that tells you how well you actually recovered.",
      },
      {
        icon: "safety",
        title: "Help is one tap away",
        body: "Hold the crown to call Emergency SOS and share your live location with your contacts — wherever you are.",
      },
      {
        icon: "everyday",
        title: "Your day, glanceable",
        body: "Calls, messages and reminders land on your wrist, so your phone can stay in your pocket.",
      },
      {
        icon: "battery",
        title: "Days, not hours",
        body: "Up to 3 days on a charge, and a quick morning top-up carries you through a full night of sleep tracking.",
      },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Type", value: '1.4" AMOLED' },
          { label: "Always-on", value: "Yes" },
          { label: "Brightness", value: "1,000 nits" },
        ],
      },
      {
        group: "Health",
        items: [
          { label: "Heart rate", value: "24/7" },
          { label: "Blood oxygen", value: "SpO₂" },
          { label: "Sleep", value: "Stages + score" },
        ],
      },
      {
        group: "Battery",
        items: [
          { label: "Life", value: "Up to 3 days" },
          { label: "Charging", value: "Magnetic, fast" },
        ],
      },
      {
        group: "Durability",
        items: [
          { label: "Case", value: "Aluminium" },
          { label: "Water resistance", value: "5 ATM" },
        ],
      },
    ],
  },
  {
    slug: "pulse-pro",
    name: "Vega Pulse Pro",
    tagline: "The pinnacle, on your wrist.",
    price: 3_599_000,
    description:
      "A titanium body, a brighter LTPO display, ECG and advanced sensors, and the longest battery in the line.",
    bands: [
      { name: "Titanium", bandA: "#9aa0ab", bandB: "#d7dbe2" },
      { name: "Graphite", bandA: "#3a3d45", bandB: "#5a5e68" },
      { name: "Gold", bandA: "#e6c07a", bandB: "#f7e6c2" },
    ],
    sizes: [
      { label: "45mm", priceDelta: 0 },
      { label: "49mm", priceDelta: 900_000 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '1.5" LTPO' },
      { icon: "battery", label: "Battery", value: "5 days" },
      { icon: "health", label: "Health", value: "ECG + HR" },
      { icon: "water", label: "Water", value: "10 ATM" },
    ],
    pulse: {
      bpm: 68,
      headline: "A clinic-grade read of your heart.",
      body: "Beyond 24/7 heart rate, Pulse Pro records an ECG right from your wrist in 30 seconds and flags irregular rhythms — the deepest heart insight Vega offers.",
    },
    features: [
      {
        icon: "ecg",
        title: "Take an ECG anywhere",
        body: "Rest a finger on the crown for 30 seconds to record your heart's rhythm and check for signs of AFib.",
      },
      {
        icon: "sleep",
        title: "Sleep, fully understood",
        body: "Stages, a nightly score and overnight blood-oxygen trends, so a restless night never goes unexplained.",
      },
      {
        icon: "safety",
        title: "Safety, built in",
        body: "Fall detection, crash detection and Emergency SOS look out for you automatically, no tap required.",
      },
      {
        icon: "battery",
        title: "Five days of titanium",
        body: "The longest battery in the line, wrapped in a body milled from aerospace-grade titanium.",
      },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Type", value: '1.5" LTPO AMOLED' },
          { label: "Always-on", value: "Yes" },
          { label: "Brightness", value: "2,000 nits" },
        ],
      },
      {
        group: "Health",
        items: [
          { label: "Heart rate", value: "24/7" },
          { label: "ECG", value: "Yes" },
          { label: "Blood oxygen", value: "SpO₂" },
          { label: "Sleep", value: "Stages + score" },
        ],
      },
      {
        group: "Battery",
        items: [
          { label: "Life", value: "Up to 5 days" },
          { label: "Charging", value: "Magnetic, fast" },
        ],
      },
      {
        group: "Durability",
        items: [
          { label: "Case", value: "Titanium" },
          { label: "Water resistance", value: "10 ATM" },
        ],
      },
    ],
  },
  {
    slug: "move",
    name: "Vega Move",
    tagline: "Built to go the distance.",
    price: 2_499_000,
    description:
      "The sport watch — dual-band GPS, a rugged reinforced body, and training metrics for every workout.",
    bands: [
      { name: "Volt", bandA: "#b6e34d", bandB: "#e6f7b0" },
      { name: "Coral", bandA: "#ff8a5c", bandB: "#ffd9c0" },
      { name: "Slate", bandA: "#3a3d45", bandB: "#5a5e68" },
    ],
    sizes: [
      { label: "43mm", priceDelta: 0 },
      { label: "47mm", priceDelta: 500_000 },
    ],
    keySpecs: [
      { icon: "display", label: "Display", value: '1.4" AMOLED' },
      { icon: "battery", label: "Battery", value: "4 days" },
      { icon: "health", label: "Health", value: "HR + SpO₂" },
      { icon: "water", label: "Water", value: "5 ATM" },
    ],
    pulse: {
      bpm: 148,
      headline: "Heart rate that keeps up with your run.",
      body: "A high-rate sensor tracks every zone as you push, so your effort — easy, threshold or all-out — is always honest, mile after mile.",
    },
    features: [
      {
        icon: "gps",
        title: "Know every mile",
        body: "Dual-band GPS locks on fast and maps your route to the metre, even under tree cover or between tall buildings.",
      },
      {
        icon: "activity",
        title: "100+ ways to move",
        body: "From trail runs to open-water swims, pick your sport and Move tracks the metrics that matter for it.",
      },
      {
        icon: "recovery",
        title: "Train, then recover",
        body: "VO₂ max, training load and recovery time tell you when to go again — and when your body needs to rest.",
      },
      {
        icon: "water",
        title: "Rain, sweat or pool",
        body: "A reinforced body and 5 ATM water resistance shrug off whatever the workout throws at it.",
      },
    ],
    specGroups: [
      {
        group: "Display",
        items: [
          { label: "Type", value: '1.4" AMOLED' },
          { label: "Always-on", value: "Yes" },
          { label: "Brightness", value: "1,200 nits" },
        ],
      },
      {
        group: "Training",
        items: [
          { label: "GPS", value: "Dual-band" },
          { label: "Sport modes", value: "100+" },
          { label: "Metrics", value: "VO₂ max, recovery" },
        ],
      },
      {
        group: "Battery",
        items: [
          { label: "Life", value: "Up to 4 days" },
          { label: "GPS battery", value: "Up to 30 hrs" },
        ],
      },
      {
        group: "Durability",
        items: [
          { label: "Case", value: "Reinforced polymer" },
          { label: "Water resistance", value: "5 ATM" },
        ],
      },
    ],
  },
];
