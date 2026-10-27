"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MIN_PASSWORD, NAME_MAX } from "@/lib/account";
import { Field, inputClass } from "../FormField";
import PasswordInput from "../_auth/PasswordInput";
import { changePassword } from "./actions";

const linkButton =
  "shrink-0 text-sm font-semibold text-accent transition-opacity disabled:opacity-60";
const primaryButton =
  "rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60";
const secondaryButton =
  "rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-fg";

// Profile: name and password can be changed here; email stays as it is.
export default function ProfileCard({
  fullName,
  email,
  memberSince,
}: {
  fullName: string;
  email: string;
  memberSince: string;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-card p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Profile</h2>
      <div className="flex flex-col gap-4 text-sm">
        <NameRow fullName={fullName} />
        <Row label="Email">
          <span className="font-semibold break-all">{email}</span>
        </Row>
        <Row label="Member since">
          <span className="font-semibold">{memberSince}</span>
        </Row>
      </div>
      <div className="border-t border-line pt-5 text-sm">
        <PasswordRow />
      </div>
    </section>
  );
}

function Row({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted">{label}</span>
        {children}
      </div>
      {action}
    </div>
  );
}

function NameRow({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(fullName);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <Row
        label="Name"
        action={
          <button
            onClick={() => {
              setName(fullName);
              setSaved(false);
              setEditing(true);
            }}
            className={linkButton}
          >
            Edit
          </button>
        }
      >
        <span className="font-semibold">
          {fullName}
          {saved && <span className="font-normal text-accent"> · Saved ✓</span>}
        </span>
      </Row>
    );
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) return setError("Please enter your name.");
    if (clean.length > NAME_MAX) return setError(`Please keep it under ${NAME_MAX} characters.`);
    setError(null);
    startTransition(async () => {
      // Updated from the browser so the navbar and forms pick it up right away.
      const { error } = await createClient().auth.updateUser({ data: { full_name: clean } });
      if (error) {
        setError("We couldn't save your name. Please try again.");
        return;
      }
      setEditing(false);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-3">
      <Field id="profile-name" label="Name" error={error ?? undefined}>
        <input
          id="profile-name"
          autoComplete="name"
          autoFocus
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "profile-name-error" : undefined}
          className={inputClass(!!error)}
        />
      </Field>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}

type PasswordErrors = { current?: string; next?: string; form?: string };

function PasswordRow() {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const longEnough = next.length >= MIN_PASSWORD;

  function close() {
    setEditing(false);
    setCurrent("");
    setNext("");
    setErrors({});
  }

  if (!editing) {
    return (
      <Row
        label="Password"
        action={
          <button
            onClick={() => {
              setSaved(false);
              setEditing(true);
            }}
            className={linkButton}
          >
            Change
          </button>
        }
      >
        <span className="font-semibold">
          {saved ? (
            <span className="text-accent">Password updated ✓</span>
          ) : (
            <span aria-label="Hidden">••••••••</span>
          )}
        </span>
      </Row>
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found: PasswordErrors = {};
    if (!current) found.current = "Enter your current password.";
    if (!longEnough) found.next = `Use at least ${MIN_PASSWORD} characters.`;
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    startTransition(async () => {
      const result = await changePassword(current, next);
      if (!result.ok) {
        setErrors({ [result.field]: result.message });
        return;
      }
      close();
      setSaved(true);
    });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <span className="text-sm font-semibold">Change password</span>
      <Field id="password-current" label="Current password" error={errors.current}>
        <PasswordInput
          id="password-current"
          value={current}
          onChange={(v) => {
            setCurrent(v);
            if (errors.current) setErrors({ ...errors, current: undefined });
          }}
          autoComplete="current-password"
          hasError={!!errors.current}
        />
      </Field>
      <Field id="password-new" label="New password" error={errors.next}>
        <PasswordInput
          id="password-new"
          value={next}
          onChange={(v) => {
            setNext(v);
            if (errors.next) setErrors({ ...errors, next: undefined });
          }}
          autoComplete="new-password"
          hasError={!!errors.next}
        />
        {!errors.next && (
          <span
            className={`text-xs transition-colors ${longEnough ? "text-accent" : "text-muted"}`}
          >
            {MIN_PASSWORD}+ characters {longEnough ? "✓" : ""}
          </span>
        )}
      </Field>
      {errors.form && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {errors.form}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Updating…" : "Update password"}
        </button>
        <button type="button" onClick={close} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}
