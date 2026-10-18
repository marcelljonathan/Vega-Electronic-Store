import type { CartItem } from "@/app/(store)/CartProvider";
import type { Catalog } from "./catalog";

// What the browser sends for each cart line. Prices and names are NOT
// trusted from the browser — they're looked up again from the catalog.
export type OrderLineInput = {
  productSlug: string;
  kind: CartItem["kind"];
  colorName: string;
  option: string;
  quantity: number;
};

export type PricedLine =
  | { item: CartItem }
  | { error: "missing" }
  | { error: "sold-out"; name: string };

// Rebuilds a cart line from the catalog with its real name, colors and
// price. Fails if the product, color or option doesn't exist, or if the
// product is sold out.
export function priceLine(line: OrderLineInput, catalog: Catalog): PricedLine {
  const item = buildLine(line, catalog);
  if (!item) return { error: "missing" };
  if (!item.available) return { error: "sold-out", name: item.line.name };
  return { item: item.line };
}

function buildLine(
  line: OrderLineInput,
  { phones, watches, audio }: Catalog,
): { line: CartItem; available: boolean } | null {
  const { productSlug, kind, colorName, option, quantity } = line;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;

  if (kind === "phone") {
    const phone = phones.find((p) => p.slug === productSlug);
    const color = phone?.colors.find((c) => c.name === colorName);
    const storage = phone?.storage.find(
      (s) => `${s.size} · ${s.ram} RAM` === option,
    );
    if (!phone || !color || !storage) return null;
    return {
      available: phone.available,
      line: {
        productSlug,
        kind,
        name: phone.name,
        colorName: color.name,
        screenA: color.screenA,
        screenB: color.screenB,
        option,
        unitPrice: phone.price + storage.priceDelta,
        quantity,
      },
    };
  }

  if (kind === "watch") {
    const watch = watches.find((w) => w.slug === productSlug);
    const band = watch?.bands.find((b) => b.name === colorName);
    const size = watch?.sizes.find((s) => s.label === option);
    if (!watch || !band || !size) return null;
    return {
      available: watch.available,
      line: {
        productSlug,
        kind,
        name: watch.name,
        colorName: band.name,
        screenA: band.bandA,
        screenB: band.bandB,
        option,
        unitPrice: watch.price + size.priceDelta,
        quantity,
      },
    };
  }

  // Audio: buds or headphones, color only.
  const item = audio.find((a) => a.slug === productSlug && a.shape === kind);
  const color = item?.colors.find((c) => c.name === colorName);
  if (!item || !color || option !== "") return null;
  return {
    available: item.available,
    line: {
      productSlug,
      kind,
      name: item.name,
      colorName: color.name,
      screenA: color.screenA,
      screenB: color.screenB,
      option: "",
      unitPrice: item.price,
      quantity,
    },
  };
}
