// The Midtrans payment window (Snap) in the browser, in Sandbox (test) mode.
// It only needs the public client key; the server prepares each payment.

const SNAP_SCRIPT = "https://app.sandbox.midtrans.com/snap/snap.js";

type SnapCallbacks = {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks: SnapCallbacks) => void };
  }
}

let loading: Promise<void> | null = null;

function loadSnap() {
  if (window.snap) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SNAP_SCRIPT;
    script.dataset.clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Couldn't load the Midtrans payment window."));
    };
    document.head.appendChild(script);
  });
  return loading;
}

// Opens the payment window over the page and resolves once the buyer is done
// with it. The result is only a hint — the server checks with Midtrans
// whether the order was really paid.
export async function openPaymentWindow(token: string) {
  await loadSnap();
  return new Promise<"paid" | "pending" | "closed" | "error">((resolve) => {
    window.snap!.pay(token, {
      onSuccess: () => resolve("paid"),
      onPending: () => resolve("pending"),
      onError: () => resolve("error"),
      onClose: () => resolve("closed"),
    });
  });
}
