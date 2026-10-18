import AudioArt from "@/app/(store)/audio/AudioArt";
import ProductThumb from "@/app/(store)/ProductThumb";
import type { ProductDraft } from "@/lib/productDraft";

// The two shades of a product's color (or watch band) at a given index.
export function shadesOf(d: ProductDraft, index = 0) {
  if (d.category === "watch") {
    const band = d.bands[index] ?? d.bands[0];
    return { name: band?.name ?? "", a: band?.bandA ?? "#cccccc", b: band?.bandB ?? "#eeeeee" };
  }
  const color = d.colors[index] ?? d.colors[0];
  return { name: color?.name ?? "", a: color?.screenA ?? "#cccccc", b: color?.screenB ?? "#eeeeee" };
}

// The store's CSS drawing for a product, card size — used by the live preview.
export function ProductArt({ draft, colorIndex }: { draft: ProductDraft; colorIndex: number }) {
  const { a, b } = shadesOf(draft, colorIndex);

  if (draft.category === "watch") {
    return (
      <div
        className="watch"
        data-size="card"
        style={{ "--band-a": a, "--band-b": b } as React.CSSProperties}
      >
        <div className="band" />
        <div className="case">
          <div className="face" />
        </div>
        <div className="crown" />
      </div>
    );
  }
  if (draft.category === "audio") {
    return <AudioArt shape={draft.shape} size="card" a={a} b={b} />;
  }
  return (
    <div
      className="device"
      data-size="card"
      style={{ "--screen-a": a, "--screen-b": b } as React.CSSProperties}
    >
      <div className="screen">
        <div className="glare" />
      </div>
      <div className="cam" />
    </div>
  );
}

// The small drawing used in the products list (same as the cart's).
export function ProductListThumb({ draft }: { draft: ProductDraft }) {
  const { name, a, b } = shadesOf(draft);
  const kind = draft.category === "audio" ? draft.shape : draft.category;
  return (
    <ProductThumb
      item={{
        productSlug: draft.slug,
        kind,
        name: draft.name,
        colorName: name,
        screenA: a,
        screenB: b,
        option: "",
        unitPrice: draft.price,
        quantity: 1,
      }}
    />
  );
}
