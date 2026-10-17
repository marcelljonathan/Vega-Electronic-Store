"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../CartProvider";
import ProductThumb from "../ProductThumb";
import { Field, inputClass } from "../FormField";
import { formatRupiah } from "@/lib/format";
import { useIsClient } from "@/lib/useIsClient";
import {
  provinces,
  deliveryOptions,
  paymentOptions,
  normalizePhone,
  isValidPhone,
  createOrderNumber,
  LAST_ORDER_KEY,
  type DeliveryId,
  type PaymentId,
  type Order,
} from "@/lib/checkout";

type Fields = {
  email: string;
  fullName: string;
  phone: string;
  street: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
};
type Errors = Partial<Record<keyof Fields, string>>;

const emptyFields: Fields = {
  email: "",
  fullName: "",
  phone: "",
  street: "",
  province: "",
  city: "",
  district: "",
  postalCode: "",
};

// The order fields appear on the page — used to focus the first error.
const fieldOrder: (keyof Fields)[] = [
  "email",
  "fullName",
  "phone",
  "street",
  "province",
  "city",
  "district",
  "postalCode",
];

function validate(f: Fields): Errors {
  const errors: Errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!f.fullName.trim()) errors.fullName = "Please enter the recipient's name.";
  if (!isValidPhone(f.phone))
    errors.phone = "Please enter a valid mobile number, e.g. 812 3456 7890.";
  if (f.street.trim().length < 5)
    errors.street = "Please enter the full street address.";
  if (!f.province) errors.province = "Please choose a province.";
  if (!f.city.trim()) errors.city = "Please enter the city or regency.";
  if (!f.district.trim()) errors.district = "Please enter the district.";
  if (!/^\d{5}$/.test(f.postalCode.trim()))
    errors.postalCode = "Postal codes have 5 digits.";
  return errors;
}

// Mock checkout — validates the form and "places" the order in this browser.
// The backend phase will save real orders and require signing in.
export default function Checkout() {
  const { items, total: subtotal, count, clearCart, openCart } = useCart();
  const isClient = useIsClient();
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [errors, setErrors] = useState<Errors>({});
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("card");
  const [placing, setPlacing] = useState(false);

  // Wait for the saved cart to load; hold the page while leaving after "Place order".
  if (!isClient || placing) {
    return <div className="min-h-[60vh]" />;
  }

  if (items.length === 0) {
    return <EmptyCheckout />;
  }

  const shippingFee = deliveryOptions.find((d) => d.id === delivery)?.fee ?? 0;
  const total = subtotal + shippingFee;

  function update(name: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const firstError = fieldOrder.find((name) => found[name]);
    if (firstError) {
      document.getElementById(`checkout-${firstError}`)?.focus();
      return;
    }

    const order: Order = {
      number: createOrderNumber(),
      placedAt: new Date().toISOString(),
      email: fields.email.trim(),
      address: {
        fullName: fields.fullName.trim(),
        phone: normalizePhone(fields.phone),
        street: fields.street.trim(),
        province: fields.province,
        city: fields.city.trim(),
        district: fields.district.trim(),
        postalCode: fields.postalCode.trim(),
      },
      delivery,
      payment,
      items,
      subtotal,
      shippingFee,
      total,
    };
    try {
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    } catch {}
    setPlacing(true);
    clearCart();
    router.push("/checkout/success");
  }

  // Shared props for each text input: value, change handler, error wiring.
  const bind = (name: keyof Fields) => ({
    id: `checkout-${name}`,
    value: fields[name],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => update(name, e.target.value),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `checkout-${name}-error` : undefined,
  });

  return (
    <div className="mx-auto max-w-280 px-7 py-12">
      <Link
        href="/"
        className="text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        ← Continue shopping
      </Link>
      <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">
        Checkout
      </h1>

      {/* Phones: the summary sits below the form, so offer a jump to it */}
      <a
        href="#summary"
        className="mt-6 flex items-center justify-between rounded-2xl border border-line px-5 py-4 text-sm lg:hidden"
      >
        <span className="font-semibold">
          Order summary · {count} {count === 1 ? "item" : "items"}
        </span>
        <span className="font-semibold text-accent">{formatRupiah(total)} ↓</span>
      </a>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="flex flex-col gap-6">
          <Section step={1} title="Contact">
            <Field
              id="checkout-email"
              label="Email"
              error={errors.email}
              hint="We'll send your order confirmation here."
            >
              <input
                {...bind("email")}
                type="email"
                autoComplete="email"
                className={inputClass(!!errors.email)}
              />
            </Field>
          </Section>

          <Section step={2} title="Shipping address">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="checkout-fullName" label="Full name" error={errors.fullName}>
                <input
                  {...bind("fullName")}
                  type="text"
                  autoComplete="name"
                  className={inputClass(!!errors.fullName)}
                />
              </Field>
              <Field id="checkout-phone" label="Mobile number" error={errors.phone}>
                <div
                  className={`flex items-center rounded-xl border bg-bg transition-colors focus-within:border-accent ${
                    errors.phone ? "border-red-500" : "border-line"
                  }`}
                >
                  <span className="border-r border-line px-3.5 text-sm text-muted">
                    +62
                  </span>
                  <input
                    {...bind("phone")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="812 3456 7890"
                    className="w-full min-w-0 bg-transparent px-3.5 py-3 text-sm outline-none placeholder:text-muted/60"
                  />
                </div>
              </Field>
            </div>
            <Field id="checkout-street" label="Street address" error={errors.street}>
              <input
                {...bind("street")}
                type="text"
                autoComplete="street-address"
                placeholder="Street name, building, house number"
                className={`${inputClass(!!errors.street)} placeholder:text-muted/60`}
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="checkout-province" label="Province" error={errors.province}>
                <select
                  {...bind("province")}
                  autoComplete="address-level1"
                  className={inputClass(!!errors.province)}
                >
                  <option value="">Choose a province</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="checkout-city" label="City / Regency" error={errors.city}>
                <input
                  {...bind("city")}
                  type="text"
                  autoComplete="address-level2"
                  className={inputClass(!!errors.city)}
                />
              </Field>
              <Field
                id="checkout-district"
                label="District (Kecamatan)"
                error={errors.district}
              >
                <input
                  {...bind("district")}
                  type="text"
                  autoComplete="address-level3"
                  className={inputClass(!!errors.district)}
                />
              </Field>
              <Field id="checkout-postalCode" label="Postal code" error={errors.postalCode}>
                <input
                  {...bind("postalCode")}
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  className={inputClass(!!errors.postalCode)}
                />
              </Field>
            </div>
          </Section>

          <Section step={3} title="Delivery">
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Delivery method</legend>
              {deliveryOptions.map((d) => (
                <OptionCard
                  key={d.id}
                  name="delivery"
                  checked={delivery === d.id}
                  onChange={() => setDelivery(d.id)}
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{d.label}</span>
                    <span className="text-xs text-muted">{d.time}</span>
                  </span>
                  <span className="text-sm font-semibold">
                    {d.fee === 0 ? "Free" : formatRupiah(d.fee)}
                  </span>
                </OptionCard>
              ))}
            </fieldset>
          </Section>

          <Section step={4} title="Payment">
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Payment method</legend>
              {paymentOptions.map((p) => (
                <OptionCard
                  key={p.id}
                  name="payment"
                  checked={payment === p.id}
                  onChange={() => setPayment(p.id)}
                >
                  <span className="text-sm font-semibold">{p.label}</span>
                </OptionCard>
              ))}
            </fieldset>
            <p className="text-xs leading-relaxed text-muted">
              This is a demo store — you won&apos;t be asked for any payment
              details, and nothing is charged.
            </p>
          </Section>
        </div>

        {/* Order summary — sticks beside the form on large screens */}
        <aside
          id="summary"
          className="flex scroll-mt-24 flex-col gap-5 rounded-3xl border border-line p-6 lg:sticky lg:top-24"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <button
              type="button"
              onClick={openCart}
              className="text-sm font-semibold text-accent"
            >
              Edit cart
            </button>
          </div>

          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li
                key={`${item.productSlug}-${item.colorName}-${item.option}`}
                className="flex items-center gap-4"
              >
                <div className="relative grid h-20 w-14 shrink-0 place-items-center rounded-lg bg-card">
                  <ProductThumb item={item} />
                  <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-fg px-1 text-[11px] font-semibold text-bg">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="text-xs text-muted">
                    {item.option
                      ? `${item.colorName} · ${item.option}`
                      : item.colorName}
                  </span>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {formatRupiah(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-2.5 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{shippingFee === 0 ? "Free" : formatRupiah(shippingFee)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-semibold">Total</dt>
              <dd className="text-xl font-semibold">{formatRupiah(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white"
          >
            Place order
          </button>
          <p className="text-center text-xs text-muted">
            Demo store — no real payment is taken.
          </p>
        </aside>
      </form>
    </div>
  );
}

// A numbered checkout step.
function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-card p-6 sm:p-8">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs font-bold text-white">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// A selectable card wrapping a radio button (delivery and payment choices).
function OptionCard({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border bg-bg p-4 transition-colors ${
        checked ? "border-accent" : "border-line hover:border-muted"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-accent"
      />
      <span className="flex flex-1 items-center justify-between gap-4">
        {children}
      </span>
    </label>
  );
}

function EmptyCheckout() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-280 flex-col items-center justify-center gap-4 px-7 py-16 text-center">
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
        Your cart is empty.
      </h1>
      <p className="text-muted">Find something to glow about first.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {[
          { label: "Phones", href: "/phones" },
          { label: "Watch", href: "/watch" },
          { label: "Audio", href: "/audio" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
