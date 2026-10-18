"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { specIconNames, phoneFeatureIcons } from "@/lib/phones";
import { watchIconNames, watchFeatureIcons } from "@/lib/watches";
import { audioIconNames } from "@/lib/audio";
import {
  categories,
  slugify,
  validateDraft,
  type DraftErrors,
  type ProductDraft,
} from "@/lib/productDraft";
import { saveProduct, deleteProduct } from "./actions";
import { ProductArt, shadesOf } from "./ProductArt";
import {
  Section,
  TextInput,
  TextArea,
  DigitsInput,
  SelectInput,
  ShadeInput,
  RowButtons,
  AddButton,
  ListError,
  fid,
} from "./EditorFields";

// Returns a copy of obj with the value at path replaced (lists included).
function setIn(obj: unknown, keys: string[], value: unknown): unknown {
  if (keys.length === 0) return value;
  const [key, ...rest] = keys;
  if (Array.isArray(obj)) {
    const copy = obj.slice();
    copy[Number(key)] = setIn(obj[Number(key)], rest, value);
    return copy;
  }
  const record = (obj ?? {}) as Record<string, unknown>;
  return { ...record, [key]: setIn(record[key], rest, value) };
}

const iconOptions = (names: readonly string[]) =>
  names.map((n) => ({ value: n, label: n.charAt(0).toUpperCase() + n.slice(1) }));

// The admin form for one product — used both to add and to edit.
export default function ProductEditor({
  initial,
  mode,
  storeUrl,
  families,
  created = false,
}: {
  initial: ProductDraft;
  mode: "create" | "update";
  storeUrl: string;
  families: string[];
  created?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    created ? "Product created — it's live in the store." : null,
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [previewColor, setPreviewColor] = useState(0);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Change one field; its errors (and those of anything inside it) clear.
  function set(path: string, value: unknown) {
    setDraft((d) => setIn(d, path.split("."), value) as ProductDraft);
    setErrors((prev) => {
      const next: DraftErrors = {};
      for (const [k, v] of Object.entries(prev)) {
        if (k !== path && !k.startsWith(`${path}.`)) next[k] = v;
      }
      return next;
    });
    setNotice(null);
  }
  const err = (path: string) => errors[path];

  // Add / remove / reorder rows of a list field.
  function listOps<T>(key: string, items: T[]) {
    const onRemove = (i: number) => set(key, items.filter((_, j) => j !== i));
    const onMove = (i: number, dir: -1 | 1) => {
      const j = i + dir;
      if (j < 0 || j >= items.length) return;
      const copy = items.slice();
      [copy[i], copy[j]] = [copy[j], copy[i]];
      set(key, copy);
    };
    return {
      add: (item: T) => set(key, [...items, item]),
      rowProps: { onMove, onRemove }, // for <RowButtons>
    };
  }

  function save() {
    const found = validateDraft(draft);
    setErrors(found);
    const count = Object.keys(found).length;
    if (count > 0) {
      setMessage(`${count} ${count === 1 ? "field needs" : "fields need"} attention.`);
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await saveProduct(draft, mode);
      if (!result.ok) {
        setMessage(result.message);
        if (result.errors) setErrors(result.errors);
        return;
      }
      setSaved(draft);
      if (mode === "create") {
        router.push(`/products/${result.slug}?created=1`);
        return;
      }
      setNotice("Saved — the store is updated.");
      router.refresh();
    });
  }

  function discard() {
    setDraft(saved);
    setErrors({});
    setMessage(null);
  }

  const d = draft;
  const isWatch = d.category === "watch";
  const colorKey = isWatch ? "bands" : "colors";
  const colorRows = isWatch
    ? d.bands.map((b) => ({ name: b.name, a: b.bandA, b: b.bandB }))
    : d.colors.map((c) => ({ name: c.name, a: c.screenA, b: c.screenB }));
  const [keyA, keyB] = isWatch ? ["bandA", "bandB"] : ["screenA", "screenB"];
  const colorOps = listOps<unknown>(colorKey, isWatch ? d.bands : d.colors);

  const keySpecIcons =
    d.category === "phone" ? specIconNames : d.category === "watch" ? watchIconNames : audioIconNames;
  const featureIcons =
    d.category === "phone"
      ? phoneFeatureIcons
      : d.category === "watch"
        ? watchFeatureIcons
        : audioIconNames;
  const storeLink = `${storeUrl}${categories[d.category].storePath}/${d.slug}`;
  const showBar = dirty || mode === "create" || !!message || !!notice;

  return (
    <div className="flex flex-col gap-8 pb-28">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/products"
          className="text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          ← Products
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            {d.name || `New ${categories[d.category].label.toLowerCase()}`}
          </h1>
          <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">
            {categories[d.category].label}
          </span>
          {mode === "update" && (
            <a
              href={storeLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-accent"
            >
              View in store ↗
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_300px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {/* ----- Basics ----- */}
          <Section id="basics" title="Basics">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextInput
                path="name"
                label="Name"
                value={d.name}
                error={err("name")}
                placeholder="Vega Ember 2"
                onChange={(v) => {
                  set("name", v);
                  if (mode === "create" && !slugTouched) set("slug", slugify(v));
                }}
              />
              {mode === "create" ? (
                <TextInput
                  path="slug"
                  label="Web address"
                  value={d.slug}
                  error={err("slug")}
                  hint={`${categories[d.category].storePath}/${d.slug || "…"} — can't be changed later`}
                  onChange={(v) => {
                    setSlugTouched(true);
                    set("slug", v.toLowerCase());
                  }}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Web address</span>
                  <span className="rounded-xl border border-line bg-card px-4 py-3 text-sm text-muted">
                    {categories[d.category].storePath}/{d.slug}
                  </span>
                </div>
              )}
            </div>
            <TextInput
              path="tagline"
              label="Tagline"
              value={d.tagline}
              error={err("tagline")}
              placeholder="A short line under the name"
              onChange={(v) => set("tagline", v)}
            />
            <TextArea
              path="description"
              label="Description"
              value={d.description}
              error={err("description")}
              onChange={(v) => set("description", v)}
            />

            {d.category === "phone" && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextInput
                  path="family"
                  label="Family"
                  value={d.family}
                  error={err("family")}
                  list="family-options"
                  hint="Phones are grouped by family on the Phones page."
                  onChange={(v) => set("family", v)}
                />
                <datalist id="family-options">
                  {families.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
                <TextInput
                  path="tier"
                  label="Tier"
                  value={d.tier}
                  error={err("tier")}
                  list="tier-options"
                  onChange={(v) => set("tier", v)}
                />
                <datalist id="tier-options">
                  <option value="Base" />
                  <option value="Plus" />
                  <option value="Pro" />
                </datalist>
                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={!!d.bestValue}
                    onChange={(e) => set("bestValue", e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Show the &quot;Best value&quot; badge
                </label>
              </div>
            )}

            {d.category === "audio" && (
              <SelectInput
                path="shape"
                label="Type"
                value={d.shape}
                options={[
                  { value: "buds", label: "Earbuds" },
                  { value: "headphone", label: "Headphones" },
                ]}
                onChange={(v) => set("shape", v)}
              />
            )}

            <div className="flex items-center justify-between gap-4 rounded-xl bg-card px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Availability</span>
                <span className="text-xs text-muted">
                  Sold out products stay visible but can&apos;t be added to the cart.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={d.available}
                onClick={() => set("available", !d.available)}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <span
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    d.available ? "bg-emerald-500" : "bg-line"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      d.available ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </span>
                {d.available ? "On sale" : "Sold out"}
              </button>
            </div>
          </Section>

          {/* ----- Price & options ----- */}
          <Section
            id="price"
            title={
              d.category === "phone"
                ? "Price & storage"
                : d.category === "watch"
                  ? "Price & case sizes"
                  : "Price"
            }
            hint={
              d.category === "audio"
                ? "Audio products have one price."
                : "The base price is for the first option. Each other option adds its extra cost."
            }
          >
            <div className="max-w-xs">
              <DigitsInput
                path="price"
                label="Base price"
                prefix="Rp"
                value={d.price}
                error={err("price")}
                onChange={(v) => set("price", v)}
              />
            </div>

            {d.category === "phone" && (
              <div className="flex flex-col gap-3">
                {d.storage.map((s, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-3 rounded-xl bg-card p-3">
                    <div className="w-28">
                      <TextInput
                        path={`storage.${i}.size`}
                        label="Storage"
                        value={s.size}
                        placeholder="256GB"
                        error={err(`storage.${i}`)}
                        onChange={(v) => set(`storage.${i}.size`, v)}
                      />
                    </div>
                    <div className="w-24">
                      <TextInput
                        path={`storage.${i}.ram`}
                        label="RAM"
                        value={s.ram}
                        placeholder="8GB"
                        onChange={(v) => set(`storage.${i}.ram`, v)}
                      />
                    </div>
                    <div className="w-40">
                      <DigitsInput
                        path={`storage.${i}.priceDelta`}
                        label="Extra cost"
                        prefix="+Rp"
                        value={s.priceDelta}
                        error={err(`storage.${i}.priceDelta`)}
                        onChange={(v) => set(`storage.${i}.priceDelta`, v)}
                      />
                    </div>
                    <span className="pb-3 text-sm text-muted tabular-nums">
                      = {formatRupiah(d.price + s.priceDelta)}
                    </span>
                    <span className="ml-auto pb-1.5">
                      <RowButtons
                        index={i}
                        length={d.storage.length}
                        what="storage option"
                        minLength={1}
                        {...listOps("storage", d.storage).rowProps}
                      />
                    </span>
                  </div>
                ))}
                <ListError error={err("storage")} />
                <AddButton
                  onClick={() =>
                    listOps("storage", d.storage).add({ size: "", ram: "", priceDelta: 0 })
                  }
                >
                  + Add storage option
                </AddButton>
              </div>
            )}

            {d.category === "watch" && (
              <div className="flex flex-col gap-3">
                {d.sizes.map((s, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-3 rounded-xl bg-card p-3">
                    <div className="w-28">
                      <TextInput
                        path={`sizes.${i}.label`}
                        label="Case size"
                        value={s.label}
                        placeholder="45mm"
                        error={err(`sizes.${i}`)}
                        onChange={(v) => set(`sizes.${i}.label`, v)}
                      />
                    </div>
                    <div className="w-40">
                      <DigitsInput
                        path={`sizes.${i}.priceDelta`}
                        label="Extra cost"
                        prefix="+Rp"
                        value={s.priceDelta}
                        error={err(`sizes.${i}.priceDelta`)}
                        onChange={(v) => set(`sizes.${i}.priceDelta`, v)}
                      />
                    </div>
                    <span className="pb-3 text-sm text-muted tabular-nums">
                      = {formatRupiah(d.price + s.priceDelta)}
                    </span>
                    <span className="ml-auto pb-1.5">
                      <RowButtons
                        index={i}
                        length={d.sizes.length}
                        what="case size"
                        minLength={1}
                        {...listOps("sizes", d.sizes).rowProps}
                      />
                    </span>
                  </div>
                ))}
                <ListError error={err("sizes")} />
                <AddButton
                  onClick={() => listOps("sizes", d.sizes).add({ label: "", priceDelta: 0 })}
                >
                  + Add case size
                </AddButton>
              </div>
            )}
          </Section>

          {/* ----- Colors ----- */}
          <Section
            id="colors"
            title={isWatch ? "Bands" : "Colors"}
            hint="Each color paints the product drawing with two shades. The first one is shown by default."
          >
            <div className="flex flex-col gap-3">
              {colorRows.map((c, i) => (
                <div key={i} className="flex flex-wrap items-end gap-3 rounded-xl bg-card p-3">
                  <span
                    className="mb-1 h-9 w-9 shrink-0 rounded-full ring-1 ring-line"
                    style={{ background: `linear-gradient(135deg, ${c.a}, ${c.b})` }}
                    aria-hidden="true"
                  />
                  <div className="w-36">
                    <TextInput
                      path={`${colorKey}.${i}.name`}
                      label="Name"
                      value={c.name}
                      error={err(`${colorKey}.${i}.name`)}
                      onChange={(v) => set(`${colorKey}.${i}.name`, v)}
                    />
                  </div>
                  <ShadeInput
                    path={`${colorKey}.${i}.${keyA}`}
                    label="Shade 1"
                    value={c.a}
                    error={err(`${colorKey}.${i}.${keyA}`)}
                    onChange={(v) => set(`${colorKey}.${i}.${keyA}`, v)}
                  />
                  <ShadeInput
                    path={`${colorKey}.${i}.${keyB}`}
                    label="Shade 2"
                    value={c.b}
                    error={err(`${colorKey}.${i}.${keyB}`)}
                    onChange={(v) => set(`${colorKey}.${i}.${keyB}`, v)}
                  />
                  <span className="ml-auto pb-1.5">
                    <RowButtons
                      index={i}
                      length={colorRows.length}
                      what="color"
                      minLength={1}
                      {...colorOps.rowProps}
                    />
                  </span>
                </div>
              ))}
              <ListError error={err(colorKey)} />
              <AddButton
                onClick={() =>
                  colorOps.add(
                    isWatch
                      ? { name: "", bandA: "#888888", bandB: "#dddddd" }
                      : { name: "", screenA: "#888888", screenB: "#dddddd" },
                  )
                }
              >
                + Add {isWatch ? "band" : "color"}
              </AddButton>
            </div>
          </Section>

          {/* ----- Product page: the hero section ----- */}
          {d.category === "phone" && (
            <Section
              id="performance"
              title="Performance & battery"
              hint="The big numbers at the top of the product page."
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <DigitsInput
                  path="antutu"
                  label="AnTuTu score"
                  value={d.antutu}
                  error={err("antutu")}
                  hint="The bar fills relative to 2.600.000."
                  onChange={(v) => set("antutu", v)}
                />
                <TextInput
                  path="battery.screen"
                  label="Battery: screen time"
                  value={d.battery.screen}
                  placeholder="~1.5 days"
                  error={err("battery.screen")}
                  onChange={(v) => set("battery.screen", v)}
                />
                <TextInput
                  path="battery.gaming"
                  label="Battery: gaming"
                  value={d.battery.gaming}
                  placeholder="9 hours"
                  error={err("battery.gaming")}
                  onChange={(v) => set("battery.gaming", v)}
                />
              </div>
              <TextInput
                path="perf.headline"
                label="Performance headline"
                value={d.perf.headline}
                error={err("perf.headline")}
                onChange={(v) => set("perf.headline", v)}
              />
              <TextArea
                path="perf.body"
                label="Performance text"
                value={d.perf.body}
                error={err("perf.body")}
                onChange={(v) => set("perf.body", v)}
              />
            </Section>
          )}
          {d.category === "watch" && (
            <Section id="health" title="Health hero" hint="The animated heart-rate section.">
              <div className="max-w-[10rem]">
                <DigitsInput
                  path="pulse.bpm"
                  label="Heart rate (bpm)"
                  value={d.pulse.bpm}
                  error={err("pulse.bpm")}
                  onChange={(v) => set("pulse.bpm", v)}
                />
              </div>
              <TextInput
                path="pulse.headline"
                label="Headline"
                value={d.pulse.headline}
                error={err("pulse.headline")}
                onChange={(v) => set("pulse.headline", v)}
              />
              <TextArea
                path="pulse.body"
                label="Text"
                value={d.pulse.body}
                error={err("pulse.body")}
                onChange={(v) => set("pulse.body", v)}
              />
            </Section>
          )}
          {d.category === "audio" && (
            <Section id="sound" title="Sound hero" hint="The section beside the animated equalizer.">
              <TextInput
                path="sound.headline"
                label="Headline"
                value={d.sound.headline}
                error={err("sound.headline")}
                onChange={(v) => set("sound.headline", v)}
              />
              <TextArea
                path="sound.body"
                label="Text"
                value={d.sound.body}
                error={err("sound.body")}
                onChange={(v) => set("sound.body", v)}
              />
            </Section>
          )}

          {/* ----- Key specs ----- */}
          <Section
            id="key-specs"
            title="Key specs"
            hint="The short facts beside the price, e.g. Display · 6.7″ OLED."
          >
            <div className="flex flex-col gap-3">
              {d.keySpecs.map((k, i) => (
                <div key={i} className="flex flex-wrap items-end gap-3 rounded-xl bg-card p-3">
                  <div className="w-36">
                    <SelectInput
                      path={`keySpecs.${i}.icon`}
                      label="Icon"
                      value={k.icon as string}
                      options={iconOptions(keySpecIcons)}
                      onChange={(v) => set(`keySpecs.${i}.icon`, v)}
                    />
                  </div>
                  <div className="w-36">
                    <TextInput
                      path={`keySpecs.${i}.label`}
                      label="Label"
                      value={k.label}
                      error={err(`keySpecs.${i}.label`)}
                      onChange={(v) => set(`keySpecs.${i}.label`, v)}
                    />
                  </div>
                  <div className="min-w-40 flex-1">
                    <TextInput
                      path={`keySpecs.${i}.value`}
                      label="Value"
                      value={k.value}
                      error={err(`keySpecs.${i}.value`)}
                      onChange={(v) => set(`keySpecs.${i}.value`, v)}
                    />
                  </div>
                  <span className="pb-1.5">
                    <RowButtons
                      index={i}
                      length={d.keySpecs.length}
                      what="key spec"
                      {...listOps<unknown>("keySpecs", d.keySpecs).rowProps}
                    />
                  </span>
                </div>
              ))}
              {d.keySpecs.length < 6 && (
                <AddButton
                  onClick={() =>
                    listOps<unknown>("keySpecs", d.keySpecs).add({
                      icon: keySpecIcons[0],
                      label: "",
                      value: "",
                    })
                  }
                >
                  + Add key spec
                </AddButton>
              )}
            </div>
          </Section>

          {/* ----- Feature cards ----- */}
          <Section
            id="features"
            title="Feature cards"
            hint={`The cards in the "Why ${d.name || "Vega"}" section.`}
          >
            <div className="flex flex-col gap-3">
              {d.features.map((f, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-xl bg-card p-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="w-36">
                      <SelectInput
                        path={`features.${i}.icon`}
                        label="Icon"
                        value={f.icon as string}
                        options={iconOptions(featureIcons)}
                        onChange={(v) => set(`features.${i}.icon`, v)}
                      />
                    </div>
                    <div className="min-w-48 flex-1">
                      <TextInput
                        path={`features.${i}.title`}
                        label="Title"
                        value={f.title}
                        error={err(`features.${i}.title`)}
                        onChange={(v) => set(`features.${i}.title`, v)}
                      />
                    </div>
                    <span className="pb-1.5">
                      <RowButtons
                        index={i}
                        length={d.features.length}
                        what="feature card"
                        {...listOps<unknown>("features", d.features).rowProps}
                      />
                    </span>
                  </div>
                  <TextArea
                    path={`features.${i}.body`}
                    label="Text"
                    rows={2}
                    value={f.body}
                    error={err(`features.${i}.body`)}
                    onChange={(v) => set(`features.${i}.body`, v)}
                  />
                </div>
              ))}
              {d.features.length < 8 && (
                <AddButton
                  onClick={() =>
                    listOps<unknown>("features", d.features).add({
                      icon: featureIcons[0],
                      title: "",
                      body: "",
                    })
                  }
                >
                  + Add feature card
                </AddButton>
              )}
            </div>
          </Section>

          {/* ----- Full specifications ----- */}
          <Section
            id="specs"
            title="Full specifications"
            hint="The expandable spec list, in groups (e.g. Display → Size, Refresh rate)."
          >
            <div className="flex flex-col gap-4">
              {d.specGroups.map((g, gi) => (
                <div key={gi} className="flex flex-col gap-3 rounded-xl bg-card p-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-48 flex-1">
                      <TextInput
                        path={`specGroups.${gi}.group`}
                        label="Group"
                        value={g.group}
                        error={err(`specGroups.${gi}.group`)}
                        onChange={(v) => set(`specGroups.${gi}.group`, v)}
                      />
                    </div>
                    <span className="pb-1.5">
                      <RowButtons
                        index={gi}
                        length={d.specGroups.length}
                        what="spec group"
                        {...listOps<unknown>("specGroups", d.specGroups).rowProps}
                      />
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 border-l-2 border-line pl-3">
                    {g.items.map((it, ii) => (
                      <div key={ii} className="flex flex-wrap items-end gap-3">
                        <div className="w-40">
                          <TextInput
                            path={`specGroups.${gi}.items.${ii}.label`}
                            label="Label"
                            value={it.label}
                            error={err(`specGroups.${gi}.items.${ii}.label`)}
                            onChange={(v) => set(`specGroups.${gi}.items.${ii}.label`, v)}
                          />
                        </div>
                        <div className="min-w-40 flex-1">
                          <TextInput
                            path={`specGroups.${gi}.items.${ii}.value`}
                            label="Value"
                            value={it.value}
                            error={err(`specGroups.${gi}.items.${ii}.value`)}
                            onChange={(v) => set(`specGroups.${gi}.items.${ii}.value`, v)}
                          />
                        </div>
                        <span className="pb-1.5">
                          <RowButtons
                            index={ii}
                            length={g.items.length}
                            what="spec"
                            {...listOps<unknown>(`specGroups.${gi}.items`, g.items).rowProps}
                          />
                        </span>
                      </div>
                    ))}
                    <AddButton
                      onClick={() =>
                        listOps<unknown>(`specGroups.${gi}.items`, g.items).add({
                          label: "",
                          value: "",
                        })
                      }
                    >
                      + Add spec
                    </AddButton>
                  </div>
                </div>
              ))}
              <AddButton
                onClick={() =>
                  listOps<unknown>("specGroups", d.specGroups).add({
                    group: "",
                    items: [{ label: "", value: "" }],
                  })
                }
              >
                + Add spec group
              </AddButton>
            </div>
          </Section>

          {mode === "update" && <DangerZone slug={d.slug} name={saved.name} />}
        </div>

        {/* ----- Live preview ----- */}
        <aside className="flex flex-col gap-3 xl:sticky xl:top-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Preview
          </span>
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 text-center">
            <div className="relative grid min-h-88 w-full place-items-center">
              <div className="glow-layer" />
              <ProductArt draft={d} colorIndex={previewColor} />
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {colorRows.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreviewColor(i)}
                  aria-label={c.name || `Color ${i + 1}`}
                  className={`h-4 w-4 rounded-full transition ${
                    i === Math.min(previewColor, colorRows.length - 1)
                      ? "ring-2 ring-accent"
                      : "ring-1 ring-line"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${c.a}, ${c.b})` }}
                />
              ))}
            </div>
            <div className="flex flex-col items-center gap-1">
              {d.category === "phone" && d.bestValue && (
                <span className="mb-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                  Best value
                </span>
              )}
              <span className="font-semibold">{d.name || "Product name"}</span>
              <span className="text-sm text-muted">{d.tagline || "Tagline"}</span>
            </div>
            {d.available ? (
              <span className="text-sm font-semibold text-accent">
                From {formatRupiah(d.price)}
              </span>
            ) : (
              <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-semibold text-muted">
                Sold out
              </span>
            )}
            <span className="text-xs text-muted">{shadesOf(d, previewColor).name}</span>
          </div>
        </aside>
      </div>

      {/* ----- Save bar ----- */}
      {showBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-md lg:left-60">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-10">
            <span
              role="status"
              className={`text-sm ${message ? "font-semibold text-red-500" : notice ? "font-semibold text-emerald-600 dark:text-emerald-400" : "text-muted"}`}
            >
              {message ?? notice ?? (mode === "create" ? "New product — not saved yet." : "Unsaved changes")}
            </span>
            <div className="flex items-center gap-3">
              {mode === "update" && dirty && (
                <button
                  type="button"
                  onClick={discard}
                  disabled={pending}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted hover:text-fg"
                >
                  Discard
                </button>
              )}
              {(dirty || mode === "create") && (
                <button
                  type="button"
                  onClick={save}
                  disabled={pending}
                  className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                >
                  {pending ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Delete, guarded by typing the product's exact name.
function DangerZone({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(slug, typed);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/products");
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-red-500/40 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-red-500">Delete product</h2>
        <p className="text-sm text-muted">
          Removes it from the store for good. Past orders keep their own copy and
          aren&apos;t affected. To confirm, type{" "}
          <span className="font-semibold text-fg">{name}</span> below.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          id={fid("delete-confirm")}
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          aria-label={`Type ${name} to confirm`}
          className="w-full max-w-xs rounded-xl border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-red-500"
        />
        <button
          type="button"
          onClick={remove}
          disabled={typed.trim() !== name || pending}
          className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {pending ? "Deleting…" : "Delete product"}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </section>
  );
}
