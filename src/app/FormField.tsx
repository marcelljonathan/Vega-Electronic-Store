// Shared form pieces used by the contact form and checkout.
// A label + control + (optional) error message.
export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && (
        <span id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

export function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-bg px-4 py-3 text-sm outline-none transition-colors focus:border-accent ${
    hasError ? "border-red-500" : "border-line"
  }`;
}
