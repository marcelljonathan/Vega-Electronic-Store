"use client";

import { useState } from "react";
import Nav from "./Nav";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";
import Assistant from "./Assistant";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  return (
    <div
      data-mode={mode}
      className="min-h-screen w-full bg-bg font-sans text-fg transition-colors duration-500"
    >
      <Nav mode={mode} setMode={setMode} />
      <main className="pb-16">{children}</main>
      <Footer />
      <CartDrawer />
      <Assistant />
    </div>
  );
}
