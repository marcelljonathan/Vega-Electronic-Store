"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";

export type CartItem = {
  productSlug: string;
  kind: "phone" | "watch" | "buds" | "headphone";
  name: string;
  colorName: string; // the picked color / band
  screenA: string;
  screenB: string;
  option: string; // e.g. "256GB · 8GB RAM" (phone) or "45mm" (watch)
  unitPrice: number;
  quantity: number;
};


type NewItem = Omit<CartItem, "quantity">;

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  addItem: (item: NewItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function itemKey(item: {
  productSlug: string;
  colorName: string;
  option: string;
}) {
  return `${item.productSlug}-${item.colorName}-${item.option}`;
}


// The cart lives in localStorage, outside React. This small store reads and
// writes it, and tells subscribed components when it changes — including
// changes made in another tab, so every open tab shows the same cart.
// v2: prices became Rupiah, so carts saved with dollar prices are left behind.
const STORAGE_KEY = "vega-cart-v2";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;

function readCart(): CartItem[] {
  if (cache === null) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      cache = Array.isArray(saved) ? saved : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

// Replaces the cart in this browser only (no account save).
function replaceLocal(items: CartItem[]) {
  cache = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {}
  listeners.forEach((notify) => notify());
}

// Every cart change goes through here: saved in the browser, and also to the
// account when someone is signed in.
function setItems(update: (prev: CartItem[]) => CartItem[]) {
  replaceLocal(update(readCart()));
  if (syncUserId) saveToAccount(syncUserId);
}

// ----- Account sync -----
// While signed in, the cart is also kept in Supabase (table "carts"), so it
// follows the user to other devices.
let syncUserId: string | null = null;
let latestUserId: string | null = null; // who is signed in right now
let loadingFor: string | null = null; // avoids loading the same cart twice at once
let mergeOnSignIn = false;
let saveQueue = Promise.resolve();

// Called by the sign-in / sign-up forms: the guest cart in this browser
// should be added to the account's cart once the sign-in completes.
export function mergeGuestCartOnSignIn() {
  mergeOnSignIn = true;
}

// Saves run one after another, always sending the latest cart.
function saveToAccount(userId: string) {
  saveQueue = saveQueue.then(async () => {
    const { error } = await createClient()
      .from("carts")
      .upsert({
        user_id: userId,
        items: readCart(),
        updated_at: new Date().toISOString(),
      });
    if (error) console.error("Could not save the cart to your account:", error.message);
  });
}

async function loadAccountCart(userId: string) {
  const { data, error } = await createClient()
    .from("carts")
    .select("items")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Array.isArray(data?.items) ? (data.items as CartItem[]) : EMPTY;
}

// Adds the guest items into the account cart; the same product/color/option
// becomes one line with the quantities added together.
function mergeCarts(account: CartItem[], guest: CartItem[]) {
  const merged = account.map((i) => ({ ...i }));
  for (const g of guest) {
    const match = merged.find((m) => itemKey(m) === itemKey(g));
    if (match) match.quantity += g.quantity;
    else merged.push({ ...g });
  }
  return merged;
}

function subscribe(notify: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null; // another tab changed the cart — re-read it
    notify();
  };
  listeners.add(notify);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // The server has no localStorage, so it renders an empty cart; the browser
  // then swaps in the saved one without a hydration mismatch.
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY);
  const [isOpen, setIsOpen] = useState(false);
  const { user, ready } = useAuth();
  const userId = user?.id ?? null;
  const firstCheck = useRef(true);

  // React to sign-in and sign-out:
  // - page load while signed in → show the account's saved cart
  // - signing in here → add the guest cart into the account cart
  // - signed in from another tab → that tab updates the shared cart, nothing to do
  // - signing out → empty the cart on this device (it stays in the account)
  useEffect(() => {
    if (!ready) return;
    latestUserId = userId;
    const isPageLoad = firstCheck.current;
    firstCheck.current = false;
    if (userId === syncUserId) return;

    if (!userId) {
      syncUserId = null;
      mergeOnSignIn = false;
      replaceLocal(EMPTY);
      return;
    }
    if (!isPageLoad && !mergeOnSignIn) {
      syncUserId = userId;
      return;
    }

    if (loadingFor === userId) return;
    loadingFor = userId;
    loadAccountCart(userId)
      .then((account) => {
        if (latestUserId !== userId) return; // signed out while loading
        syncUserId = userId;
        if (mergeOnSignIn) {
          mergeOnSignIn = false;
          setItems(() => mergeCarts(account, readCart()));
        } else {
          replaceLocal(account);
        }
      })
      .catch((error) =>
        console.error("Could not load the cart from your account:", error.message),
      )
      .finally(() => {
        loadingFor = null;
      });
  }, [ready, userId]);

  function addItem(item: NewItem) {
    setItems((prev) => {
      const key = itemKey(item);
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  }

  function updateQuantity(key: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (itemKey(i) === key ? { ...i, quantity } : i)),
    );
  }

  function clearCart() {
    setItems(() => []);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
