"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mergeGuestCartOnSignIn } from "../CartProvider";
import { Field, inputClass } from "../FormField";
import PasswordInput from "../_auth/PasswordInput";
import { MIN_PASSWORD } from "@/lib/account";

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  form?: React.ReactNode;
};

export default function SignUpForm({ next }: { next: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);

  const longEnough = password.length >= MIN_PASSWORD;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found: Errors = {};
    if (!fullName.trim()) found.fullName = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      found.email = "Please enter a valid email address.";
    if (!longEnough)
      found.password = `Use at least ${MIN_PASSWORD} characters.`;
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPending(true);
    mergeGuestCartOnSignIn();
    const { data, error } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) {
      setPending(false);
      setErrors({
        form:
          error.code === "user_already_exists" ? (
            <>
              An account with this email already exists.{" "}
              <Link
                href={`/signin?next=${encodeURIComponent(next)}`}
                className="font-semibold underline"
              >
                Sign in instead?
              </Link>
            </>
          ) : (
            error.message
          ),
      });
      return;
    }
    // With email confirmation off, Supabase signs the new user in right away.
    if (!data.session) {
      setPending(false);
      setCheckInbox(true);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  if (checkInbox) {
    return (
      <p role="status" className="rounded-2xl bg-card p-6 text-sm leading-relaxed text-muted">
        Almost there — we sent a confirmation link to{" "}
        <span className="font-semibold text-fg">{email.trim()}</span>. Open it to
        finish creating your account.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field id="signup-name" label="Full name" error={errors.fullName}>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? "signup-name-error" : undefined}
          className={inputClass(!!errors.fullName)}
        />
      </Field>
      <Field id="signup-email" label="Email" error={errors.email}>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
          className={inputClass(!!errors.email)}
        />
      </Field>
      <Field id="signup-password" label="Password" error={errors.password}>
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hasError={!!errors.password}
        />
        {!errors.password && (
          <span
            className={`text-xs transition-colors ${longEnough ? "text-accent" : "text-muted"}`}
          >
            {MIN_PASSWORD}+ characters {longEnough ? "✓" : ""}
          </span>
        )}
      </Field>

      {errors.form && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
