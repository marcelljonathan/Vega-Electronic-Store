import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin, storeUrl } from "@/lib/admin";
import {
  blankProduct,
  categories,
  fromRowParts,
  type ProductCategory,
  type ProductDraft,
  type ProductRowParts,
} from "@/lib/productDraft";
import ProductEditor from "../ProductEditor";
import { ProductArt } from "../ProductArt";

export const metadata: Metadata = {
  title: "Add product",
};

const COLUMNS = "slug, category, name, tagline, description, price, available, details";
const categoryOrder = Object.keys(categories) as ProductCategory[];

// Add a product: pick a category (blank form) or copy an existing product.
export default async function NewProductPage({
  searchParams,
}: PageProps<"/admin/products/new">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const category = categoryOrder.find((c) => c === params.category);
  const from = typeof params.from === "string" ? params.from : "";

  const { data: rows } = await supabase
    .from("products")
    .select(COLUMNS)
    .order("position");
  const all = ((rows ?? []) as ProductRowParts[]).map(fromRowParts);
  const families = [
    ...new Set(all.flatMap((p) => (p.category === "phone" ? [p.family] : []))),
  ];

  // Start from a copy of an existing product…
  const source = from ? all.find((p) => p.slug === from) : undefined;
  let initial: ProductDraft | null = null;
  if (source) {
    initial = { ...source, name: `${source.name} (copy)`, slug: "", available: true };
  } else if (category) {
    // …or from a blank form for the chosen category.
    initial = blankProduct(category);
  }

  if (initial) {
    const store = await storeUrl();
    return (
      <ProductEditor
        key={from || category}
        initial={initial}
        mode="create"
        storeUrl={store}
        families={families}
      />
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Link
          href="/products"
          className="text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          ← Products
        </Link>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          Add a product
        </h1>
        <p className="text-muted">What are you adding?</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {categoryOrder.map((c) => (
          <Link
            key={c}
            href={`/products/new?category=${c}`}
            className="flex flex-col items-center gap-4 rounded-2xl border border-line p-6 transition-colors hover:border-accent"
          >
            <div className="relative grid h-88 w-full place-items-center">
              <div className="glow-layer" />
              <ProductArt draft={blankProduct(c)} colorIndex={0} />
            </div>
            <span className="font-semibold">{categories[c].label}</span>
            <span className="text-xs text-muted">Start from a blank form</span>
          </Link>
        ))}
      </div>

      <form
        action="/products/new"
        method="get"
        className="flex flex-col gap-3 rounded-2xl bg-card p-6"
      >
        <label htmlFor="copy-from" className="font-semibold">
          Or copy an existing product
        </label>
        <p className="text-sm text-muted">
          Handy for a new generation: copy it, rename it, then adjust the price and
          specs.
        </p>
        <div className="flex flex-wrap gap-3">
          <select
            id="copy-from"
            name="from"
            required
            defaultValue=""
            className="w-full max-w-xs rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="" disabled>
              Choose a product
            </option>
            {categoryOrder.map((c) => (
              <optgroup key={c} label={categories[c].plural}>
                {all
                  .filter((p) => p.category === c)
                  .map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
          >
            Copy
          </button>
        </div>
      </form>
    </div>
  );
}
