"use client";

import { createContext, useContext, useState } from "react";

type Mode = "light" | "dark";
const ThemeContext = createContext<{ mode: Mode; toggle: () => void }>({
  mode: "light",
  toggle: () => {},
});

// The admin site's outer frame: Vega's colors and the light/dark mode.
export default function AdminFrame({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const toggle = () => setMode(mode === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <div
        data-mode={mode}
        className="min-h-screen w-full bg-bg font-sans text-fg transition-colors duration-500"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(ThemeContext);
}
