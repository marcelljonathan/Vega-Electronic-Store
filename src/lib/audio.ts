// The Vega audio lineup — 3 products, configurable by color only.

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
  price: number;
  description: string;
  shape: AudioShape;
  colors: { name: string; screenA: string; screenB: string }[];
  keySpecs: { icon: AudioIconName; label: string; value: string }[];
  // Sound hero — headline + copy beside the animated equalizer.
  sound: { headline: string; body: string };
  // The "Why Vega Audio" usage features.
  features: { icon: AudioIconName; title: string; body: string }[];
  specGroups: { group: string; items: { label: string; value: string }[] }[];
};

export const audio: Audio[] = [
  {
    slug: "beam",
    name: "Vega Beam",
    tagline: "Everyday sound, untethered.",
    price: 1_099_000,
    description:
      "The essential Vega earbuds — custom 12mm drivers, a full day of battery with the case, and a snug, sweatproof fit.",
    shape: "buds",
    colors: [
      { name: "Midnight", screenA: "#2b2f3a", screenB: "#4a4f5e" },
      { name: "Coral", screenA: "#ff8a5c", screenB: "#ffd9c0" },
    ],
    keySpecs: [
      { icon: "sound", label: "Drivers", value: "12mm dynamic" },
      { icon: "battery", label: "Battery", value: "24h total" },
      { icon: "mic", label: "Calls", value: "4 mics" },
      { icon: "water", label: "Water", value: "IPX4" },
    ],
    sound: {
      headline: "Big sound, small buds.",
      body: "Custom 12mm drivers push deep bass and clear highs, tuned by Vega so your everyday playlist feels a size bigger.",
    },
    features: [
      {
        icon: "sound",
        title: "Signature Vega sound",
        body: "A tuned 12mm driver in each bud delivers warm bass and crisp detail, straight out of the case.",
      },
      {
        icon: "battery",
        title: "All-day battery",
        body: "6 hours in the buds and four more charges in the case — 24 hours before you reach for a cable.",
      },
      {
        icon: "charge",
        title: "Quick charge",
        body: "10 minutes in the case is good for 2 hours of listening when you're running out the door.",
      },
      {
        icon: "water",
        title: "Sweat and rain ready",
        body: "An IPX4 rating shrugs off workouts and weather, so they keep up wherever you go.",
      },
    ],
    specGroups: [
      {
        group: "Sound",
        items: [
          { label: "Drivers", value: "12mm dynamic" },
          { label: "Codecs", value: "AAC, SBC" },
        ],
      },
      {
        group: "Battery",
        items: [
          { label: "Buds", value: "Up to 6 hrs" },
          { label: "With case", value: "Up to 24 hrs" },
          { label: "Quick charge", value: "10 min = 2 hrs" },
        ],
      },
      {
        group: "Fit & durability",
        items: [
          { label: "Design", value: "In-ear, 3 tip sizes" },
          { label: "Water resistance", value: "IPX4" },
        ],
      },
    ],
  },
  {
    slug: "beam-pro",
    name: "Vega Beam Pro",
    tagline: "Silence, then everything.",
    price: 1_999_000,
    description:
      "Adaptive noise cancellation, spatial audio, and Hi-Res sound in a compact bud — the flagship of the Beam line.",
    shape: "buds",
    colors: [
      { name: "Graphite", screenA: "#3a3d45", screenB: "#5a5e68" },
      { name: "Sky", screenA: "#6aa8ff", screenB: "#cfe2ff" },
    ],
    keySpecs: [
      { icon: "anc", label: "Noise", value: "Adaptive ANC" },
      { icon: "spatial", label: "Audio", value: "Spatial, Hi-Res" },
      { icon: "battery", label: "Battery", value: "30h total" },
      { icon: "water", label: "Water", value: "IPX5" },
    ],
    sound: {
      headline: "Adaptive noise cancellation.",
      body: "Beam Pro reads the room 200 times a second and tunes out the world — then Transparency lets it back in with a tap.",
    },
    features: [
      {
        icon: "anc",
        title: "Adaptive ANC",
        body: "Noise cancellation that adjusts to your surroundings in real time, from a quiet office to a loud train.",
      },
      {
        icon: "spatial",
        title: "Spatial audio",
        body: "Sound that places instruments around you and stays fixed as you turn your head, for a room-like feel.",
      },
      {
        icon: "battery",
        title: "30 hours, quick-charged",
        body: "7 hours a charge, 30 with the case, and 5 minutes tops you up for an hour when you're low.",
      },
      {
        icon: "mic",
        title: "Crystal-clear calls",
        body: "Beamforming mics and wind reduction keep your voice clear even outdoors.",
      },
    ],
    specGroups: [
      {
        group: "Sound",
        items: [
          { label: "Drivers", value: "11mm dynamic" },
          { label: "Audio", value: "Hi-Res, spatial" },
          { label: "Codecs", value: "LDAC, AAC, SBC" },
        ],
      },
      {
        group: "Noise control",
        items: [
          { label: "ANC", value: "Adaptive" },
          { label: "Transparency", value: "Yes" },
        ],
      },
      {
        group: "Battery",
        items: [
          { label: "Buds (ANC on)", value: "Up to 7 hrs" },
          { label: "With case", value: "Up to 30 hrs" },
          { label: "Quick charge", value: "5 min = 1 hr" },
        ],
      },
      {
        group: "Durability",
        items: [{ label: "Water resistance", value: "IPX5" }],
      },
    ],
  },
  {
    slug: "aura",
    name: "Vega Aura",
    tagline: "Your studio, anywhere.",
    price: 2_899_000,
    description:
      "Over-ear headphones with immersive noise cancellation, 40mm drivers, spatial audio, and 40-hour battery in a plush, foldable body.",
    shape: "headphone",
    colors: [
      { name: "Midnight", screenA: "#2b2f3a", screenB: "#4a4f5e" },
      { name: "Silver", screenA: "#c9ced8", screenB: "#eef1f6" },
      { name: "Sand", screenA: "#d9c3a3", screenB: "#f2e6d2" },
    ],
    keySpecs: [
      { icon: "anc", label: "Noise", value: "Immersive ANC" },
      { icon: "sound", label: "Drivers", value: "40mm" },
      { icon: "battery", label: "Battery", value: "40h" },
      { icon: "spatial", label: "Audio", value: "Spatial" },
    ],
    sound: {
      headline: "Studio sound, all day.",
      body: "Custom 40mm drivers and immersive ANC wrap you in your music — and 40 hours of battery means the studio comes with you.",
    },
    features: [
      {
        icon: "anc",
        title: "Immersive noise cancellation",
        body: "Eight microphones sense and silence the world around you, from engine drone to open-office chatter.",
      },
      {
        icon: "spatial",
        title: "Spatial audio with head tracking",
        body: "A cinema-like stage that stays anchored as you move, turning any seat into the best seat.",
      },
      {
        icon: "battery",
        title: "40-hour battery",
        body: "Two weeks of commutes on a charge, and a 5-minute top-up returns 5 hours when you're low.",
      },
      {
        icon: "fit",
        title: "Made to wear for hours",
        body: "Memory-foam cushions and a balanced headband stay comfortable long after the flight lands.",
      },
    ],
    specGroups: [
      {
        group: "Sound",
        items: [
          { label: "Drivers", value: "40mm dynamic" },
          { label: "Audio", value: "Hi-Res, spatial" },
          { label: "Codecs", value: "LDAC, AAC, SBC" },
        ],
      },
      {
        group: "Noise control",
        items: [
          { label: "ANC", value: "Immersive, adaptive" },
          { label: "Transparency", value: "Yes" },
        ],
      },
      {
        group: "Battery",
        items: [
          { label: "ANC on", value: "Up to 40 hrs" },
          { label: "Quick charge", value: "5 min = 5 hrs" },
        ],
      },
      {
        group: "Comfort",
        items: [
          { label: "Cushions", value: "Memory foam" },
          { label: "Design", value: "Foldable, 250g" },
        ],
      },
    ],
  },
];
