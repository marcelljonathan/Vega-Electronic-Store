import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignInForm from "@/app/(store)/signin/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function AdminSignInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(user.app_metadata?.role === "admin" ? "/orders" : "/no-access");

  return (
    <div className="grid min-h-screen place-items-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span className="text-lg font-extrabold tracking-[0.16em]">VEGA</span>
            <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">
              Admin
            </span>
          </span>
          <h1 className="text-3xl font-medium tracking-tight">Sign in to manage the store.</h1>
          <p className="text-sm text-muted">Use an account with admin access.</p>
        </div>
        <SignInForm next="/orders" />
      </div>
    </div>
  );
}
