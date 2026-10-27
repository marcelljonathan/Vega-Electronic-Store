import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthLayout from "../_auth/AuthLayout";
import { safeNext } from "../_auth/safeNext";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create account — Vega",
};

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const next = safeNext((await searchParams).next);

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect(next);

  return (
    <AuthLayout
      title="Create your Vega account."
      subtitle="Keep your cart and orders with you, on every device."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/signin${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-accent"
          >
            Sign in →
          </Link>
        </>
      }
    >
      <SignUpForm next={next} />
    </AuthLayout>
  );
}
