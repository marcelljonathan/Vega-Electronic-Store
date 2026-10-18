import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

// Every admin page and action starts with this. Not signed in → admin sign-in;
// signed in without the "admin" label → the no-access page.
// (Paths are as seen on the admin address, e.g. admin.localhost/signin.)
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  if (user.app_metadata?.role !== "admin") redirect("/no-access");
  return { supabase, user };
}

// The store's address, worked out from the admin one:
// admin.localhost:3000 → localhost:3000, vega-admin.vercel.app → vega.vercel.app
export async function storeUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  const storeHost = host.startsWith("admin.")
    ? host.slice("admin.".length)
    : host.replace(/^([^.]+)-admin\./, "$1.");
  return `${protocol}://${storeHost}`;
}
