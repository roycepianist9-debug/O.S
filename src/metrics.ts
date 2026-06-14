import type { DB, IncomeStream } from "./types";
import { monthLabel, ymKey } from "./util";

const STREAM_COLORS: Record<IncomeStream, string> = {
  "HNWI / Private": "var(--accent)",
  Concerts: "var(--pink)",
  "Brand deals": "var(--blue)",
  Teaching: "var(--gold)",
  "Online school / shop": "var(--accent2)",
  "Grants / residencies": "#b06bff",
};

export type StreamSlice = {
  stream: IncomeStream;
  amount: number;
  pct: number;
  color: string;
};

export type CountrySlice = { country: string; flag: string; amount: number };

export type MonthPoint = { key: string; label: string; amount: number };

export function ytdIncome(db: DB): number {
  return db.income.reduce((s, i) => s + i.amount, 0);
}

export function monthIncome(db: DB, ref = new Date()): number {
  const key = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;
  return db.income
    .filter((i) => ymKey(i.date) === key)
    .reduce((s, i) => s + i.amount, 0);
}

export function nonprofitTarget(db: DB): number {
  return Math.round((ytdIncome(db) * db.profile.nonprofitTargetPct) / 100);
}

export function nonprofitGiven(db: DB): number {
  return db.contributions.reduce((s, c) => s + c.amount, 0);
}

export function nonprofitPctOfYTD(db: DB): number {
  const ytd = ytdIncome(db);
  if (ytd === 0) return 0;
  return (nonprofitGiven(db) / ytd) * 100;
}

export function byStream(db: DB): StreamSlice[] {
  const total = ytdIncome(db) || 1;
  const map = new Map<IncomeStream, number>();
  for (const i of db.income) {
    map.set(i.stream, (map.get(i.stream) ?? 0) + i.amount);
  }
  return [...map.entries()]
    .map(([stream, amount]) => ({
      stream,
      amount,
      pct: Math.round((amount / total) * 100),
      color: STREAM_COLORS[stream],
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function byCountry(db: DB): CountrySlice[] {
  const map = new Map<string, { flag: string; amount: number }>();
  for (const i of db.income) {
    const cur = map.get(i.country) ?? { flag: i.flag, amount: 0 };
    cur.amount += i.amount;
    map.set(i.country, cur);
  }
  return [...map.entries()]
    .map(([country, v]) => ({ country, flag: v.flag, amount: v.amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function monthlySeries(db: DB, months = 6): MonthPoint[] {
  const now = new Date();
  const points: MonthPoint[] = [];
  for (let k = months - 1; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const amount = db.income
      .filter((i) => ymKey(i.date) === key)
      .reduce((s, i) => s + i.amount, 0);
    points.push({ key, label: monthLabel(d.toISOString()), amount });
  }
  return points;
}

export function grantStats(db: DB) {
  const open = db.grants.filter((g) => g.stage !== "Awarded");
  const decided = db.grants.filter(
    (g) => g.stage === "Awarded" || g.stage === "Reporting",
  );
  const awarded = db.grants.filter((g) => g.stage === "Awarded");
  const potential = db.grants
    .filter((g) => g.stage !== "Awarded")
    .reduce((s, g) => s + g.amount, 0);
  const won = db.grants
    .filter((g) => g.stage === "Awarded")
    .reduce((s, g) => s + g.amount, 0);
  const winRate = decided.length
    ? Math.round((awarded.length / decided.length) * 100)
    : 0;
  return { openCount: open.length, potential, won, winRate };
}

export function contactStats(db: DB) {
  const active = db.contacts.filter((c) => c.warmth === "Active").length;
  const cooling = db.contacts.filter(
    (c) => c.warmth === "Cool" || c.warmth === "Cold",
  ).length;
  return { total: db.contacts.length, active, cooling };
}

export const WARMTH_LEVEL: Record<string, number> = {
  Cold: 1,
  Cool: 2,
  Warm: 3,
  Active: 4,
};
