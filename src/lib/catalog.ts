import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Phone } from "./phones";
import type { Watch } from "./watches";
import type { Audio } from "./audio";

export type ProductCategory = "phone" | "watch" | "audio";

// A row of the "products" table: the common columns, plus everything
// category-specific in "details".
export type ProductRow = {
  slug: string;
  category: ProductCategory;
  position: number;
  name: string;
  tagline: string;
  description: string;
  price: number;
  available: boolean;
  details: Record<string, unknown>;
};

// Products are public, so they're read without anyone's sign-in — which also
// lets the store pages stay static and cached.
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function fetchProducts(): Promise<ProductRow[]> {
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .order("position");
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return data as ProductRow[];
}

// Tag for every cached product read. When an admin saves a product, the
// "products" tag is cleared and the store pages pick up the change.
export const PRODUCTS_TAG = "products";

// Cached across visits — the database is asked again only after a change.
const getCachedProducts = unstable_cache(fetchProducts, ["products"], {
  tags: [PRODUCTS_TAG],
});

// Turns a row back into the shape the store's components already use.
function toProduct<T>(row: ProductRow): T {
  return {
    ...row.details,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    price: row.price,
    available: row.available,
  } as T;
}

function byCategory<T>(rows: ProductRow[], category: ProductCategory) {
  return rows.filter((r) => r.category === category).map((r) => toProduct<T>(r));
}

export async function getPhones() {
  return byCategory<Phone>(await getCachedProducts(), "phone");
}
export async function getWatches() {
  return byCategory<Watch>(await getCachedProducts(), "watch");
}
export async function getAudio() {
  return byCategory<Audio>(await getCachedProducts(), "audio");
}

export async function getPhone(slug: string) {
  return (await getPhones()).find((p) => p.slug === slug);
}
export async function getWatch(slug: string) {
  return (await getWatches()).find((w) => w.slug === slug);
}
export async function getAudioItem(slug: string) {
  return (await getAudio()).find((a) => a.slug === slug);
}

// Fresh, uncached read — used at checkout so prices and "sold out" are
// always checked against the very latest data.
export async function getCatalogFresh() {
  const rows = await fetchProducts();
  return {
    phones: byCategory<Phone>(rows, "phone"),
    watches: byCategory<Watch>(rows, "watch"),
    audio: byCategory<Audio>(rows, "audio"),
  };
}

export type Catalog = Awaited<ReturnType<typeof getCatalogFresh>>;
