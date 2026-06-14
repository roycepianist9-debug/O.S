// ---- Royce OS data model ----
// One interconnected system: goals ↔ grants ↔ contacts ↔ revenue ↔ countries ↔ nonprofit.

export type Vertical =
  | "Music"
  | "K-pop"
  | "Content"
  | "Nonprofit"
  | "Teaching"
  | "Brand"
  | "Touring";

export type Warmth = "Cold" | "Cool" | "Warm" | "Active";

export type GrantStage =
  | "Research"
  | "Preparing"
  | "Submitted"
  | "Awarded"
  | "Reporting";

export type BookingStatus = "Inquiry" | "Holding" | "Confirmed" | "Completed";

export type BookingType =
  | "Classical"
  | "K-pop"
  | "HNWI / Private"
  | "Home concert"
  | "Street"
  | "Session"
  | "Teaching";

export type ContentStatus = "Idea" | "Scripted" | "Filming" | "Editing" | "Published";

export type ContentChannel = "Travel" | "Piano" | "Integrated" | "Shorts";

export type IncomeStream =
  | "HNWI / Private"
  | "Concerts"
  | "Brand deals"
  | "Teaching"
  | "Online school / shop"
  | "Grants / residencies";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type Milestone = {
  id: string;
  label: string;
  done: boolean;
};

export type Interaction = {
  id: string;
  date: string;
  note: string;
};

export type Goal = {
  id: string;
  title: string;
  vertical: Vertical;
  progress: number; // 0-100
  target: string;
  timeframe: string;
  milestones: Milestone[];
};

export type Grant = {
  id: string;
  name: string;
  country: string; // matches Country.name
  flag: string;
  type: string;
  stage: GrantStage;
  amount: number;
  due: string; // ISO date or ""
  checklist: ChecklistItem[];
  notes: string;
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  country: string;
  flag: string;
  warmth: Warmth;
  lastContact: string; // ISO date
  tags: string[];
  nextAction: string;
  history: Interaction[];
};

export type Income = {
  id: string;
  label: string;
  stream: IncomeStream;
  country: string;
  flag: string;
  amount: number;
  date: string; // ISO date
};

export type Booking = {
  id: string;
  title: string;
  type: BookingType;
  city: string;
  country: string;
  flag: string;
  date: string; // ISO date
  fee: number;
  status: BookingStatus;
  notes: string;
};

export type Content = {
  id: string;
  title: string;
  channel: ContentChannel;
  status: ContentStatus;
  date: string; // ISO date
  notes: string;
};

export type Arrangement = {
  id: string;
  title: string;
  artist: string;
  category: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  inShop: boolean;
  price: number;
  usedInSetlists: number;
};

export type Contribution = {
  id: string;
  cause: string;
  region: string;
  amount: number;
  date: string; // ISO date
};

export type Country = {
  id: string;
  name: string;
  flag: string;
  status: "Active" | "Building" | "Exploring";
  roadmap: ChecklistItem[];
  notes: string;
};

export type Profile = {
  name: string;
  alias: string;
  base: string;
  born: number;
  languages: string[];
  nonprofitTargetPct: number; // 15
  energyCommittedPct: number; // capacity
};

export type DB = {
  profile: Profile;
  goals: Goal[];
  grants: Grant[];
  contacts: Contact[];
  income: Income[];
  bookings: Booking[];
  content: Content[];
  arrangements: Arrangement[];
  contributions: Contribution[];
  countries: Country[];
};

export type CollectionKey =
  | "goals"
  | "grants"
  | "contacts"
  | "income"
  | "bookings"
  | "content"
  | "arrangements"
  | "contributions"
  | "countries";
