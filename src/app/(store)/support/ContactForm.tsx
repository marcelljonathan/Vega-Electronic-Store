"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { Field, inputClass } from "../FormField";
import { MESSAGE_MAX, MESSAGE_MIN } from "@/lib/support-threads";
import { startConversation } from "../account/messages/actions";
import { OpenAssistantButton } from "../Assistant";

// Product names for the "Product" dropdown, grouped like the store.
export type ProductGroup = { label: string; names: string[] };

// Contact form: signed-in buyers start a conversation with the Vega team;
// the reply arrives in their account. Visitors are asked to sign in first.
export default function ContactForm({
  productGroups,
}: {
  productGroups: ProductGroup[];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  // Arriving from "Start a follow-up": /support?followUp=<id>&product=<name>#contact
  const searchParams = useSearchParams();
  const followUpOf = searchParams.get("followUp") ?? "";
  // Arriving from "Ask about this order": /support?order=VG-10001#contact
  const orderNumber = searchParams.get("order") ?? "";
  const [product, setProduct] = useState(searchParams.get("product") ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ready) {
    return <div className="min-h-80 rounded-3xl bg-card" />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-start justify-center gap-5 rounded-3xl bg-card p-6 sm:p-8">
        <h3 className="text-2xl font-medium tracking-tight">
          Sign in to message us
        </h3>
        <p className="max-w-[46ch] text-sm leading-relaxed text-muted">
          Conversations live in your Vega account, so our replies — and your
          order details — are all in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signin?next=/support%23contact"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup?next=/support%23contact"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-fg"
          >
            Create account
          </Link>
        </div>
        <p className="text-xs text-muted">
          Just a quick question?{" "}
          <OpenAssistantButton className="font-semibold text-accent">
            Ask our AI assistant
          </OpenAssistantButton>{" "}
          — no account needed.
        </p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (message.trim().length < MESSAGE_MIN) {
      setError(
        `Please write at least ${MESSAGE_MIN} characters so we can help.`,
      );
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await startConversation({
        product,
        message,
        followUpOf,
        orderNumber,
      });
      if (!result.ok) {
        if (result.reason === "signin")
          router.push("/signin?next=/support%23contact");
        else setError(result.message);
        return;
      }
      router.push(`/account/messages/${result.threadId}?sent=1`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-3xl bg-card p-6 sm:p-8"
    >
      <p className="text-sm text-muted">
        Writing as{" "}
        <span className="font-semibold text-fg">{user.fullName}</span> ·{" "}
        <span className="break-all">{user.email}</span>
      </p>
      {followUpOf && (
        <p className="rounded-xl bg-bg px-4 py-3 text-sm">
          ↩ Follow-up to{" "}
          <Link
            href={`/account/messages/${followUpOf}`}
            className="font-semibold text-accent"
          >
            your earlier conversation
          </Link>
          . Our team will see both.
        </p>
      )}

      {orderNumber && (
        <p className="rounded-xl bg-bg px-4 py-3 text-sm">
          About{" "}
          <Link
            href={`/orders/${orderNumber}`}
            className="font-semibold text-accent"
          >
            order {orderNumber}
          </Link>
          . Our team will see its details.
        </p>
      )}

      {!orderNumber && (
        <Field id="contact-product" label="Product (optional)">
          <select
            id="contact-product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className={inputClass(false)}
          >
            <option value="">General question</option>
            {productGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.names.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
      )}

      <Field
        id="contact-message"
        label="How can we help?"
        error={error ?? undefined}
      >
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          maxLength={MESSAGE_MAX}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "contact-message-error" : undefined}
          className={`${inputClass(!!error)} resize-y`}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-muted">
          Our reply will appear in your account.
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
