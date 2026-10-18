import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthLayout from "../_auth/AuthLayout";
import { safeNext } from "../_auth/safeNext";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in — Vega",
};

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const next = safeNext((await searchParams).next);

  // Already signed in? Skip the form.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect(next);

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to your Vega account."
      footer={
        <>
          New to Vega?{" "}
          <Link
            href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-accent"
          >
            Create an account →
          </Link>
        </>
      }
    >
      <SignInForm next={next} />
    </AuthLayout>
  );
}
