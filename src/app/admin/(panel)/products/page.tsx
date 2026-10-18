import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatRupiah } from "@/lib/format";
import {
  categories,
  fromRowParts,
  type ProductCategory,
  type ProductRowParts,
} from "@/lib/productDraft";
import { ProductListThumb } from "./ProductArt";
import AvailabilitySwitch from "./AvailabilitySwitch";

export const metadata: Metadata = {
  title: "Products",
};

const categoryOrder = Object.keys(categories) as ProductCategory[];

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const category = categoryOrder.find((c) => c === params.category);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 60) : "";

  // Fresh from the database (not the store's cache), in store order.
  const { data } = await supabase
    .from("products")
    .select("slug, category, position, name, tagline, description, price, available, details")
    .order("position");
  const all = ((data ?? []) as (ProductRowParts & { position: number })[])
    .map(fromRowParts)
    .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  const products = all.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );

  const tabHref = (c?: ProductCategory) => {
    const sp = new URLSearchParams();
    if (c) sp.set("category", c);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Products</h1>
        <Link
          href="/products/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Add product
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[undefined, ...categoryOrder].map((c) => {
            const active = c === category;
            const count = c ? all.filter((p) => p.category === c).length : all.length;
            return (
              <Link
                key={c ?? "all"}
                href={tabHref(c)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "border-fg bg-fg text-bg" : "border-line text-muted hover:text-fg"
                }`}
              >
                {c ? categories[c].plural : "All"}{" "}
                <span className="tabular-nums opacity-70">{count}</span>
              </Link>
            );
          })}
        </div>
        <form action="/products" method="get" className="flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products"
            aria-label="Search products"
            className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent sm:w-64"
          />
        </form>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-line p-8 text-center text-sm text-muted">
          No products match.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line">
          {products.map((p) => (
            <li
              key={p.slug}
              className="grid grid-cols-[56px_1fr_auto] items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-[56px_2fr_1.2fr_1fr_auto_auto]"
            >
              <div className="row-span-2 grid h-18 w-14 place-items-center rounded-lg bg-card md:row-span-1">
                <ProductListThumb draft={p} />
              </div>
              <div className="flex min-w-0 flex-col">
                <Link href={`/products/${p.slug}`} className="truncate font-semibold hover:text-accent">
                  {p.name}
                </Link>
                <span className="truncate text-xs text-muted">{p.tagline}</span>
              </div>
              <span className="hidden text-sm text-muted md:block">
                {categories[p.category].label}
                {p.category === "phone" && ` · ${p.family} ${p.tier}`}
                {p.category === "audio" && ` · ${p.shape === "buds" ? "Earbuds" : "Headphones"}`}
              </span>
              <span className="text-right text-sm font-semibold tabular-nums md:text-left">
                {formatRupiah(p.price)}
              </span>
              <span className="col-start-2 md:col-start-auto">
                <AvailabilitySwitch slug={p.slug} name={p.name} available={p.available} />
              </span>
              <Link
                href={`/products/${p.slug}`}
                className="col-start-3 text-right text-sm font-semibold text-accent md:col-start-auto"
              >
                Edit →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
