export type City = {
  id: string;
  country: string;
  city: string;
  dateRange: string;
  monthlyAccommodation: number;
  foodBudget: number;
  transportBudget: number;
  totalMonthlyCost: number;
  buskingScore: number;
  sponsorScore: number;
  networkScore: number;
  safetyScore: number;
  visaEase: number;
  overallScore: number;
  recommendedStayDays: [number, number];
  notes: string;
};

export type Organization = {
  id: string;
  name: string;
  type:
    | "Brand"
    | "Embassy"
    | "Foundation"
    | "Festival"
    | "Cultural Center"
    | "University"
    | "NGO"
    | "Media"
    | "Government";
  country: string;
  city: string;
  fitScore: number;
  website: string;
  notes: string;
};

export type Opportunity = {
  id: string;
  title: string;
  type: "Festival" | "Residency" | "Grant" | "Competition" | "Collaboration" | "Embassy Program" | "Sponsorship" | "Media Appearance" | "Concert";
  city: string;
  country: string;
  organizationId: string;
  estimatedValue: number;
  deadline: string;
  status: "Research" | "Contacted" | "Applied" | "Proposal" | "Won" | "Lost";
  priorityScore: number;
};

export type OutreachCampaign = {
  id: string;
  name: string;
  targetCount: number;
  sentCount: number;
  cadenceEveryDays: number;
  cadenceQuantity: number;
  startDate: string;
  deadline: string;
  replies: number;
};

export type Task = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  progress: [number, number];
};

export type Transaction = {
  id: string;
  date: string;
  type: "expense" | "income";
  category: "Accommodation" | "Food" | "Transport" | "Equipment" | "Sponsorship" | "Concert Income" | "Grants" | "Other";
  amount: number;
  description: string;
};

export type ContentProject = {
  id: string;
  platform: "YouTube" | "Instagram" | "TikTok" | "Blog";
  type: string;
  published: number;
  target: number;
};

export type RecentActivity = {
  id: string;
  label: string;
  when: string;
};

export const cities: City[] = [
  {
    id: "shanghai",
    country: "China",
    city: "Shanghai",
    dateRange: "May 13 – Jun 7",
    monthlyAccommodation: 620,
    foodBudget: 240,
    transportBudget: 54,
    totalMonthlyCost: 914,
    buskingScore: 6,
    sponsorScore: 8,
    networkScore: 9,
    safetyScore: 9,
    visaEase: 6,
    overallScore: 7.6,
    recommendedStayDays: [18, 26],
    notes: "Strong luxury and education brand density; public performance rules need local validation.",
  },
  {
    id: "taipei",
    country: "Taiwan",
    city: "Taipei",
    dateRange: "Jun 8 – Jun 22",
    monthlyAccommodation: 430,
    foodBudget: 270,
    transportBudget: 42,
    totalMonthlyCost: 742,
    buskingScore: 7,
    sponsorScore: 8,
    networkScore: 9,
    safetyScore: 9,
    visaEase: 8,
    overallScore: 8.2,
    recommendedStayDays: [14, 30],
    notes: "Best near-term blend of cost control, street performance options, cultural centers, and music schools.",
  },
  {
    id: "seoul",
    country: "South Korea",
    city: "Seoul",
    dateRange: "Jun 23 – Jul 13",
    monthlyAccommodation: 760,
    foodBudget: 330,
    transportBudget: 58,
    totalMonthlyCost: 1148,
    buskingScore: 8,
    sponsorScore: 9,
    networkScore: 9,
    safetyScore: 9,
    visaEase: 7,
    overallScore: 8.4,
    recommendedStayDays: [18, 28],
    notes: "Highest music-industry upside; use content collaborations to offset higher accommodation.",
  },
  {
    id: "bangkok",
    country: "Thailand",
    city: "Bangkok",
    dateRange: "Jul 14 – Aug 5",
    monthlyAccommodation: 360,
    foodBudget: 210,
    transportBudget: 46,
    totalMonthlyCost: 616,
    buskingScore: 7,
    sponsorScore: 6,
    networkScore: 7,
    safetyScore: 7,
    visaEase: 8,
    overallScore: 7,
    recommendedStayDays: [21, 40],
    notes: "Excellent runway extender with solid venue and tourism partnership options.",
  },
  {
    id: "hcmc",
    country: "Vietnam",
    city: "Ho Chi Minh City",
    dateRange: "Aug 6 – Aug 27",
    monthlyAccommodation: 310,
    foodBudget: 190,
    transportBudget: 36,
    totalMonthlyCost: 536,
    buskingScore: 6,
    sponsorScore: 6,
    networkScore: 7,
    safetyScore: 7,
    visaEase: 7,
    overallScore: 6.6,
    recommendedStayDays: [18, 35],
    notes: "Low burn rate and emerging cultural scene; target hotels, cafés, schools, and local media.",
  },
  {
    id: "kuala-lumpur",
    country: "Malaysia",
    city: "Kuala Lumpur",
    dateRange: "Aug 28 – Sep 17",
    monthlyAccommodation: 390,
    foodBudget: 220,
    transportBudget: 48,
    totalMonthlyCost: 658,
    buskingScore: 5,
    sponsorScore: 7,
    networkScore: 7,
    safetyScore: 8,
    visaEase: 8,
    overallScore: 7,
    recommendedStayDays: [18, 30],
    notes: "Good bridge city for embassy, university, cultural center, and nonprofit meetings.",
  },
];

export const organizations: Organization[] = [
  {
    id: "yamaha-taiwan",
    name: "Yamaha Music Taiwan",
    type: "Brand",
    country: "Taiwan",
    city: "Taipei",
    fitScore: 94,
    website: "https://tw.yamaha.com",
    notes: "Piano brand with education and performance alignment.",
  },
  {
    id: "taipei-music-center",
    name: "Taipei Music Center",
    type: "Cultural Center",
    country: "Taiwan",
    city: "Taipei",
    fitScore: 91,
    website: "https://tmc.taipei",
    notes: "Potential venue, media, and collaboration gateway.",
  },
  {
    id: "korean-cultural-center",
    name: "Korean Cultural Center",
    type: "Cultural Center",
    country: "South Korea",
    city: "Seoul",
    fitScore: 88,
    website: "https://www.kocis.go.kr",
    notes: "Cultural exchange and artist-program fit.",
  },
  {
    id: "seoul-arts-foundation",
    name: "Seoul Foundation for Arts and Culture",
    type: "Foundation",
    country: "South Korea",
    city: "Seoul",
    fitScore: 86,
    website: "https://www.sfac.or.kr",
    notes: "Grant, residency, and artist-networking target.",
  },
  {
    id: "taiwan-tourism",
    name: "Taiwan Tourism Administration",
    type: "Government",
    country: "Taiwan",
    city: "Taipei",
    fitScore: 82,
    website: "https://eng.taiwan.net.tw",
    notes: "Travel-content partnership target.",
  },
  {
    id: "steinway-asia",
    name: "Steinway Gallery Asia",
    type: "Brand",
    country: "Regional",
    city: "Asia Pacific",
    fitScore: 80,
    website: "https://www.steinway.com",
    notes: "Premium piano alignment; later-stage proposal target.",
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "taipei-street-series",
    title: "Taipei street piano collaboration series",
    type: "Collaboration",
    city: "Taipei",
    country: "Taiwan",
    organizationId: "taipei-music-center",
    estimatedValue: 1200,
    deadline: "2025-06-16",
    status: "Contacted",
    priorityScore: 93,
  },
  {
    id: "yamaha-tour-sponsor",
    title: "Yamaha portable piano travel sponsorship",
    type: "Sponsorship",
    city: "Taipei",
    country: "Taiwan",
    organizationId: "yamaha-taiwan",
    estimatedValue: 3500,
    deadline: "2025-06-20",
    status: "Research",
    priorityScore: 91,
  },
  {
    id: "seoul-cultural-grant",
    title: "Seoul cultural exchange micro-grant",
    type: "Grant",
    city: "Seoul",
    country: "South Korea",
    organizationId: "seoul-arts-foundation",
    estimatedValue: 2500,
    deadline: "2025-07-01",
    status: "Research",
    priorityScore: 86,
  },
  {
    id: "korean-center-recital",
    title: "Mini-recital and creator interview",
    type: "Embassy Program",
    city: "Seoul",
    country: "South Korea",
    organizationId: "korean-cultural-center",
    estimatedValue: 900,
    deadline: "2025-06-28",
    status: "Contacted",
    priorityScore: 84,
  },
  {
    id: "taiwan-tourism-content",
    title: "Taiwan travel-with-music content partnership",
    type: "Media Appearance",
    city: "Taipei",
    country: "Taiwan",
    organizationId: "taiwan-tourism",
    estimatedValue: 1800,
    deadline: "2025-06-18",
    status: "Proposal",
    priorityScore: 82,
  },
];

export const outreachCampaigns: OutreachCampaign[] = [
  {
    id: "sponsor-1000",
    name: "1,000 sponsor emails by January",
    targetCount: 1000,
    sentCount: 231,
    cadenceEveryDays: 2,
    cadenceQuantity: 30,
    startDate: "2025-05-25",
    deadline: "2026-01-01",
    replies: 19,
  },
  {
    id: "taipei-culture",
    name: "Taipei cultural centers",
    targetCount: 90,
    sentCount: 24,
    cadenceEveryDays: 2,
    cadenceQuantity: 12,
    startDate: "2025-05-25",
    deadline: "2025-06-22",
    replies: 5,
  },
];

export const tasks: Task[] = [
  {
    id: "send-sponsor-emails",
    title: "Send 15 sponsor emails",
    priority: "High",
    due: "Today",
    progress: [0, 15],
  },
  {
    id: "contact-cultural-centers",
    title: "Contact 3 cultural centers",
    priority: "High",
    due: "Today",
    progress: [0, 3],
  },
  {
    id: "upload-reel",
    title: "Upload piano reel to YouTube",
    priority: "Medium",
    due: "Today",
    progress: [0, 1],
  },
  {
    id: "follow-up-taiwan",
    title: "Follow up with Taiwan lead",
    priority: "Medium",
    due: "Tomorrow",
    progress: [0, 1],
  },
];

export const transactions: Transaction[] = [
  {
    id: "rent",
    date: "2025-05-03",
    type: "expense",
    category: "Accommodation",
    amount: 210,
    description: "Shanghai room share",
  },
  {
    id: "food",
    date: "2025-05-08",
    type: "expense",
    category: "Food",
    amount: 98,
    description: "Meals and groceries",
  },
  {
    id: "taxi",
    date: "2025-05-13",
    type: "expense",
    category: "Transport",
    amount: 62,
    description: "Taxi and subway",
  },
  {
    id: "other",
    date: "2025-05-16",
    type: "expense",
    category: "Other",
    amount: 57,
    description: "SIM card and supplies",
  },
  {
    id: "mini-concert",
    date: "2025-05-19",
    type: "income",
    category: "Concert Income",
    amount: 180,
    description: "Private salon performance",
  },
];

export const contentProjects: ContentProject[] = [
  {
    id: "youtube",
    platform: "YouTube",
    type: "Videos",
    published: 18,
    target: 100,
  },
  {
    id: "instagram",
    platform: "Instagram",
    type: "Posts",
    published: 47,
    target: 100,
  },
  {
    id: "blog",
    platform: "Blog",
    type: "Posts",
    published: 6,
    target: 24,
  },
];

export const recentActivity: RecentActivity[] = [
  {
    id: "sent-emails",
    label: "Sent 12 sponsor emails",
    when: "2h ago",
  },
  {
    id: "added-contact",
    label: "Added contact: Taipei Music Center",
    when: "5h ago",
  },
  {
    id: "expense",
    label: "Updated expense: €45 taxi",
    when: "Yesterday",
  },
  {
    id: "opportunity",
    label: "New opportunity: Piano Festival Seoul",
    when: "2 days ago",
  },
];

export const routeCoordinates = [
  { id: "shanghai", x: 72, y: 28 },
  { id: "taipei", x: 66, y: 46 },
  { id: "seoul", x: 78, y: 14 },
  { id: "bangkok", x: 36, y: 78 },
  { id: "hcmc", x: 48, y: 86 },
  { id: "kuala-lumpur", x: 30, y: 88 },
];
