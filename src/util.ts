export const euro = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function euroK(n: number): string {
  if (Math.abs(n) >= 1000) {
    return `€${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  }
  return euro.format(n);
}

export function shortDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function monthLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short" });
}

export function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
}

export function dueLabel(iso: string): { text: string; urgent: boolean } | null {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days < 0) return { text: `${Math.abs(days)}d ago`, urgent: false };
  if (days === 0) return { text: "Today", urgent: true };
  return { text: `Due ${days}d`, urgent: days <= 7 };
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function ymKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
