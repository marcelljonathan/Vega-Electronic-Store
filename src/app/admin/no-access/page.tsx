import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { storeUrl } from "@/lib/admin";
import SignOutButton from "@/app/(store)/account/SignOutButton";

export const metadata: Metadata = {
  title: "No access",
};

export default async function NoAccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  if (user.app_metadata?.role === "admin") redirect("/orders");
  const store = await storeUrl();

  return (
    <div className="grid min-h-screen place-items-center px-6 py-16">
      <div className="flex max-w-md flex-col items-start gap-5">
        <h1 className="text-3xl font-medium tracking-tight">
          This account doesn&apos;t have admin access.
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          You&apos;re signed in as{" "}
          <span className="font-semibold text-fg">{user.email}</span>. Sign out and
          use an admin account, or head back to the store.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <SignOutButton />
          <a href={store} className="text-sm font-semibold text-accent">
            Go to the store →
          </a>
        </div>
      </div>
    </div>
  );
}
