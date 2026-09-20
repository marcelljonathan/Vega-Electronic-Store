"use client";

import { useEffect, useState } from "react";
import { useCart, itemKey } from "./CartProvider";

export default function CartDrawer() {
  const {
    items,
    total,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [placed, setPlaced] = useState(false);

  // Lock background scrolling while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleClose() {
    closeCart();
    setPlaced(false);
  }

  function handleCheckout() {
    clearCart();
    setPlaced(true);
  }

  return (
    <div
      className={`fixed inset-0 z-100 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop — fades in/out */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Panel — slides in from the right */}
      <aside
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-bg shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button
            onClick={handleClose}
            aria-label="Close cart"
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
          >
            ✕
          </button>
        </div>

        {placed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-lg text-white">
              ✓
            </span>
            <span className="text-lg font-semibold">Order placed</span>
            <span className="max-w-[28ch] text-sm text-muted">
              Thanks for shopping with Vega. (This is a demo checkout — no
              payment was taken.)
            </span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted">
            <span className="text-sm">Your cart is empty.</span>
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
              {items.map((item) => {
                const key = itemKey(item);
                return (
                  <div key={key} className="flex gap-4">
                    <div className="grid h-20 w-14 shrink-0 place-items-center rounded-lg bg-card">
                      {item.kind === "watch" ? (
                        <div
                          className="watch"
                          data-size="thumb"
                          style={
                            {
                              "--band-a": item.screenA,
                              "--band-b": item.screenB,
                            } as React.CSSProperties
                          }
                        >
                          <div className="band" />
                          <div className="case">
                            <div className="face" />
                          </div>
                          <div className="crown" />
                        </div>
                      ) : (
                        <div
                          className="device"
                          data-size="thumb"
                          style={
                            {
                              "--screen-a": item.screenA,
                              "--screen-b": item.screenB,
                            } as React.CSSProperties
                          }
                        >
                          <div className="screen">
                            <div className="glare" />
                          </div>
                          <div className="cam" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="text-sm font-semibold">{item.name}</span>
                      <span className="text-xs text-muted">
                        {item.colorName} · {item.option}
                      </span>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            onClick={() =>
                              updateQuantity(key, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="px-2.5 py-1 text-muted transition-colors hover:text-fg"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(key, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="px-2.5 py-1 text-muted transition-colors hover:text-fg"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(key)}
                          className="text-xs text-muted transition-colors hover:text-fg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      $
                      {(item.unitPrice * item.quantity).toLocaleString("en-US")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 border-t border-line p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total</span>
                <span className="text-lg font-semibold">
                  ${total.toLocaleString("en-US")}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
