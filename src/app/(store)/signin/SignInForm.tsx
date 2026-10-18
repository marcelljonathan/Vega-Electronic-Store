"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mergeGuestCartOnSignIn } from "../CartProvider";
import { Field, inputClass } from "../FormField";
import PasswordInput from "../_auth/PasswordInput";

type Errors = { email?: string; password?: string; form?: string };

export default function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      found.email = "Please enter a valid email address.";
    if (!password) found.password = "Please enter your password.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPending(true);
    mergeGuestCartOnSignIn();
    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setPending(false);
      setErrors({
        form:
          error.code === "invalid_credentials"
            ? "That email and password don't match."
            : error.message,
      });
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field id="signin-email" label="Email" error={errors.email}>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "signin-email-error" : undefined}
          className={inputClass(!!errors.email)}
        />
      </Field>
      <Field id="signin-password" label="Password" error={errors.password}>
        <PasswordInput
          id="signin-password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          hasError={!!errors.password}
        />
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
