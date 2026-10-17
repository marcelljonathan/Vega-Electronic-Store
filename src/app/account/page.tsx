import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "My account — Vega",
};

export default async function AccountPage() {
  // Checked on the server with Supabase — signed-out visitors go to Sign in.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/signin?next=/account");

  const email = user.email ?? "";
  const fullName: string = user.user_metadata?.full_name || email.split("@")[0];
  const firstName = fullName.split(" ")[0];
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-280 flex-col gap-10 px-7 py-16">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          My account
        </span>
        <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          Hi, {firstName}.
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.4fr]">
        <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Profile</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted">Name</dt>
              <dd className="font-semibold">{fullName}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted">Email</dt>
              <dd className="font-semibold break-all">{email}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted">Member since</dt>
              <dd className="font-semibold">{memberSince}</dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Orders</h2>
          <div className="flex flex-1 flex-col items-start justify-center gap-2">
            <p className="font-semibold">No orders yet.</p>
            <p className="text-sm text-muted">Orders you place will show up here.</p>
            <Link href="/" className="mt-2 text-sm font-semibold text-accent">
              Start shopping →
            </Link>
          </div>
        </section>
      </div>

      <SignOutButton />
    </div>
  );
}
