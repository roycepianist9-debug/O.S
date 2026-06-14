/* eslint-disable react-refresh/only-export-components */
import { useState, type ReactNode } from "react";

export function Sheet({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="scrim"
      onClick={onClose}
      role="presentation"
    >
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
};

export type FormValues = Record<string, string>;

export function FormSheet({
  title,
  fields,
  initial,
  submitLabel = "Save",
  onSubmit,
  onClose,
  onDelete,
}: {
  title: string;
  fields: FieldDef[];
  initial?: FormValues;
  submitLabel?: string;
  onSubmit: (values: FormValues) => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [values, setValues] = useState<FormValues>(() => {
    const base: FormValues = {};
    for (const f of fields) {
      base[f.name] = initial?.[f.name] ?? f.defaultValue ?? "";
    }
    return base;
  });

  const set = (name: string, v: string) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  const submit = () => {
    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) {
        return; // silently block; required fields highlighted by browser otherwise
      }
    }
    onSubmit(values);
  };

  return (
    <Sheet title={title} onClose={onClose}>
      {fields.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={`f-${f.name}`}>{f.label}</label>
          {f.type === "select" ? (
            <select
              id={`f-${f.name}`}
              value={values[f.name]}
              onChange={(e) => set(f.name, e.target.value)}
            >
              <option value="">Select…</option>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              id={`f-${f.name}`}
              value={values[f.name]}
              placeholder={f.placeholder}
              onChange={(e) => set(f.name, e.target.value)}
            />
          ) : (
            <input
              id={`f-${f.name}`}
              type={f.type}
              value={values[f.name]}
              placeholder={f.placeholder}
              onChange={(e) => set(f.name, e.target.value)}
            />
          )}
        </div>
      ))}
      <button className="btn" onClick={submit}>
        {submitLabel}
      </button>
      {onDelete ? (
        <button
          className="btn danger"
          style={{ marginTop: 10 }}
          onClick={onDelete}
        >
          Delete
        </button>
      ) : null}
    </Sheet>
  );
}

export function Warmth({ level }: { level: number }) {
  return (
    <span className="warm" aria-label={`warmth ${level} of 4`}>
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={i <= level ? "on" : ""} />
      ))}
    </span>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="bar">
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}

const COLORS = [
  "var(--accent)",
  "var(--accent2)",
  "var(--pink)",
  "var(--blue)",
  "var(--gold)",
  "var(--purple)",
];

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return COLORS[h % COLORS.length];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
