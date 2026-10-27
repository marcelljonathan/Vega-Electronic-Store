"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "../CartProvider";
import { useAuth } from "../AuthProvider";
import ProductThumb from "../ProductThumb";
import { Field, inputClass } from "../FormField";
import { formatRupiah } from "@/lib/format";
import { useIsClient } from "@/lib/useIsClient";
import { createClient } from "@/lib/supabase/client";
import {
  provinces,
  deliveryOptions,
  validateAddress,
  type Address,
  type DeliveryId,
} from "@/lib/checkout";
import { openPaymentWindow } from "@/lib/snap";
import { placeOrder } from "./actions";

type Fields = Address;
type Errors = Partial<Record<keyof Fields, string>>;

const emptyFields: Fields = {
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
  "fullName",
  "phone",
  "street",
  "province",
  "city",
  "district",
  "postalCode",
];

// Checkout: signed-in buyers fill in the address and delivery, then
// "Place order & pay" asks the Vega server to check everything and save the
// order, and the Midtrans payment window opens for it.
export default function Checkout() {
  const { items, total: subtotal, count, clearCart, openCart } = useCart();
  const { user, ready } = useAuth();
  const isClient = useIsClient();
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [errors, setErrors] = useState<Errors>({});
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const userId = user?.id ?? null;

  // Pre-fill the address from the buyer's most recent order (if the form is
  // still empty), so returning buyers only need to check it.
  useEffect(() => {
    if (!userId) return;
    createClient()
      .from("orders")
      .select("address")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const last = data?.address as Address | undefined;
        if (!last) return;
        setFields((prev) =>
          Object.values(prev).every((v) => v === "")
            ? { ...emptyFields, ...last }
            : prev,
        );
      });
  }, [userId]);

  // Wait for the saved cart and the sign-in to load.
  if (!isClient || !ready) {
    return <div className="min-h-[60vh]" />;
  }

  // The order is placed; the payment window is open over the page.
  if (placing) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-280 flex-col items-center justify-center gap-2 px-7 text-center">
        <p className="text-lg font-semibold">Complete your payment in the Midtrans window.</p>
        <p className="text-sm text-muted">Your order is saved — you&apos;ll see it right after.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCheckout />;
  }

  const shippingFee = deliveryOptions.find((d) => d.id === delivery)?.fee ?? 0;
  const total = subtotal + shippingFee;
  const summary: SummaryData = {
    items,
    subtotal,
    shippingFee,
    total,
    count,
    onEditCart: openCart,
  };

  // Signed out: sign in first, so nothing typed is lost on the way.
  if (!user) {
    return (
      <CheckoutFrame summary={summary}>
        <div className="flex flex-col gap-5 rounded-3xl bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-medium tracking-tight">
            Sign in to check out
          </h2>
          <p className="max-w-[46ch] text-sm leading-relaxed text-muted">
            Your order is saved to your Vega account, so you can follow it from
            any device. Your cart comes with you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signin?next=/checkout"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup?next=/checkout"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-fg"
            >
              Create account
            </Link>
          </div>
        </div>
      </CheckoutFrame>
    );
  }

  function update(name: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateAddress(fields);
    setErrors(found);
    const firstError = fieldOrder.find((name) => found[name]);
    if (firstError) {
      document.getElementById(`checkout-${firstError}`)?.focus();
      return;
    }

    setPending(true);
    setFormError(null);
    try {
      // Only what was picked is sent — the server looks up names and prices.
      const result = await placeOrder({
        items: items.map(({ productSlug, kind, colorName, option, quantity }) => ({
          productSlug,
          kind,
          colorName,
          option,
          quantity,
        })),
        address: fields,
        delivery,
      });
      if (!result.ok) {
        setPending(false);
        if (result.reason === "signin") router.push("/signin?next=/checkout");
        else setFormError(result.message);
        return;
      }
      setPlacing(true);
      clearCart();
      // Pay now. Whatever happens in the window (paid, closed, failed), the
      // order page then shows the real status, checked with Midtrans.
      if (result.token) await openPaymentWindow(result.token).catch(() => null);
      router.push(`/orders/${result.number}?placed=1`);
    } catch {
      setPending(false);
      setFormError("We couldn't place your order. Please try again.");
    }
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
    <CheckoutFrame
      summary={summary}
      onSubmit={handleSubmit}
      action={
        <>
          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
            >
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          >
            {pending ? "Placing order…" : "Place order & pay"}
          </button>
          <p className="text-center text-xs text-muted">
            Test mode — no real money is charged.
          </p>
        </>
      }
    >
      <Section step={1} title="Account">
        <p className="text-sm text-muted">
          Signed in as{" "}
          <span className="font-semibold break-all text-fg">{user.email}</span>.
          Your order confirmation and updates go here.
        </p>
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
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-bg p-5">
          <p className="text-sm leading-relaxed">
            You&apos;ll choose how to pay in a secure{" "}
            <span className="font-semibold">Midtrans</span> window that opens
            after you place your order.
          </p>
          <p className="text-xs text-muted">
            Available there: card · virtual account · QRIS · GoPay · ShopeePay
          </p>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Test mode: pay with Midtrans&apos;s test card (4811 1111 1111 1114,
          CVV 123, OTP 112233) or its payment simulator. No real money moves.
          Unpaid orders are cancelled after 24 hours.
        </p>
      </Section>
    </CheckoutFrame>
  );
}

type SummaryData = {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  count: number;
  onEditCart: () => void;
};

// Page layout: title, the steps on the left, the order summary on the right.
// With onSubmit, the whole thing is a form (the summary holds the submit button).
function CheckoutFrame({
  summary,
  onSubmit,
  action,
  children,
}: {
  summary: SummaryData;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const grid =
    "mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start";
  const body = (
    <>
      <div className="flex flex-col gap-6">{children}</div>
      <OrderSummary {...summary}>{action}</OrderSummary>
    </>
  );

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
          Order summary · {summary.count} {summary.count === 1 ? "item" : "items"}
        </span>
        <span className="font-semibold text-accent">
          {formatRupiah(summary.total)} ↓
        </span>
      </a>

      {onSubmit ? (
        <form onSubmit={onSubmit} noValidate className={grid}>
          {body}
        </form>
      ) : (
        <div className={grid}>{body}</div>
      )}
    </div>
  );
}

// Order summary — sticks beside the form on large screens.
function OrderSummary({
  items,
  subtotal,
  shippingFee,
  total,
  onEditCart,
  children,
}: SummaryData & { children?: React.ReactNode }) {
  return (
    <aside
      id="summary"
      className="flex scroll-mt-24 flex-col gap-5 rounded-3xl border border-line p-6 lg:sticky lg:top-24"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <button
          type="button"
          onClick={onEditCart}
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
                {item.option ? `${item.colorName} · ${item.option}` : item.colorName}
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

      {children ?? (
        <p className="text-center text-xs text-muted">
          Sign in to place your order.
        </p>
      )}
    </aside>
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
