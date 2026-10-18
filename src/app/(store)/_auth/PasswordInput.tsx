"use client";

import { useState } from "react";
import { inputClass } from "../FormField";

// A password field with a show / hide toggle.
export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  hasError,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  hasError: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`${inputClass(hasError)} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted transition-colors hover:text-fg"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {visible && <line x1="4" y1="4" x2="20" y2="20" />}
        </svg>
      </button>
    </div>
  );
}
