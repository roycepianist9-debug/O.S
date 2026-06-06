export type OperatingProfile = {
  currentCash: number;
  monthlyBudget: number;
  sponsorTarget: number;
  sponsorSent: number;
  sponsorDeadline: string;
  sponsorCadenceQuantity: number;
  sponsorCadenceEveryDays: number;
  currentCityId: string;
  updatedAt: string;
};

export type MonthlyExpense = {
  id: string;
  category: string;
  amount: number;
  notes: string;
};

export type PlannedCityRecord = {
  id: string;
  city: string;
  country: string;
  dateRange: string;
  totalMonthlyCost: number;
  opportunityScore: number;
  status: "Current" | "Planned";
  notes: string;
};

export type CollaborationRecord = {
  id: string;
  title: string;
  partner: string;
  city: string;
  status: "Research" | "Contacted" | "In Conversation" | "Confirmed";
  estimatedValue: number;
  nextStep: string;
};

export type OrganizationRecord = {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string;
  fitScore: number;
  nextAction: string;
};

export type ConcertRecord = {
  id: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  status: "Idea" | "Outreach" | "Negotiating" | "Booked";
  expectedRevenue: number;
};

export type RoyceOperatingData = {
  profile: OperatingProfile;
  monthlyExpenses: MonthlyExpense[];
  plannedCities: PlannedCityRecord[];
  collaborations: CollaborationRecord[];
  organizations: OrganizationRecord[];
  concerts: ConcertRecord[];
};

export const initialRoyceData: RoyceOperatingData = {
  profile: {
    currentCash: 8240,
    monthlyBudget: 850,
    sponsorTarget: 1000,
    sponsorSent: 231,
    sponsorDeadline: "2026-01-01",
    sponsorCadenceQuantity: 30,
    sponsorCadenceEveryDays: 2,
    currentCityId: "shanghai",
    updatedAt: "2025-05-25",
  },
  monthlyExpenses: [
    {
      id: "accommodation",
      category: "Accommodation",
      amount: 210,
      notes: "Shanghai room share",
    },
    {
      id: "food",
      category: "Food",
      amount: 98,
      notes: "Meals and groceries",
    },
    {
      id: "transport",
      category: "Transport",
      amount: 62,
      notes: "Taxi and subway",
    },
    {
      id: "other",
      category: "Other",
      amount: 57,
      notes: "SIM card and supplies",
    },
  ],
  plannedCities: [
    {
      id: "shanghai",
      city: "Shanghai",
      country: "China",
      dateRange: "May 13 – Jun 7",
      totalMonthlyCost: 914,
      opportunityScore: 7.6,
      status: "Current",
      notes: "Validate public performance rules and luxury/education sponsor density.",
    },
    {
      id: "taipei",
      city: "Taipei",
      country: "Taiwan",
      dateRange: "Jun 8 – Jun 22",
      totalMonthlyCost: 742,
      opportunityScore: 8.2,
      status: "Planned",
      notes: "Best near-term opportunity density per euro.",
    },
    {
      id: "seoul",
      city: "Seoul",
      country: "South Korea",
      dateRange: "Jun 23 – Jul 13",
      totalMonthlyCost: 1148,
      opportunityScore: 8.4,
      status: "Planned",
      notes: "Highest music-industry upside.",
    },
    {
      id: "bangkok",
      city: "Bangkok",
      country: "Thailand",
      dateRange: "Jul 14 – Aug 5",
      totalMonthlyCost: 616,
      opportunityScore: 7,
      status: "Planned",
      notes: "Runway extender with tourism and venue partnership options.",
    },
    {
      id: "hcmc",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      dateRange: "Aug 6 – Aug 27",
      totalMonthlyCost: 536,
      opportunityScore: 6.6,
      status: "Planned",
      notes: "Low burn rate and emerging cultural scene.",
    },
    {
      id: "kuala-lumpur",
      city: "Kuala Lumpur",
      country: "Malaysia",
      dateRange: "Aug 28 – Sep 17",
      totalMonthlyCost: 658,
      opportunityScore: 7,
      status: "Planned",
      notes: "Bridge city for embassy, university, and nonprofit meetings.",
    },
  ],
  collaborations: [
    {
      id: "taipei-street-series",
      title: "Taipei street piano collaboration series",
      partner: "Taipei Music Center",
      city: "Taipei",
      status: "Contacted",
      estimatedValue: 1200,
      nextStep: "Send short deck and 3-location concept.",
    },
    {
      id: "yamaha-travel-piano",
      title: "Portable piano travel sponsorship",
      partner: "Yamaha Music Taiwan",
      city: "Taipei",
      status: "Research",
      estimatedValue: 3500,
      nextStep: "Identify artist relations contact.",
    },
  ],
  organizations: [
    {
      id: "yamaha-taiwan",
      name: "Yamaha Music Taiwan",
      type: "Brand",
      country: "Taiwan",
      city: "Taipei",
      fitScore: 94,
      nextAction: "Find artist relations contact.",
    },
    {
      id: "taipei-music-center",
      name: "Taipei Music Center",
      type: "Cultural Center",
      country: "Taiwan",
      city: "Taipei",
      fitScore: 91,
      nextAction: "Pitch street piano series.",
    },
    {
      id: "korean-cultural-center",
      name: "Korean Cultural Center",
      type: "Cultural Center",
      country: "South Korea",
      city: "Seoul",
      fitScore: 88,
      nextAction: "Ask about exchange programs.",
    },
  ],
  concerts: [
    {
      id: "taipei-salon",
      title: "Taipei creator salon recital",
      date: "2025-06-14",
      city: "Taipei",
      venue: "Partner café or cultural space",
      status: "Idea",
      expectedRevenue: 450,
    },
    {
      id: "seoul-mini-recital",
      title: "Seoul cultural exchange mini-recital",
      date: "2025-06-30",
      city: "Seoul",
      venue: "Cultural center",
      status: "Outreach",
      expectedRevenue: 900,
    },
  ],
};
