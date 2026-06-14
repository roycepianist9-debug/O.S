import { useState } from "react";
import { NavProvider, useNav } from "./nav";
import Dashboard from "./screens/Dashboard";
import { Grants, GrantDetail } from "./screens/Grants";
import { Network, ContactDetail } from "./screens/Network";
import { Money } from "./screens/Money";
import { Nonprofit } from "./screens/Nonprofit";
import { Content } from "./screens/Content";
import { Bookings, BookingDetail } from "./screens/Bookings";
import { Repertoire, ArrangementDetail } from "./screens/Repertoire";
import { Countries, CountryDetail } from "./screens/Countries";
import { Goals, GoalDetail } from "./screens/Goals";
import { More, Search, Settings } from "./screens/More";
import QuickAdd from "./screens/QuickAdd";

const TITLES: Record<string, string> = {
  dashboard: "Mission Control",
  grants: "Grants & Residencies",
  grant: "Grant",
  network: "Network & CRM",
  contact: "Contact",
  money: "Revenue & Finance",
  nonprofit: "Nonprofit 15%",
  content: "Content & Media",
  bookings: "Bookings & Tours",
  booking: "Booking",
  repertoire: "Repertoire Vault",
  arrangement: "Arrangement",
  countries: "Country Boards",
  country: "Country Board",
  goals: "Goals",
  goal: "Goal",
  more: "More",
  search: "Search",
  settings: "Settings",
};

const TABS: { name: string; label: string; icon: string }[] = [
  { name: "dashboard", label: "Home", icon: "⌂" },
  { name: "grants", label: "Grants", icon: "◆" },
  { name: "network", label: "Network", icon: "◈" },
  { name: "money", label: "Money", icon: "＄" },
  { name: "more", label: "More", icon: "⋯" },
];

function Screen() {
  const { route } = useNav();
  switch (route.name) {
    case "dashboard":
      return <Dashboard />;
    case "grants":
      return <Grants />;
    case "grant":
      return <GrantDetail />;
    case "network":
      return <Network />;
    case "contact":
      return <ContactDetail />;
    case "money":
      return <Money />;
    case "nonprofit":
      return <Nonprofit />;
    case "content":
      return <Content />;
    case "bookings":
      return <Bookings />;
    case "booking":
      return <BookingDetail />;
    case "repertoire":
      return <Repertoire />;
    case "arrangement":
      return <ArrangementDetail />;
    case "countries":
      return <Countries />;
    case "country":
      return <CountryDetail />;
    case "goals":
      return <Goals />;
    case "goal":
      return <GoalDetail />;
    case "more":
      return <More />;
    case "search":
      return <Search />;
    case "settings":
      return <Settings />;
    default:
      return <Dashboard />;
  }
}

function Shell() {
  const nav = useNav();
  const [adding, setAdding] = useState(false);
  const activeTab =
    TABS.find((t) => t.name === nav.route.name)?.name ?? "more";

  return (
    <div className="app">
      <header className="appbar">
        {nav.canBack ? (
          <button className="ab-btn" aria-label="Back" onClick={nav.back}>
            ‹
          </button>
        ) : (
          <span className="ab-spacer" />
        )}
        <h1>{TITLES[nav.route.name] ?? "Royce OS"}</h1>
        <button
          className="ab-btn"
          aria-label="Search"
          onClick={() => nav.go("search")}
        >
          ⌕
        </button>
      </header>

      <Screen />

      <button
        className="fab"
        aria-label="Quick add"
        onClick={() => setAdding(true)}
      >
        ＋
      </button>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.name}
            className={activeTab === t.name ? "on" : ""}
            onClick={() => nav.go(t.name)}
          >
            <span className="tbi">{t.icon}</span>
            <span className="tbl">{t.label}</span>
          </button>
        ))}
      </nav>

      {adding ? <QuickAdd onClose={() => setAdding(false)} /> : null}
    </div>
  );
}

export default function App() {
  return (
    <NavProvider>
      <Shell />
    </NavProvider>
  );
}
