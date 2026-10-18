"use client";

import { useState } from "react";
import { Field, inputClass } from "../FormField";

type Fields = { name: string; email: string; product: string; message: string };
// Each field may have an error message (or none).
type Errors = Partial<Record<keyof Fields, string>>;

const emptyFields: Fields = { name: "", email: "", product: "", message: "" };

// Returns an error per invalid field; an empty object means all good.
function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) {
    errors.name = "Please tell us your name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (fields.message.trim().length < 10) {
    errors.message = "Please write at least 10 characters so we can help.";
  }
  return errors;
}

// Mock contact form — validates, then shows a confirmation. Nothing is sent
// yet; the backend phase will save these as real support tickets.
// Product names for the "Product" dropdown, grouped like the store.
export type ProductGroup = { label: string; names: string[] };

export default function ContactForm({ productGroups }: { productGroups: ProductGroup[] }) {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function update(name: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear that field's error as soon as the user edits it.
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser's default page reload
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length === 0) setSent(true);
  }

  function reset() {
    setFields(emptyFields);
    setErrors({});
    setSent(false);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card p-8 text-center"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-lg text-white">
          ✓
        </span>
        <span className="text-lg font-semibold">
          Thanks, {fields.name.trim()}!
        </span>
        <p className="max-w-[40ch] text-sm leading-relaxed text-muted">
          We&apos;ve got your message
          {fields.product ? ` about your ${fields.product}` : ""} and will reply
          to {fields.email.trim()} within 24 hours. (This is a demo — nothing
          was actually sent.)
        </p>
        <button
          onClick={reset}
          className="mt-2 text-sm font-semibold text-accent"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-3xl bg-card p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Name" error={errors.name}>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={inputClass(!!errors.email)}
          />
        </Field>
      </div>

      <Field id="contact-product" label="Product (optional)">
        <select
          id="contact-product"
          value={fields.product}
          onChange={(e) => update("product", e.target.value)}
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

      <Field id="contact-message" label="How can we help?" error={errors.message}>
        <textarea
          id="contact-message"
          rows={5}
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${inputClass(!!errors.message)} resize-y`}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-muted">
          Demo form — messages aren&apos;t actually sent.
        </span>
        <button
          type="submit"
          className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white"
        >
          Send message
        </button>
      </div>
    </form>
  );
}
