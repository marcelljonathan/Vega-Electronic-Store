"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";

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

function setItems(update: (prev: CartItem[]) => CartItem[]) {
  cache = update(readCart());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {}
  listeners.forEach((notify) => notify());
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
