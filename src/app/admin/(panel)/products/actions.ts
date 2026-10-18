"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { PRODUCTS_TAG } from "@/lib/catalog";
import {
  cleanDraft,
  validateDraft,
  toRowParts,
  type DraftErrors,
} from "@/lib/productDraft";

export type SaveResult =
  | { ok: true; slug: string }
  | { ok: false; message: string; errors?: DraftErrors };

export type SimpleResult = { ok: true } | { ok: false; message: string };

// Clears the cached catalog and the store pages, so the next visitor sees the
// change straight away.
function refreshStore() {
  updateTag(PRODUCTS_TAG);
  revalidatePath("/", "layout");
}

// Creates a new product or saves changes to an existing one. Everything is
// cleaned and checked here again — the browser's checks are only a convenience.
export async function saveProduct(
  input: unknown,
  mode: "create" | "update",
): Promise<SaveResult> {
  const { supabase } = await requireAdmin();

  const draft = cleanDraft(input);
  if (!draft) return { ok: false, message: "That product couldn't be read." };
  const errors = validateDraft(draft);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Some fields need attention.", errors };
  }

  const { details, ...columns } = toRowParts(draft);
  const now = new Date().toISOString();

  if (mode === "create") {
    const { data: taken } = await supabase
      .from("products")
      .select("slug")
      .eq("slug", draft.slug)
      .maybeSingle();
    if (taken) {
      return {
        ok: false,
        message: "That web address is already used by another product.",
        errors: { slug: "Already used — choose another." },
      };
    }
    // New products go to the end of their category's list.
    const { data: last } = await supabase
      .from("products")
      .select("position")
      .eq("category", draft.category)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase.from("products").insert({
      ...columns,
      details,
      position: (last?.position ?? 0) + 10,
      updated_at: now,
    });
    if (error) {
      console.error("saveProduct (create):", error.message);
      return { ok: false, message: "Couldn't create the product. Please try again." };
    }
  } else {
    // The address and category never change after creation.
    const { data, error } = await supabase
      .from("products")
      .update({
        name: columns.name,
        tagline: columns.tagline,
        description: columns.description,
        price: columns.price,
        available: columns.available,
        details,
        updated_at: now,
      })
      .eq("slug", draft.slug)
      .eq("category", draft.category)
      .select("slug");
    if (error || !data?.length) {
      console.error("saveProduct (update):", error?.message);
      return {
        ok: false,
        message: "Couldn't save — the product may have been deleted. Refresh and try again.",
      };
    }
  }

  refreshStore();
  return { ok: true, slug: draft.slug };
}

// The On sale / Sold out switch in the products list.
export async function setProductAvailability(
  slug: string,
  available: boolean,
): Promise<SimpleResult> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .update({ available: available === true, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select("slug");
  if (error || !data?.length) {
    return { ok: false, message: "Couldn't change it. Refresh and try again." };
  }
  refreshStore();
  return { ok: true };
}

// Deletes a product — only when the admin typed its exact name. Past orders
// keep their own copy of the name and price, so they aren't affected.
export async function deleteProduct(
  slug: string,
  confirmName: string,
): Promise<SimpleResult> {
  const { supabase } = await requireAdmin();
  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();
  if (!product) return { ok: false, message: "That product no longer exists." };
  if (confirmName.trim() !== product.name) {
    return { ok: false, message: "The name you typed doesn't match." };
  }
  const { error } = await supabase.from("products").delete().eq("slug", slug);
  if (error) {
    console.error("deleteProduct:", error.message);
    return { ok: false, message: "Couldn't delete the product. Please try again." };
  }
  refreshStore();
  return { ok: true };
}
