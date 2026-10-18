import type { AudioIconName } from "@/lib/audio";

// The audio icon set — shared by key specs and the feature grid.
export default function AudioIcon({ name }: { name: AudioIconName }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "sound") {
    return (
      <svg {...common}>
        <path d="M4 9v6h4l5 4V5L8 9z" />
        <path d="M17 8a5 5 0 0 1 0 8" />
      </svg>
    );
  }
  if (name === "battery") {
    return (
      <svg {...common}>
        <rect x="2.5" y="8" width="16" height="8" rx="2" />
        <line x1="21" y1="10.5" x2="21" y2="13.5" />
        <line x1="6" y1="12" x2="11" y2="12" />
      </svg>
    );
  }
  if (name === "water") {
    return (
      <svg {...common}>
        <path d="M12 3.2s6 6.4 6 10.8a6 6 0 0 1-12 0c0-4.4 6-10.8 6-10.8z" />
      </svg>
    );
  }
  if (name === "mic") {
    return (
      <svg {...common}>
        <rect x="9" y="2.5" width="6" height="11" rx="3" />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
        <line x1="12" y1="17.5" x2="12" y2="21" />
      </svg>
    );
  }
  if (name === "anc") {
    return (
      <svg {...common}>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <rect x="3" y="13" width="4" height="7" rx="1.6" />
        <rect x="17" y="13" width="4" height="7" rx="1.6" />
      </svg>
    );
  }
  if (name === "spatial") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18" />
      </svg>
    );
  }
  if (name === "charge") {
    return (
      <svg {...common}>
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
      </svg>
    );
  }
  // fit
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
