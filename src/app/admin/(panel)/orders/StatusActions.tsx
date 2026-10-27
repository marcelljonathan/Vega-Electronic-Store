"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nextStatuses, statusActionLabels, type OrderStatus } from "@/lib/orders";
import { updateOrderStatus } from "./actions";

// The status buttons on an admin order page. Cancelling asks first.
export default function StatusActions({
  number,
  status,
}: {
  number: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = nextStatuses[status];
  if (options.length === 0) {
    return (
      <p className="text-sm text-muted">
        This order is finished — no further status changes.
      </p>
    );
  }

  function move(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(number, next);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirmCancel(false);
      router.refresh();
    });
  }

  const forward = options.filter((s) => s !== "cancelled");
  const canCancel = options.includes("cancelled");

  return (
    <div className="flex flex-col gap-3">
      {confirmCancel ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
          <span className="text-sm font-semibold text-red-500">
            Cancel order {number}? This can&apos;t be undone.
          </span>
          <button
            onClick={() => move("cancelled")}
            disabled={pending}
            className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Cancelling…" : "Yes, cancel it"}
          </button>
          <button
            onClick={() => setConfirmCancel(false)}
            disabled={pending}
            className="text-sm font-semibold text-muted hover:text-fg"
          >
            Keep order
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          {status === "awaiting_payment" && (
            <p className="text-sm text-muted">
              Waiting for the customer to pay. It moves to Processing by itself
              once Midtrans confirms the payment.
            </p>
          )}
          {forward.map((next) => (
            <button
              key={next}
              onClick={() => move(next)}
              disabled={pending}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {pending ? "Saving…" : statusActionLabels[next]}
            </button>
          ))}
          {canCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              disabled={pending}
              className="text-sm font-semibold text-red-500 hover:underline"
            >
              Cancel order
            </button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
