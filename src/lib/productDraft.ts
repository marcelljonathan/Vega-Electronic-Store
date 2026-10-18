// A product as the admin editor works with it, plus the rules for saving it.
// Shared by the editor (to show problems) and the server (to enforce them).
import { specIconNames, phoneFeatureIcons, type Phone } from "./phones";
import { watchIconNames, watchFeatureIcons, type Watch } from "./watches";
import { audioIconNames, audioShapes, type Audio } from "./audio";

export type ProductCategory = "phone" | "watch" | "audio";

export type ProductDraft =
  | ({ category: "phone" } & Phone)
  | ({ category: "watch" } & Watch)
  | ({ category: "audio" } & Audio);

export const categories: Record<
  ProductCategory,
  { label: string; plural: string; storePath: string }
> = {
  phone: { label: "Phone", plural: "Phones", storePath: "/phones" },
  watch: { label: "Watch", plural: "Watch", storePath: "/watch" },
  audio: { label: "Audio", plural: "Audio", storePath: "/audio" },
};

// "Vega Ember 2" → "ember-2" (store addresses leave out the brand name).
export function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^vega-/, "");
}

// ----- Row ↔ draft -----

export type ProductRowParts = {
  category: ProductCategory;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  available: boolean;
  details: Record<string, unknown>;
};

// Splits a draft into the table's columns and the "details" JSON.
export function toRowParts(d: ProductDraft): ProductRowParts {
  const {
    category,
    slug,
    name,
    tagline,
    description,
    price,
    available,
    ...details
  } = d;
  return {
    category,
    slug,
    name,
    tagline,
    description,
    price,
    available,
    details,
  };
}

export function fromRowParts(row: ProductRowParts): ProductDraft {
  return {
    ...row.details,
    category: row.category,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    price: row.price,
    available: row.available,
  } as ProductDraft;
}

// ----- Blank templates for "Add product" -----

const common = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price: 0,
  available: true,
};

export function blankProduct(category: ProductCategory): ProductDraft {
  if (category === "phone") {
    return {
      ...common,
      category,
      family: "",
      tier: "Base",
      colors: [{ name: "Midnight", screenA: "#3b4a6b", screenB: "#9fb0d0" }],
      storage: [{ size: "128GB", ram: "8GB", priceDelta: 0 }],
      keySpecs: [
        { icon: "display", label: "Display", value: "" },
        { icon: "camera", label: "Camera", value: "" },
        { icon: "battery", label: "Battery", value: "" },
        { icon: "chip", label: "Chip", value: "" },
      ],
      antutu: 1_000_000,
      battery: { screen: "", gaming: "" },
      perf: { headline: "", body: "" },
      features: [],
      specGroups: [],
    };
  }
  if (category === "watch") {
    return {
      ...common,
      category,
      bands: [{ name: "Midnight", bandA: "#3b4a6b", bandB: "#9fb0d0" }],
      sizes: [{ label: "41mm", priceDelta: 0 }],
      keySpecs: [
        { icon: "display", label: "Display", value: "" },
        { icon: "battery", label: "Battery", value: "" },
        { icon: "health", label: "Health", value: "" },
        { icon: "water", label: "Water", value: "" },
      ],
      pulse: { bpm: 72, headline: "", body: "" },
      features: [],
      specGroups: [],
    };
  }
  return {
    ...common,
    category,
    shape: "buds",
    colors: [{ name: "Midnight", screenA: "#3b4a6b", screenB: "#9fb0d0" }],
    keySpecs: [
      { icon: "sound", label: "Sound", value: "" },
      { icon: "battery", label: "Battery", value: "" },
      { icon: "anc", label: "Noise control", value: "" },
      { icon: "water", label: "Water", value: "" },
    ],
    sound: { headline: "", body: "" },
    features: [],
    specGroups: [],
  };
}

// ----- Cleaning (server) -----
// Rebuilds a draft from whatever the browser sent, keeping only known fields
// with the right types. Anything unexpected is dropped.

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const int = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? Math.round(v) : NaN;
const list = <T>(v: unknown, map: (item: Obj) => T, max = 20): T[] =>
  Array.isArray(v) ? v.filter(isObj).slice(0, max).map(map) : [];
const oneOf = <T extends string>(
  v: unknown,
  options: readonly T[],
  fallback: T,
): T => (options.includes(v as T) ? (v as T) : fallback);

function cleanSpecGroups(v: unknown) {
  return list(v, (g) => ({
    group: str(g.group, 60),
    items: list(
      g.items,
      (i) => ({ label: str(i.label, 60), value: str(i.value, 200) }),
      30,
    ),
  }));
}

export function cleanDraft(input: unknown): ProductDraft | null {
  if (!isObj(input)) return null;
  const base = {
    slug: str(input.slug, 80),
    name: str(input.name, 80),
    tagline: str(input.tagline, 120),
    description: str(input.description, 600),
    price: int(input.price),
    available: input.available !== false,
  };

  if (input.category === "phone") {
    const battery = isObj(input.battery) ? input.battery : {};
    const perf = isObj(input.perf) ? input.perf : {};
    return {
      ...base,
      category: "phone",
      family: str(input.family, 40),
      tier: str(input.tier, 40),
      ...(input.bestValue === true ? { bestValue: true } : {}),
      colors: list(input.colors, (c) => ({
        name: str(c.name, 40),
        screenA: str(c.screenA, 7),
        screenB: str(c.screenB, 7),
      })),
      storage: list(input.storage, (s) => ({
        size: str(s.size, 20),
        ram: str(s.ram, 20),
        priceDelta: int(s.priceDelta),
      })),
      keySpecs: list(input.keySpecs, (k) => ({
        icon: oneOf(k.icon, specIconNames, "display"),
        label: str(k.label, 40),
        value: str(k.value, 80),
      })),
      antutu: int(input.antutu),
      battery: {
        screen: str(battery.screen, 40),
        gaming: str(battery.gaming, 40),
      },
      perf: { headline: str(perf.headline, 120), body: str(perf.body, 400) },
      features: list(input.features, (f) => ({
        icon: oneOf(f.icon, phoneFeatureIcons, "camera"),
        title: str(f.title, 80),
        body: str(f.body, 300),
      })),
      specGroups: cleanSpecGroups(input.specGroups),
    };
  }

  if (input.category === "watch") {
    const pulse = isObj(input.pulse) ? input.pulse : {};
    return {
      ...base,
      category: "watch",
      bands: list(input.bands, (b) => ({
        name: str(b.name, 40),
        bandA: str(b.bandA, 7),
        bandB: str(b.bandB, 7),
      })),
      sizes: list(input.sizes, (s) => ({
        label: str(s.label, 20),
        priceDelta: int(s.priceDelta),
      })),
      keySpecs: list(input.keySpecs, (k) => ({
        icon: oneOf(k.icon, watchIconNames, "display"),
        label: str(k.label, 40),
        value: str(k.value, 80),
      })),
      pulse: {
        bpm: int(pulse.bpm),
        headline: str(pulse.headline, 120),
        body: str(pulse.body, 400),
      },
      features: list(input.features, (f) => ({
        icon: oneOf(f.icon, watchFeatureIcons, "everyday"),
        title: str(f.title, 80),
        body: str(f.body, 300),
      })),
      specGroups: cleanSpecGroups(input.specGroups),
    };
  }

  if (input.category === "audio") {
    const sound = isObj(input.sound) ? input.sound : {};
    return {
      ...base,
      category: "audio",
      shape: oneOf(input.shape, audioShapes, "buds"),
      colors: list(input.colors, (c) => ({
        name: str(c.name, 40),
        screenA: str(c.screenA, 7),
        screenB: str(c.screenB, 7),
      })),
      keySpecs: list(input.keySpecs, (k) => ({
        icon: oneOf(k.icon, audioIconNames, "sound"),
        label: str(k.label, 40),
        value: str(k.value, 80),
      })),
      sound: { headline: str(sound.headline, 120), body: str(sound.body, 400) },
      features: list(input.features, (f) => ({
        icon: oneOf(f.icon, audioIconNames, "sound"),
        title: str(f.title, 80),
        body: str(f.body, 300),
      })),
      specGroups: cleanSpecGroups(input.specGroups),
    };
  }

  return null;
}

// ----- Validation -----
// Errors are keyed by the field's path, e.g. "colors.1.screenA", so the
// editor can mark the exact field.

export type DraftErrors = Record<string, string>;

const HEX = /^#[0-9a-fA-F]{6}$/;
const isWhole = (n: number) => Number.isInteger(n) && n >= 0;

export function validateDraft(d: ProductDraft): DraftErrors {
  const e: DraftErrors = {};
  const need = (path: string, value: string, label: string) => {
    if (!value.trim()) e[path] = `${label} is required.`;
  };

  need("name", d.name, "Name");
  need("tagline", d.tagline, "Tagline");
  need("description", d.description, "Description");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug))
    e.slug = "Use lowercase letters, numbers and dashes, e.g. ember-2.";
  if (!isWhole(d.price) || d.price === 0)
    e.price = "Enter the base price in Rupiah.";

  // Colors (phones/audio) or bands (watches): at least one, two valid shades each.
  const colorList =
    d.category === "watch"
      ? d.bands.map((b, i) => ({
          path: `bands.${i}`,
          name: b.name,
          a: b.bandA,
          b: b.bandB,
          ka: "bandA",
          kb: "bandB",
        }))
      : d.colors.map((c, i) => ({
          path: `colors.${i}`,
          name: c.name,
          a: c.screenA,
          b: c.screenB,
          ka: "screenA",
          kb: "screenB",
        }));
  const colorKey = d.category === "watch" ? "bands" : "colors";
  if (colorList.length === 0) e[colorKey] = "Add at least one color.";
  const seenColors = new Set<string>();
  colorList.forEach((c) => {
    need(`${c.path}.name`, c.name, "Color name");
    if (seenColors.has(c.name.toLowerCase()))
      e[`${c.path}.name`] = "Each color needs a different name.";
    seenColors.add(c.name.toLowerCase());
    if (!HEX.test(c.a)) e[`${c.path}.${c.ka}`] = "Pick the first shade.";
    if (!HEX.test(c.b)) e[`${c.path}.${c.kb}`] = "Pick the second shade.";
  });

  // Price options: storage (phones) or case sizes (watches).
  if (d.category === "phone" || d.category === "watch") {
    const key = d.category === "phone" ? "storage" : "sizes";
    const options =
      d.category === "phone"
        ? d.storage.map((s) => ({
            label: `${s.size} · ${s.ram}`,
            delta: s.priceDelta,
            parts: [s.size, s.ram],
          }))
        : d.sizes.map((s) => ({
            label: s.label,
            delta: s.priceDelta,
            parts: [s.label],
          }));
    if (options.length === 0) e[key] = "Add at least one option.";
    const seen = new Set<string>();
    options.forEach((o, i) => {
      if (o.parts.some((p) => !p.trim()))
        e[`${key}.${i}`] = "Fill in this option.";
      else if (seen.has(o.label))
        e[`${key}.${i}`] = "This option is listed twice.";
      seen.add(o.label);
      if (!isWhole(o.delta))
        e[`${key}.${i}.priceDelta`] = "Enter an amount (0 or more).";
    });
    if (options.length > 0 && options[0].delta !== 0)
      e[`${key}.0.priceDelta`] =
        "The first option is the base price, so its extra cost must be 0.";
  }

  // Category-specific page content.
  if (d.category === "phone") {
    need("family", d.family, "Family");
    need("tier", d.tier, "Tier");
    if (!isWhole(d.antutu) || d.antutu === 0)
      e.antutu = "Enter the AnTuTu score.";
    need("battery.screen", d.battery.screen, "Battery (screen time)");
    need("battery.gaming", d.battery.gaming, "Battery (gaming)");
    need("perf.headline", d.perf.headline, "Performance headline");
    need("perf.body", d.perf.body, "Performance text");
  }
  if (d.category === "watch") {
    if (!Number.isInteger(d.pulse.bpm) || d.pulse.bpm < 30 || d.pulse.bpm > 220)
      e["pulse.bpm"] = "Use a heart rate between 30 and 220.";
    need("pulse.headline", d.pulse.headline, "Health headline");
    need("pulse.body", d.pulse.body, "Health text");
  }
  if (d.category === "audio") {
    need("sound.headline", d.sound.headline, "Sound headline");
    need("sound.body", d.sound.body, "Sound text");
  }

  d.keySpecs.forEach((k, i) => {
    need(`keySpecs.${i}.label`, k.label, "Label");
    need(`keySpecs.${i}.value`, k.value, "Value");
  });
  d.features.forEach((f, i) => {
    need(`features.${i}.title`, f.title, "Title");
    need(`features.${i}.body`, f.body, "Text");
  });
  d.specGroups.forEach((g, gi) => {
    need(`specGroups.${gi}.group`, g.group, "Group name");
    g.items.forEach((it, ii) => {
      need(`specGroups.${gi}.items.${ii}.label`, it.label, "Label");
      need(`specGroups.${gi}.items.${ii}.value`, it.value, "Value");
    });
  });

  return e;
}
