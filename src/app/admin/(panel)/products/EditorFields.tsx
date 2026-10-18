import { Field, inputClass } from "@/app/(store)/FormField";

// Small building blocks for the product editor. Every field is identified by
// its "path" in the product (e.g. "colors.1.screenA"), which is also how
// save errors point back at it.

export const fid = (path: string) => `f-${path.replaceAll(".", "-")}`;

const invalidProps = (path: string, error?: string) => ({
  id: fid(path),
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${fid(path)}-error` : undefined,
});

export function Section({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="flex scroll-mt-6 flex-col gap-5 rounded-2xl border border-line p-5 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function TextInput({
  path,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  list,
}: {
  path: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  list?: string;
}) {
  return (
    <Field id={fid(path)} label={label} error={error} hint={hint}>
      <input
        {...invalidProps(path, error)}
        type="text"
        value={value}
        list={list}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(!!error)} placeholder:text-muted/60`}
      />
    </Field>
  );
}

export function TextArea({
  path,
  label,
  value,
  onChange,
  error,
  rows = 3,
}: {
  path: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
}) {
  return (
    <Field id={fid(path)} label={label} error={error}>
      <textarea
        {...invalidProps(path, error)}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(!!error)} resize-y`}
      />
    </Field>
  );
}

// Whole numbers shown the Indonesian way (14.399.000); typing keeps digits only.
export function DigitsInput({
  path,
  label,
  value,
  onChange,
  error,
  hint,
  prefix,
}: {
  path: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  hint?: string;
  prefix?: string;
}) {
  const shown = Number.isFinite(value) && value > 0 ? value.toLocaleString("id-ID") : "";
  return (
    <Field id={fid(path)} label={label} error={error} hint={hint}>
      <div
        className={`flex items-center rounded-xl border bg-bg transition-colors focus-within:border-accent ${
          error ? "border-red-500" : "border-line"
        }`}
      >
        {prefix && (
          <span className="border-r border-line px-3 text-sm text-muted">{prefix}</span>
        )}
        <input
          {...invalidProps(path, error)}
          type="text"
          inputMode="numeric"
          value={shown}
          placeholder="0"
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 13);
            onChange(digits ? Number(digits) : 0);
          }}
          className="w-full min-w-0 bg-transparent px-3 py-3 text-sm tabular-nums outline-none placeholder:text-muted/60"
        />
      </div>
    </Field>
  );
}

export function SelectInput<T extends string>({
  path,
  label,
  value,
  options,
  onChange,
}: {
  path: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Field id={fid(path)} label={label}>
      <select
        id={fid(path)}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={inputClass(false)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

const HEX = /^#[0-9a-fA-F]{6}$/;

// One shade: a color picker plus its hex code, kept in sync.
export function ShadeInput({
  path,
  label,
  value,
  onChange,
  error,
}: {
  path: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-bg py-1.5 pr-2 pl-1.5 ${
          error ? "border-red-500" : "border-line"
        }`}
      >
        <input
          type="color"
          aria-label={`${label} picker`}
          value={HEX.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <input
          {...invalidProps(path, error)}
          type="text"
          aria-label={label}
          value={value}
          maxLength={7}
          onChange={(e) => onChange(e.target.value.trim())}
          className="w-20 bg-transparent font-mono text-sm uppercase outline-none"
        />
      </div>
      {error && (
        <span id={`${fid(path)}-error`} className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

// ↑ ↓ ✕ buttons for a row in a list.
export function RowButtons({
  index,
  length,
  onMove,
  onRemove,
  what,
  minLength = 0,
}: {
  index: number;
  length: number;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
  what: string;
  minLength?: number;
}) {
  const btn =
    "grid h-8 w-8 place-items-center rounded-lg border border-line text-xs text-muted transition-colors hover:text-fg disabled:opacity-30";
  return (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        onClick={() => onMove(index, -1)}
        disabled={index === 0}
        aria-label={`Move ${what} up`}
        className={btn}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => onMove(index, 1)}
        disabled={index === length - 1}
        aria-label={`Move ${what} down`}
        className={btn}
      >
        ↓
      </button>
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={length <= minLength}
        aria-label={`Remove ${what}`}
        className={`${btn} hover:border-red-500 hover:text-red-500`}
      >
        ✕
      </button>
    </div>
  );
}

export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start rounded-full border border-dashed border-line px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

export function ListError({ error }: { error?: string }) {
  return error ? <p className="text-sm text-red-500">{error}</p> : null;
}
