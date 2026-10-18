import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin, storeUrl } from "@/lib/admin";
import { fromRowParts, type ProductRowParts } from "@/lib/productDraft";
import ProductEditor from "../ProductEditor";

export async function generateMetadata({
  params,
}: PageProps<"/admin/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit ${slug}` };
}

const COLUMNS = "slug, category, name, tagline, description, price, available, details";

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[slug]">) {
  const { supabase } = await requireAdmin();
  const { slug } = await params;
  const { created } = await searchParams;

  const { data } = await supabase.from("products").select(COLUMNS).eq("slug", slug).maybeSingle();
  if (!data) notFound();

  // Existing phone families, offered as suggestions in the form.
  const { data: phones } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("category", "phone");
  const families = [
    ...new Set(
      ((phones ?? []) as ProductRowParts[]).map((p) => String(p.details.family ?? "")),
    ),
  ].filter(Boolean);

  const store = await storeUrl();

  return (
    <ProductEditor
      key={slug}
      initial={fromRowParts(data as ProductRowParts)}
      mode="update"
      storeUrl={store}
      families={families}
      created={created === "1"}
    />
  );
}
