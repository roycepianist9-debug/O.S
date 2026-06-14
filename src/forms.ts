import type {
  Arrangement,
  Booking,
  Contact,
  Content,
  Contribution,
  Country,
  Goal,
  Grant,
  Income,
} from "./types";
import type { FieldDef, FormValues } from "./ui";
import { todayISO, uid } from "./util";

export const COUNTRY_FLAGS: Record<string, string> = {
  "South Korea": "🇰🇷",
  Switzerland: "🇨🇭",
  Monaco: "🇲🇨",
  Japan: "🇯🇵",
  USA: "🇺🇸",
  Taiwan: "🇹🇼",
  "Hong Kong": "🇭🇰",
  France: "🇫🇷",
  Sweden: "🇸🇪",
  Vietnam: "🇻🇳",
  Thailand: "🇹🇭",
  Philippines: "🇵🇭",
  Global: "🌍",
  Other: "🌏",
};

export const COUNTRY_OPTIONS = Object.keys(COUNTRY_FLAGS);

export function flagFor(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🌏";
}

function num(v: string): number {
  const n = Number(v.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ---------- Goals ----------
export const VERTICALS = [
  "Music",
  "K-pop",
  "Content",
  "Nonprofit",
  "Teaching",
  "Brand",
  "Touring",
];

export const goalFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "vertical", label: "Vertical", type: "select", options: VERTICALS, required: true },
  { name: "target", label: "Target", type: "text" },
  { name: "timeframe", label: "Timeframe", type: "text", placeholder: "2026" },
  { name: "progress", label: "Progress %", type: "number", defaultValue: "0" },
];

export function goalToValues(g: Goal): FormValues {
  return {
    title: g.title,
    vertical: g.vertical,
    target: g.target,
    timeframe: g.timeframe,
    progress: String(g.progress),
  };
}

export function buildGoal(v: FormValues, id?: string): Goal {
  return {
    id: id ?? uid("g"),
    title: v.title,
    vertical: (v.vertical || "Music") as Goal["vertical"],
    target: v.target,
    timeframe: v.timeframe || "2026",
    progress: Math.max(0, Math.min(100, num(v.progress))),
    milestones: [],
  };
}

// ---------- Grants ----------
export const GRANT_STAGES = [
  "Research",
  "Preparing",
  "Submitted",
  "Awarded",
  "Reporting",
];

export const grantFields: FieldDef[] = [
  { name: "name", label: "Grant name", type: "text", required: true },
  { name: "country", label: "Country", type: "select", options: COUNTRY_OPTIONS, required: true },
  { name: "type", label: "Type", type: "text", placeholder: "Residency, crossover…" },
  { name: "stage", label: "Stage", type: "select", options: GRANT_STAGES, required: true },
  { name: "amount", label: "Amount (€)", type: "number", required: true },
  { name: "due", label: "Deadline", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export function grantToValues(g: Grant): FormValues {
  return {
    name: g.name,
    country: g.country,
    type: g.type,
    stage: g.stage,
    amount: String(g.amount),
    due: g.due,
    notes: g.notes,
  };
}

export function buildGrant(v: FormValues, id?: string): Grant {
  return {
    id: id ?? uid("gr"),
    name: v.name,
    country: v.country,
    flag: flagFor(v.country),
    type: v.type,
    stage: (v.stage || "Research") as Grant["stage"],
    amount: num(v.amount),
    due: v.due,
    notes: v.notes,
    checklist: [],
  };
}

// ---------- Contacts ----------
export const WARMTHS = ["Cold", "Cool", "Warm", "Active"];

export const contactFields: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "role", label: "Role", type: "text", placeholder: "Producer, A&R…" },
  { name: "country", label: "Country", type: "select", options: COUNTRY_OPTIONS, required: true },
  { name: "warmth", label: "Warmth", type: "select", options: WARMTHS, required: true },
  { name: "tags", label: "Tags (comma separated)", type: "text" },
  { name: "nextAction", label: "Next action", type: "textarea" },
];

export function contactToValues(c: Contact): FormValues {
  return {
    name: c.name,
    role: c.role,
    country: c.country,
    warmth: c.warmth,
    tags: c.tags.join(", "),
    nextAction: c.nextAction,
  };
}

export function buildContact(v: FormValues, id?: string): Contact {
  return {
    id: id ?? uid("ct"),
    name: v.name,
    role: v.role,
    country: v.country,
    flag: flagFor(v.country),
    warmth: (v.warmth || "Warm") as Contact["warmth"],
    lastContact: todayISO(),
    tags: v.tags
      ? v.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    nextAction: v.nextAction,
    history: [],
  };
}

// ---------- Income ----------
export const INCOME_STREAMS = [
  "HNWI / Private",
  "Concerts",
  "Brand deals",
  "Teaching",
  "Online school / shop",
  "Grants / residencies",
];

export const incomeFields: FieldDef[] = [
  { name: "label", label: "Description", type: "text", required: true },
  { name: "stream", label: "Stream", type: "select", options: INCOME_STREAMS, required: true },
  { name: "country", label: "Country", type: "select", options: COUNTRY_OPTIONS, required: true },
  { name: "amount", label: "Amount (€)", type: "number", required: true },
  { name: "date", label: "Date", type: "date", defaultValue: todayISO() },
];

export function incomeToValues(i: Income): FormValues {
  return {
    label: i.label,
    stream: i.stream,
    country: i.country,
    amount: String(i.amount),
    date: i.date,
  };
}

export function buildIncome(v: FormValues, id?: string): Income {
  return {
    id: id ?? uid("in"),
    label: v.label,
    stream: (v.stream || "Concerts") as Income["stream"],
    country: v.country,
    flag: flagFor(v.country),
    amount: num(v.amount),
    date: v.date || todayISO(),
  };
}

// ---------- Bookings ----------
export const BOOKING_TYPES = [
  "Classical",
  "K-pop",
  "HNWI / Private",
  "Home concert",
  "Street",
  "Session",
  "Teaching",
];
export const BOOKING_STATUSES = ["Inquiry", "Holding", "Confirmed", "Completed"];

export const bookingFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "type", label: "Type", type: "select", options: BOOKING_TYPES, required: true },
  { name: "city", label: "City", type: "text" },
  { name: "country", label: "Country", type: "select", options: COUNTRY_OPTIONS, required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "fee", label: "Fee (€)", type: "number", defaultValue: "0" },
  { name: "status", label: "Status", type: "select", options: BOOKING_STATUSES, required: true },
  { name: "notes", label: "Notes", type: "textarea" },
];

export function bookingToValues(b: Booking): FormValues {
  return {
    title: b.title,
    type: b.type,
    city: b.city,
    country: b.country,
    date: b.date,
    fee: String(b.fee),
    status: b.status,
    notes: b.notes,
  };
}

export function buildBooking(v: FormValues, id?: string): Booking {
  return {
    id: id ?? uid("bk"),
    title: v.title,
    type: (v.type || "Classical") as Booking["type"],
    city: v.city,
    country: v.country,
    flag: flagFor(v.country),
    date: v.date || todayISO(),
    fee: num(v.fee),
    status: (v.status || "Inquiry") as Booking["status"],
    notes: v.notes,
  };
}

// ---------- Content ----------
export const CONTENT_CHANNELS = ["Travel", "Piano", "Integrated", "Shorts"];
export const CONTENT_STATUSES = [
  "Idea",
  "Scripted",
  "Filming",
  "Editing",
  "Published",
];

export const contentFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "channel", label: "Channel", type: "select", options: CONTENT_CHANNELS, required: true },
  { name: "status", label: "Status", type: "select", options: CONTENT_STATUSES, required: true },
  { name: "date", label: "Target date", type: "date", defaultValue: todayISO() },
  { name: "notes", label: "Notes", type: "textarea" },
];

export function contentToValues(c: Content): FormValues {
  return {
    title: c.title,
    channel: c.channel,
    status: c.status,
    date: c.date,
    notes: c.notes,
  };
}

export function buildContent(v: FormValues, id?: string): Content {
  return {
    id: id ?? uid("co"),
    title: v.title,
    channel: (v.channel || "Travel") as Content["channel"],
    status: (v.status || "Idea") as Content["status"],
    date: v.date || todayISO(),
    notes: v.notes,
  };
}

// ---------- Arrangements ----------
export const DIFFICULTIES = ["Easy", "Intermediate", "Advanced"];

export const arrangementFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "artist", label: "Artist", type: "text" },
  { name: "category", label: "Category", type: "text", placeholder: "K-pop, Classical…" },
  { name: "difficulty", label: "Difficulty", type: "select", options: DIFFICULTIES, required: true },
  { name: "inShop", label: "In shop?", type: "select", options: ["Yes", "No"], required: true },
  { name: "price", label: "Price (€)", type: "number", defaultValue: "0" },
];

export function arrangementToValues(a: Arrangement): FormValues {
  return {
    title: a.title,
    artist: a.artist,
    category: a.category,
    difficulty: a.difficulty,
    inShop: a.inShop ? "Yes" : "No",
    price: String(a.price),
  };
}

export function buildArrangement(v: FormValues, id?: string): Arrangement {
  return {
    id: id ?? uid("ar"),
    title: v.title,
    artist: v.artist,
    category: v.category || "Other",
    difficulty: (v.difficulty || "Intermediate") as Arrangement["difficulty"],
    inShop: v.inShop === "Yes",
    price: num(v.price),
    usedInSetlists: 0,
  };
}

// ---------- Contributions ----------
export const contributionFields: FieldDef[] = [
  { name: "cause", label: "Cause", type: "text", required: true },
  { name: "region", label: "Region", type: "text", placeholder: "Vietnam, Thailand…" },
  { name: "amount", label: "Amount (€)", type: "number", required: true },
  { name: "date", label: "Date", type: "date", defaultValue: todayISO() },
];

export function contributionToValues(c: Contribution): FormValues {
  return {
    cause: c.cause,
    region: c.region,
    amount: String(c.amount),
    date: c.date,
  };
}

export function buildContribution(v: FormValues, id?: string): Contribution {
  return {
    id: id ?? uid("cn"),
    cause: v.cause,
    region: v.region,
    amount: num(v.amount),
    date: v.date || todayISO(),
  };
}

// ---------- Countries ----------
export const COUNTRY_STATUSES = ["Active", "Building", "Exploring"];

export const countryFields: FieldDef[] = [
  { name: "name", label: "Country", type: "select", options: COUNTRY_OPTIONS, required: true },
  { name: "status", label: "Status", type: "select", options: COUNTRY_STATUSES, required: true },
  { name: "notes", label: "Notes", type: "textarea" },
];

export function countryToValues(c: Country): FormValues {
  return { name: c.name, status: c.status, notes: c.notes };
}

export function buildCountry(v: FormValues, id?: string): Country {
  return {
    id: id ?? uid("c"),
    name: v.name,
    flag: flagFor(v.name),
    status: (v.status || "Exploring") as Country["status"],
    roadmap: [],
    notes: v.notes,
  };
}
