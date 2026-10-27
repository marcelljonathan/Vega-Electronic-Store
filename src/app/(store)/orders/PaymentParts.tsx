"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { openPaymentWindow } from "@/lib/snap";
import { startPayment } from "./actions";

// "Pay now" / "Continue payment": reopens the Midtrans payment window for an
// unpaid order, then reloads the page to show what Midtrans says happened.
export function PayButton({ number, label }: { number: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const result = await startPayment(number);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      await openPaymentWindow(result.token);
    } catch {
      setError("We couldn't open the payment window. Please try again.");
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={pay}
        disabled={busy}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {busy ? "Opening…" : label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

// While an order waits for payment, check again every 10 seconds — so a bank
// transfer paid in the Midtrans simulator shows up here on its own.
export function PaymentWatcher() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 10_000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
