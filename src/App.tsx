import {
  cities,
  contentProjects,
  opportunities,
  organizations,
  recentActivity,
  routeCoordinates,
  tasks,
  type City,
  type Opportunity,
} from "./data";
import {
  initialRoyceData,
  type CollaborationRecord,
  type ConcertRecord,
  type GoalRecord,
  type MonthlyExpense,
  type OrganizationRecord,
  type PlannedCityRecord,
  type RoyceOperatingData,
} from "./royceData";
import {
  loadSupabaseMemory,
  saveSupabaseMemory,
  type MemoryState,
} from "./royceMemory";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";

const euro = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const compactEuro = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  notation: "compact",
});

const menuItems = [
  "Dashboard",
  "Royce Data",
  "Goals",
  "Travel Plan",
  "Budget",
  "Outreach",
  "Contacts",
  "Opportunities",
  "Calendar",
  "Content",
  "Documents",
  "Settings",
] as const;

type MenuItem = (typeof menuItems)[number];

const storageKey = "royce-os-phase-one-data";

const initialMemoryState: MemoryState = {
  mode: "loading",
  detail: "Loading Supabase memory.",
};

function loadRoyceData() {
  const rawData = window.localStorage.getItem(storageKey);

  if (!rawData) {
    return initialRoyceData;
  }

  try {
    return { ...initialRoyceData, ...JSON.parse(rawData) } as RoyceOperatingData;
  } catch {
    return initialRoyceData;
  }
}

function mergeRoyceData(data: RoyceOperatingData) {
  return {
    ...initialRoyceData,
    ...data,
    profile: {
      ...initialRoyceData.profile,
      ...data.profile,
    },
  };
}

function App() {
  const [activeSection, setActiveSection] = useState<MenuItem>("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [royceData, setRoyceData] = useState<RoyceOperatingData>(loadRoyceData);
  const [memoryState, setMemoryState] = useState<MemoryState>(initialMemoryState);
  const [memoryReady, setMemoryReady] = useState(false);
  const currentCity = cities.find((city) => city.id === royceData.profile.currentCityId) ?? cities[0];
  const nextPlannedCity = royceData.plannedCities.find((city) => city.status === "Planned");
  const selectedCity = cities.find((city) => city.id === nextPlannedCity?.id) ?? cities[1];
  const totalExpenses = royceData.monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyBudget = royceData.profile.monthlyBudget;
  const cashBalance = royceData.profile.currentCash;
  const runwayMonths = cashBalance / monthlyBudget;
  const outreachProgress = royceData.profile.sponsorSent / royceData.profile.sponsorTarget;
  const daysUntilDeadline = daysBetween(royceData.profile.updatedAt, royceData.profile.sponsorDeadline);
  const cadenceSlots = Math.ceil(daysUntilDeadline / royceData.profile.sponsorCadenceEveryDays);
  const projectedEmails = royceData.profile.sponsorSent + cadenceSlots * royceData.profile.sponsorCadenceQuantity;
  const aiStrategy = useMemo(
    () => buildAiStrategy(royceData, currentCity, selectedCity, totalExpenses, projectedEmails),
    [currentCity, projectedEmails, royceData, selectedCity, totalExpenses],
  );
  const activeOpportunities = opportunities.filter(
    (opportunity) => !["Won", "Lost"].includes(opportunity.status),
  );
  const pageCopy: Record<MenuItem, { title: string; subtitle: string }> = {
    Dashboard: { title: "Dashboard", subtitle: "Good morning, Royce. Let's make today count." },
    "Royce Data": { title: "Royce Data", subtitle: "Turn the system into a live source of truth before Supabase." },
    Goals: { title: "Goals", subtitle: "Define what the AI should optimize around next." },
    "Travel Plan": { title: "Travel Plan", subtitle: "Design your route. Maximize your impact." },
    Budget: { title: "Budget", subtitle: "Keep the route inside your real runway." },
    Outreach: { title: "Outreach", subtitle: "Move sponsor conversations forward on cadence." },
    Contacts: { title: "Contacts", subtitle: "Track people, organizations, and warm introductions." },
    Opportunities: { title: "Opportunities", subtitle: "Prioritize everything that can become leverage." },
    Calendar: { title: "Calendar", subtitle: "Turn the route into a week-by-week plan." },
    Content: { title: "Content", subtitle: "Connect travel, performance, and audience growth." },
    Documents: { title: "Documents", subtitle: "Store decks, visas, budgets, and opportunity files." },
    Settings: { title: "Settings", subtitle: "Tune Royce OS around your operating style." },
  };

  useEffect(() => {
    let isMounted = true;

    void loadSupabaseMemory().then((result) => {
      if (!isMounted) {
        return;
      }

      if (result.ok && result.data) {
        setRoyceData(mergeRoyceData(result.data));
      }

      setMemoryState(result.state);
      setMemoryReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(royceData));

    if (!memoryReady) {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      void saveSupabaseMemory(royceData).then(setMemoryState);
    }, 600);

    return () => window.clearTimeout(saveTimer);
  }, [memoryReady, royceData]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const selectSection = (item: MenuItem) => {
    setActiveSection(item);
    setMenuOpen(false);
  };

  return (
    <div className={`shell ${menuOpen ? "menu-is-open" : ""}`}>
      <button
        aria-label="Close navigation menu"
        className="menu-backdrop"
        onClick={() => setMenuOpen(false)}
        type="button"
      />
      <aside className={`sidebar ${menuOpen ? "open" : ""}`} id="primary-navigation">
        <div className="sidebar-head">
          <div>
            <div className="brand">
              <span>ROYCE</span>
              <strong>OS</strong>
            </div>
            <p className="brand-subtitle">Your Personal Navigation System</p>
          </div>
          <button className="drawer-close" onClick={() => setMenuOpen(false)} type="button" aria-label="Close menu">
            ×
          </button>
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          {menuItems.map((item) => (
            <button
              className={item === activeSection ? "active" : ""}
              key={item}
              onClick={() => selectSection(item)}
              type="button"
            >
              <span className="nav-icon">{iconFor(item)}</span>
              {item}
            </button>
          ))}
        </nav>

        <section className="profile-card">
          <div className="avatar">R</div>
          <div>
            <strong>Royce</strong>
            <span>Pianist · Founder</span>
            <small>Pro Plan</small>
          </div>
        </section>

        <section className="assistant-card">
          <span className="status-dot" />
          <strong>AI Assistant</strong>
          <p>Ask for the highest-leverage move across money, travel, content, and opportunities.</p>
        </section>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div className="topbar-heading">
            <button
              aria-controls="primary-navigation"
              aria-expanded={menuOpen}
              aria-label="Open navigation menu"
              className="menu-toggle"
              onClick={() => setMenuOpen(true)}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
            <div>
              <h1>
                {pageCopy[activeSection].title} <span>👋</span>
              </h1>
              <p>{pageCopy[activeSection].subtitle}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <MemoryPill state={memoryState} />
            <Pill icon="⌖" label={`${currentCity.city}, ${currentCity.country}`} />
            <Pill icon="☀" label="28°C" />
            <Pill icon="📅" label="May 25, 2025 · Sunday" />
            <button className="add-button" type="button" aria-label="Add opportunity">
              +
            </button>
          </div>
        </header>

        {activeSection === "Dashboard" ? (
          <>
            <section className="metrics-grid" aria-label="Dashboard metrics">
              <MetricCard
                accent="green"
                eyebrow="Cash Runway"
                value={runwayMonths.toFixed(1)}
                suffix="months"
                detail={`${euro.format(cashBalance)} current cash`}
                sparkline={[4, 5, 5, 6, 5, 4, 4, 6, 8, 7, 10, 9, 12]}
              />
              <MetricCard
                accent="blue"
                eyebrow="Daily Budget"
                value={`€${(monthlyBudget / 30).toFixed(2)}`}
                suffix="avg. per day"
                detail={`${euro.format(monthlyBudget)} / month`}
                sparkline={[3, 4, 4, 5, 4, 4, 4, 6, 8, 7, 10, 9, 12]}
              />
              <CityCard city={currentCity} title="Current City" />
              <CityCard city={selectedCity} title="Next City" />
              <OutreachCard
                campaignName="1,000 sponsor emails by January"
                cadenceEveryDays={royceData.profile.sponsorCadenceEveryDays}
                cadenceQuantity={royceData.profile.sponsorCadenceQuantity}
                progress={outreachProgress}
                sentCount={royceData.profile.sponsorSent}
                targetCount={royceData.profile.sponsorTarget}
                projectedEmails={projectedEmails}
              />
            </section>

            <section className="content-grid">
              <div className="route-panel panel">
                <div className="panel-header">
                  <h2>Travel Route</h2>
                  <span>Opportunity density path</span>
                </div>
                <div className="route-layout">
                  <ol className="route-list">
                    {royceData.plannedCities.map((city, index) => (
                      <li className={city.id === selectedCity.id ? "selected" : ""} key={city.id}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{city.city}</strong>
                          <small>{city.dateRange}</small>
                        </div>
                        <em>{city.opportunityScore.toFixed(1)}</em>
                      </li>
                    ))}
                  </ol>
                  <RouteMap />
                  <CityIntelligence city={selectedCity} />
                </div>
              </div>

              <div className="priority-panel panel">
                <PanelTitle title="Today's Priorities" action="Edit" />
                <div className="task-list">
                  {tasks.map((task) => (
                    <div className="task-row" key={task.id}>
                      <span className={`task-priority ${task.priority.toLowerCase()}`}>{task.priority[0]}</span>
                      <div>
                        <strong>{task.title}</strong>
                        <small>{task.due}</small>
                      </div>
                      <em>
                        {task.progress[0]}/{task.progress[1]}
                      </em>
                    </div>
                  ))}
                </div>
              </div>

              <BudgetPanel
                cashBalance={cashBalance}
                monthlyBudget={monthlyBudget}
                monthlyExpenses={royceData.monthlyExpenses}
                selectedCity={selectedCity}
                totalExpenses={totalExpenses}
              />

              <OpportunityPanel opportunities={activeOpportunities} />

              <ContentPanel />

              <ActivityPanel />

              <AiNotes strategy={aiStrategy} />
            </section>
          </>
        ) : activeSection === "Royce Data" ? (
          <RoyceDataPage data={royceData} onChange={setRoyceData} strategy={aiStrategy} />
        ) : activeSection === "Goals" ? (
          <GoalsPage data={royceData} onChange={setRoyceData} strategy={aiStrategy} />
        ) : activeSection === "Travel Plan" ? (
          <TravelPlanPage data={royceData} onChange={setRoyceData} selectedCity={selectedCity} strategy={aiStrategy} />
        ) : (
          <SectionWorkspace data={royceData} section={activeSection} strategy={aiStrategy} />
        )}
      </main>
    </div>
  );
}

type AiStrategy = {
  headline: string;
  nextMoves: string[];
  risks: string[];
  cityRecommendation: string;
};

function buildAiStrategy(
  data: RoyceOperatingData,
  currentCity: City,
  selectedCity: City,
  totalExpenses: number,
  projectedEmails: number,
): AiStrategy {
  const highPriorityGoals = data.goals.filter((goal) => goal.priority === "High");
  const topGoal = highPriorityGoals[0] ?? data.goals[0];
  const bestOrganizations = data.organizations
    .filter((organization) => organization.city === currentCity.city || organization.country === currentCity.country)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 2);
  const outreachGap = Math.max(data.profile.sponsorTarget - data.profile.sponsorSent, 0);
  const runwayMonths = data.profile.monthlyBudget > 0 ? data.profile.currentCash / data.profile.monthlyBudget : 0;
  const cityCostDelta = selectedCity.totalMonthlyCost - data.profile.monthlyBudget;
  const nextCityPressure =
    cityCostDelta > 0
      ? `${selectedCity.city} is ${euro.format(cityCostDelta)} above monthly budget, so line up sponsor meetings before arrival.`
      : `${selectedCity.city} fits under monthly budget, so use it as a runway-building stop.`;

  return {
    headline: topGoal
      ? `Optimize this week around "${topGoal.title}" while protecting ${runwayMonths.toFixed(1)} months of runway.`
      : `Protect ${runwayMonths.toFixed(1)} months of runway while turning travel into opportunities.`,
    nextMoves: [
      `Send the next ${data.profile.sponsorCadenceQuantity} sponsor emails toward the ${outreachGap} remaining outreach target.`,
      bestOrganizations.length > 0
        ? `Prioritize ${bestOrganizations.map((organization) => organization.name).join(" and ")} for warm sponsor/cultural intros.`
        : `Add 3 target organizations in ${currentCity.city} so the AI can rank sponsor and cultural leads.`,
      `Convert every reply into a task, collaboration, or concert record so strategy keeps evolving.`,
    ],
    risks: [
      totalExpenses > data.profile.monthlyBudget
        ? `Monthly expenses exceed budget by ${euro.format(totalExpenses - data.profile.monthlyBudget)}.`
        : `Monthly tracked expenses are ${Math.round((totalExpenses / data.profile.monthlyBudget) * 100)}% of budget.`,
      projectedEmails >= data.profile.sponsorTarget
        ? "Sponsor cadence is on track if maintained."
        : "Sponsor cadence is behind the January target.",
    ],
    cityRecommendation: nextCityPressure,
  };
}

function Pill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="pill">
      <span>{icon}</span>
      {label}
    </span>
  );
}

function MemoryPill({ state }: { state: MemoryState }) {
  const icon = state.mode === "supabase" ? "◈" : state.mode === "loading" ? "…" : "◇";
  const label =
    state.mode === "supabase" ? "Supabase memory" : state.mode === "loading" ? "Loading memory" : "Local fallback";

  return (
    <span className={`pill memory-pill ${state.mode}`} title={state.detail}>
      <span>{icon}</span>
      {label}
    </span>
  );
}

function LongPressDeleteCard({
  ariaLabel,
  children,
  className = "record-card",
  deleteLabel = "Delete",
  onDelete,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  deleteLabel?: string;
  onDelete: () => void;
}) {
  const [deleteReady, setDeleteReady] = useState(false);
  const pressTimer = useRef<number | null>(null);

  const clearPressTimer = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const revealDelete = () => {
    clearPressTimer();
    setDeleteReady(true);
  };

  const startPress = () => {
    if (deleteReady) {
      return;
    }

    clearPressTimer();
    pressTimer.current = window.setTimeout(revealDelete, 560);
  };

  const handleDelete = () => {
    clearPressTimer();
    setDeleteReady(false);
    onDelete();
  };

  return (
    <article
      aria-label={`${ariaLabel}. Long press to reveal delete.`}
      className={`${className} long-press-card ${deleteReady ? "delete-ready" : ""}`}
      onContextMenu={(event) => {
        event.preventDefault();
        revealDelete();
      }}
      onDoubleClick={revealDelete}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDeleteReady(false);
        }

        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          if (deleteReady) {
            handleDelete();
          } else {
            revealDelete();
          }
        }
      }}
      onPointerCancel={clearPressTimer}
      onPointerDown={startPress}
      onPointerLeave={clearPressTimer}
      onPointerUp={clearPressTimer}
      tabIndex={0}
    >
      {children}
      <button
        aria-label={deleteLabel}
        className="delete-affordance"
        onClick={(event) => {
          event.stopPropagation();
          handleDelete();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        Delete
      </button>
    </article>
  );
}

function MetricCard({
  accent,
  eyebrow,
  value,
  suffix,
  detail,
  sparkline,
}: {
  accent: "green" | "blue";
  eyebrow: string;
  value: string;
  suffix: string;
  detail: string;
  sparkline: number[];
}) {
  return (
    <article className="metric-card panel">
      <span className={`metric-icon ${accent}`}>{accent === "green" ? "▣" : "₪"}</span>
      <p>{eyebrow}</p>
      <div className="metric-value">
        <strong>{value}</strong>
        <span>{suffix}</span>
      </div>
      <small>{detail}</small>
      <Sparkline values={sparkline} accent={accent} />
    </article>
  );
}

function Sparkline({ values, accent }: { values: number[]; accent: "green" | "blue" }) {
  const max = Math.max(...values);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${34 - (value / max) * 30}`)
    .join(" ");

  return (
    <svg className="sparkline" viewBox="0 0 100 36" aria-hidden="true">
      <polyline className={accent} points={points} />
    </svg>
  );
}

function CityCard({ city, title }: { city: City; title: string }) {
  return (
    <article className="city-card panel">
      <p>{title}</p>
      <strong>{city.city}</strong>
      <span>{city.dateRange}</span>
      <div className="mini-skyline" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </article>
  );
}

function OutreachCard({
  campaignName,
  cadenceEveryDays,
  cadenceQuantity,
  progress,
  sentCount,
  targetCount,
  projectedEmails,
}: {
  campaignName: string;
  cadenceEveryDays: number;
  cadenceQuantity: number;
  progress: number;
  sentCount: number;
  targetCount: number;
  projectedEmails: number;
}) {
  const percent = Math.round(progress * 100);
  const onTrack = projectedEmails >= targetCount;

  return (
    <article className="outreach-card panel">
      <div>
        <p>Sponsor Outreach</p>
        <strong>
          {sentCount} <span>/ {targetCount}</span>
        </strong>
        <small>{campaignName}</small>
      </div>
      <div className="gauge" style={{ "--progress": `${percent * 3.6}deg` } as CSSProperties}>
        <span>{percent}%</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${percent}%` }} />
      </div>
      <footer>
        <span>
          Need {cadenceQuantity} every {cadenceEveryDays} days
        </span>
        <strong className={onTrack ? "good" : "warning"}>{onTrack ? "On track" : "Behind"}</strong>
      </footer>
    </article>
  );
}

function RouteMap() {
  const points = routeCoordinates.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="map-card" aria-label="Route map">
      <svg viewBox="0 0 100 100" role="img">
        <defs>
          <radialGradient id="mapGlow">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M7 48 C22 28 36 22 53 33 S77 24 91 10" className="coast" />
        <path d="M18 90 C23 71 31 63 43 58 S60 44 77 19" className="route-shadow" />
        <polyline className="route-line" points={points} />
        {routeCoordinates.map((point, index) => (
          <g key={point.id}>
            <circle className="route-glow" cx={point.x} cy={point.y} r="9" />
            <circle className="route-point" cx={point.x} cy={point.y} r="3.8" />
            <text x={point.x} y={point.y + 1.4}>
              {index + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CityIntelligence({ city }: { city: City }) {
  const scores = [
    ["Cost", 10 - Math.round(city.totalMonthlyCost / 160)],
    ["Busking Opportunities", city.buskingScore],
    ["Networking Potential", city.networkScore],
    ["Sponsor Density", city.sponsorScore],
    ["Safety", city.safetyScore],
    ["Ease of Visa", city.visaEase],
  ] as const;

  return (
    <aside className="city-intel">
      <h3>
        {city.city}, {city.country}
      </h3>
      <p>Next stop · {city.recommendedStayDays[0]}–{city.recommendedStayDays[1]} days</p>
      <div className="score-list">
        {scores.map(([label, score]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{score}/10</strong>
          </div>
        ))}
      </div>
      <footer>
        <span>Recommended Stay</span>
        <strong>
          {city.recommendedStayDays[0]} – {city.recommendedStayDays[1]} days
        </strong>
      </footer>
    </aside>
  );
}

function BudgetPanel({
  monthlyBudget,
  totalExpenses,
  cashBalance,
  monthlyExpenses,
  selectedCity,
}: {
  monthlyBudget: number;
  totalExpenses: number;
  cashBalance: number;
  monthlyExpenses: MonthlyExpense[];
  selectedCity: City;
}) {
  const spendPercent = Math.round((totalExpenses / monthlyBudget) * 100);
  const twelveMonthProjection = Array.from({ length: 12 }, (_, index) => {
    const seasonalVariance = index % 3 === 0 ? 90 : -20;
    return selectedCity.totalMonthlyCost + seasonalVariance;
  }).reduce<number[]>((balances, cost) => {
    const previousBalance = balances.at(-1) ?? cashBalance;
    balances.push(Math.max(previousBalance - cost, 0));
    return balances;
  }, []);

  return (
    <section className="panel budget-panel">
      <PanelTitle title="Budget Overview" />
      <p>Monthly Budget</p>
      <strong>{euro.format(monthlyBudget)}</strong>
      <div className="progress-track purple">
        <span style={{ width: `${spendPercent}%` }} />
      </div>
      <small>
        {euro.format(totalExpenses)} spent <em>{spendPercent}%</em>
      </small>

      <div className="expense-list">
        {monthlyExpenses.map((expense) => (
          <div key={expense.id}>
            <span>{expense.category}</span>
            <strong>{euro.format(expense.amount)}</strong>
          </div>
        ))}
      </div>

      <div className="projection">
        <div>
          <p>Budget Projection</p>
          <strong>{euro.format(twelveMonthProjection.at(-1) ?? 0)}</strong>
          <small>remaining in 12 months</small>
        </div>
        <Sparkline values={twelveMonthProjection} accent="green" />
      </div>
    </section>
  );
}

function OpportunityPanel({ opportunities: activeOpportunities }: { opportunities: Opportunity[] }) {
  return (
    <section className="panel opportunity-panel">
      <PanelTitle title="Opportunity Engine" action={`${activeOpportunities.length} active`} />
      <div className="opportunity-list">
        {activeOpportunities.slice(0, 5).map((opportunity) => {
          const organization = organizations.find((item) => item.id === opportunity.organizationId);

          return (
            <article key={opportunity.id}>
              <div>
                <strong>{opportunity.title}</strong>
                <small>
                  {opportunity.type} · {opportunity.city}
                </small>
              </div>
              <span>{organization?.fitScore ?? opportunity.priorityScore}</span>
              <em>{compactEuro.format(opportunity.estimatedValue)}</em>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ContentPanel() {
  return (
    <section className="panel content-panel">
      <PanelTitle title="Content Progress" />
      {contentProjects.map((project) => {
        const percent = Math.round((project.published / project.target) * 100);

        return (
          <div className="content-row" key={project.id}>
            <span className={project.platform.toLowerCase()}>{project.platform[0]}</span>
            <div>
              <strong>
                {project.platform} {project.type}
              </strong>
              <div className="progress-track">
                <span style={{ width: `${percent}%` }} />
              </div>
            </div>
            <em>
              {project.published} / {project.target}
              <small>{percent}%</small>
            </em>
          </div>
        );
      })}
    </section>
  );
}

function ActivityPanel() {
  return (
    <section className="panel activity-panel">
      <PanelTitle title="Recent Activity" action="View All" />
      {recentActivity.map((activity) => (
        <div className="activity-row" key={activity.id}>
          <span>✦</span>
          <strong>{activity.label}</strong>
          <small>{activity.when}</small>
        </div>
      ))}
    </section>
  );
}

function AiNotes({ strategy }: { strategy: AiStrategy }) {
  return (
    <section className="panel notes-panel">
      <PanelTitle title="AI Plan" action="Auto-updated from Royce Data" />
      <p>{strategy.headline}</p>
      <ul className="ai-note-list">
        {strategy.nextMoves.slice(0, 2).map((move) => (
          <li key={move}>{move}</li>
        ))}
      </ul>
      <button type="button">View Opportunities</button>
    </section>
  );
}

function GoalsPage({
  data,
  onChange,
  strategy,
}: {
  data: RoyceOperatingData;
  onChange: (data: RoyceOperatingData) => void;
  strategy: AiStrategy;
}) {
  const addGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = readFormText(formData, "title");

    if (!title) {
      return;
    }

    onChange({
      ...data,
      goals: [
        ...data.goals,
        {
          id: createRecordId("goal"),
          title,
          category: readGoalCategory(formData),
          target: readFormText(formData, "target", "Define measurable target"),
          timeframe: readFormText(formData, "timeframe", "Next 90 days"),
          priority: readGoalPriority(formData),
        },
      ],
    });
    event.currentTarget.reset();
  };

  return (
    <section className="goals-page">
      <div className="panel data-hero">
        <div>
          <span>Goal engine</span>
          <h2>Tell Royce OS what the AI should optimize for.</h2>
          <p>Goals are saved with Royce Data and feed the local strategy recommendations immediately.</p>
        </div>
      </div>
      <section className="panel ai-strategy-panel">
        <PanelTitle title="AI Plan" action="Synced with goals" />
        <h3>{strategy.headline}</h3>
        <div className="strategy-grid">
          {strategy.nextMoves.map((move) => (
            <article key={move}>
              <span>Move</span>
              <strong>{move}</strong>
            </article>
          ))}
          {strategy.risks.map((risk) => (
            <article key={risk}>
              <span>Risk</span>
              <strong>{risk}</strong>
            </article>
          ))}
        </div>
      </section>
      <DataCollection
        addForm={
          <form className="data-form compact-form goal-form" onSubmit={addGoal}>
            <input name="title" placeholder="Goal" />
            <select name="category" defaultValue="Travel">
              <option>Travel</option>
              <option>Money</option>
              <option>Outreach</option>
              <option>Content</option>
              <option>Collaboration</option>
              <option>Nonprofit</option>
            </select>
            <input name="target" placeholder="Target / metric" />
            <input name="timeframe" placeholder="Timeframe" />
            <select name="priority" defaultValue="High">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button type="submit">+ Add goal</button>
          </form>
        }
        title="Active Goals"
      >
        {data.goals.map((goal) => (
          <GoalRecordCard
            goal={goal}
            key={goal.id}
            onRemove={() =>
              onChange({
                ...data,
                goals: data.goals.filter((item) => item.id !== goal.id),
              })
            }
          />
        ))}
      </DataCollection>
    </section>
  );
}

function TravelPlanPage({
  data,
  onChange,
  selectedCity,
  strategy,
}: {
  data: RoyceOperatingData;
  onChange: (data: RoyceOperatingData) => void;
  selectedCity: City;
  strategy: AiStrategy;
}) {
  const fallbackPlannedCity = data.plannedCities[0] ?? initialRoyceData.plannedCities[0];
  const currentRecord = data.plannedCities.find((city) => city.id === data.profile.currentCityId) ?? fallbackPlannedCity;
  const currentCityIntel =
    cities.find((city) => city.id === currentRecord?.id || city.city === currentRecord?.city) ?? selectedCity;
  const routeCost = data.plannedCities.reduce((sum, city) => sum + city.totalMonthlyCost, 0);
  const localOrganizations = data.organizations
    .filter((organization) => organization.city === currentCityIntel.city || organization.country === currentCityIntel.country)
    .sort((a, b) => b.fitScore - a.fitScore);
  const localCollaborations = data.collaborations.filter((collaboration) => collaboration.city === currentCityIntel.city);
  const opportunityCards = [
    ...localOrganizations.map((organization) => ({
      id: organization.id,
      title: organization.name,
      meta: `${organization.type} · ${organization.city}`,
      source: "organization",
      status: organization.fitScore >= 90 ? "High" : "Medium",
      nextAction: organization.nextAction,
    })),
    ...localCollaborations.map((collaboration) => ({
      id: collaboration.id,
      title: collaboration.title,
      meta: `Collaboration · ${collaboration.city}`,
      source: "collaboration",
      status: collaboration.status,
      nextAction: collaboration.nextStep,
    })),
  ];

  const deleteOpportunityCard = (card: (typeof opportunityCards)[number]) => {
    if (card.source === "organization") {
      onChange({
        ...data,
        organizations: data.organizations.filter((organization) => organization.id !== card.id),
      });
      return;
    }

    onChange({
      ...data,
      collaborations: data.collaborations.filter((collaboration) => collaboration.id !== card.id),
    });
  };

  return (
    <section className="travel-page">
      <div className="travel-grid">
        <section className="panel travel-summary-card">
          <PanelTitle title="Current City" />
          <strong>
            {currentRecord.city}, {currentRecord.country}
          </strong>
          <button type="button">View City</button>
        </section>

        <section className="panel travel-score-card">
          <span>Next Recommended City</span>
          <strong>
            {selectedCity.city}, {selectedCity.country}
          </strong>
          <em>{Math.round(selectedCity.overallScore * 10)} /100</em>
          <p>{strategy.cityRecommendation}</p>
        </section>

        <section className="panel travel-route-card">
          <PanelTitle title="2026 Route" action="Edit Route" />
          <ol className="mobile-route-list">
            {data.plannedCities.map((city, index) => (
              <li className={city.status === "Current" ? "selected" : ""} key={city.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{city.city}, {city.country}</strong>
                  <small>{city.dateRange}</small>
                </div>
              </li>
            ))}
          </ol>
          <button className="full-width-action" type="button">+ Add City</button>
        </section>

        <section className="panel route-overview-card">
          <PanelTitle title="Route Overview" />
          <div className="route-overview-grid">
            <strong>{new Set(data.plannedCities.map((city) => city.country)).size}<span>Countries</span></strong>
            <strong>{data.plannedCities.reduce((sum, city) => sum + Math.round(city.opportunityScore * 3), 0)}<span>Days Planned</span></strong>
            <strong>{euro.format(routeCost)}<span>Est. Total Cost</span></strong>
            <strong>{data.collaborations.length}<span>Potential Collaborations</span></strong>
          </div>
        </section>

        <section className="panel city-detail-card">
          <div className="city-photo" aria-label={`${currentCityIntel.city} skyline`}>
            <span>● High Opportunity</span>
          </div>
          <div className="travel-tabs">
            <button className="active" type="button">Overview</button>
            <button type="button">Opportunities</button>
            <button type="button">Budget</button>
            <button type="button">Guide</button>
          </div>
          <CityScoreBars city={currentCityIntel} />
          <section className="why-ai-card">
            <h3>AI Plan for {currentCityIntel.city}</h3>
            <ul>
              <li>Strong sponsor and cultural center density.</li>
              <li>Current goals favor outreach plus collaboration discovery.</li>
              <li>Cost profile keeps runway near {(data.profile.currentCash / data.profile.monthlyBudget).toFixed(1)} months.</li>
            </ul>
          </section>
        </section>

        <section className="panel travel-opportunities-card">
          <PanelTitle title="Top Opportunities" action="+ Add Opportunity" />
          <div className="opportunity-tabs-stats">
            <strong>{opportunityCards.length}<span>All</span></strong>
            <strong>{opportunityCards.filter((card) => card.status === "High").length}<span>High Priority</span></strong>
            <strong>{data.collaborations.length}<span>In Progress</span></strong>
            <strong>{data.organizations.length}<span>Contacted</span></strong>
          </div>
          <div className="travel-opportunity-list">
            {opportunityCards.slice(0, 5).map((card) => (
              <LongPressDeleteCard
                ariaLabel={`${card.title} opportunity`}
                className="travel-opportunity-record"
                deleteLabel={`Delete ${card.title}`}
                key={card.id}
                onDelete={() => deleteOpportunityCard(card)}
              >
                <div>
                  <strong>{card.title}</strong>
                  <small>{card.meta}</small>
                  <p>{card.nextAction}</p>
                </div>
                <em>{card.status}</em>
              </LongPressDeleteCard>
            ))}
          </div>
        </section>

        <section className="panel city-guide-card">
          <PanelTitle title="City Guide" action="See All" />
          <div className="guide-grid">
            <article><strong>Top Places</strong><small>12 places</small></article>
            <article><strong>Cafés</strong><small>18 cafés</small></article>
            <article><strong>Live Music</strong><small>24 venues</small></article>
          </div>
        </section>
      </div>
    </section>
  );
}

function SectionWorkspace({
  data,
  section,
  strategy,
}: {
  data: RoyceOperatingData;
  section: MenuItem;
  strategy: AiStrategy;
}) {
  const sectionStats: Record<string, { label: string; value: string }[]> = {
    Budget: [
      { label: "Current cash", value: euro.format(data.profile.currentCash) },
      { label: "Monthly budget", value: euro.format(data.profile.monthlyBudget) },
      { label: "Tracked expenses", value: euro.format(data.monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)) },
    ],
    Outreach: [
      { label: "Sponsor target", value: `${data.profile.sponsorSent}/${data.profile.sponsorTarget}` },
      { label: "Cadence", value: `${data.profile.sponsorCadenceQuantity} emails / ${data.profile.sponsorCadenceEveryDays} days` },
      { label: "Organizations", value: data.organizations.length.toString() },
    ],
    Contacts: [
      { label: "Organizations", value: data.organizations.length.toString() },
      { label: "Collaborations", value: data.collaborations.length.toString() },
      { label: "Cities", value: data.plannedCities.length.toString() },
    ],
    Opportunities: [
      { label: "Active opportunities", value: opportunities.filter((opportunity) => opportunity.status !== "Won").length.toString() },
      { label: "Concerts", value: data.concerts.length.toString() },
      { label: "Route cities", value: data.plannedCities.length.toString() },
    ],
    Calendar: [
      { label: "Concerts", value: data.concerts.length.toString() },
      { label: "Next city", value: data.plannedCities.find((city) => city.status === "Planned")?.city ?? "Add route" },
      { label: "Goals", value: data.goals.length.toString() },
    ],
    Content: [
      { label: "Content projects", value: contentProjects.length.toString() },
      { label: "Route cities", value: data.plannedCities.length.toString() },
      { label: "Collaborations", value: data.collaborations.length.toString() },
    ],
    Documents: [
      { label: "Decks", value: "Sponsor / nonprofit" },
      { label: "Travel docs", value: `${data.plannedCities.length} cities` },
      { label: "AI notes", value: "Labeled AI Plan" },
    ],
    Settings: [
      { label: "Memory mode", value: "Local + Supabase-ready" },
      { label: "Default view", value: "Dashboard" },
      { label: "Navigation", value: "Hamburger drawer" },
    ],
  };
  const cards = sectionStats[section] ?? [];

  return (
    <section className="section-page">
      <div className="panel data-hero">
        <div>
          <span>{section} workspace</span>
          <h2>{section} opens as its own page from the hamburger menu.</h2>
          <p>
            This keeps Dashboard as the home view while every menu click switches to a dedicated workspace. The deeper
            editable tools can keep expanding inside each page.
          </p>
        </div>
      </div>
      <section className="section-card-grid">
        {cards.map((card) => (
          <article className="panel data-stat" key={`${section}-${card.label}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>
      <section className="panel ai-strategy-panel">
        <PanelTitle title="AI Plan" action={`Synced with ${section}`} />
        <h3>{strategy.headline}</h3>
        <div className="strategy-grid">
          {strategy.nextMoves.map((move) => (
            <article key={move}>
              <span>Move</span>
              <strong>{move}</strong>
            </article>
          ))}
          {strategy.risks.map((risk) => (
            <article key={risk}>
              <span>Risk</span>
              <strong>{risk}</strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function CityScoreBars({ city }: { city: City }) {
  const scores = [
    ["Overall Opportunity", city.overallScore * 10, "/100"],
    ["Music Opportunities", city.buskingScore, "/10"],
    ["Sponsor Density", city.sponsorScore, "/10"],
    ["Networking Potential", city.networkScore, "/10"],
    ["Cost of Living", Math.max(1, 10 - Math.round(city.totalMonthlyCost / 160)), "/10"],
    ["Safety", city.safetyScore, "/10"],
    ["Ease of Visa", city.visaEase, "/10"],
  ] as const;

  return (
    <div className="city-score-bars">
      <PanelTitle title="City Scores" />
      {scores.map(([label, score, suffix]) => {
        const percent = suffix === "/100" ? score : score * 10;

        return (
          <div key={label}>
            <span>{label}</span>
            <strong>
              {Math.round(score)}{suffix}
            </strong>
            <div className="progress-track">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoyceDataPage({
  data,
  onChange,
  strategy,
}: {
  data: RoyceOperatingData;
  onChange: (data: RoyceOperatingData) => void;
  strategy: AiStrategy;
}) {
  const totalExpenses = useMemo(
    () => data.monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [data.monthlyExpenses],
  );
  const activeCollaborations = data.collaborations.filter((collaboration) => collaboration.status !== "Confirmed").length;
  const expectedConcertRevenue = data.concerts.reduce((sum, concert) => sum + concert.expectedRevenue, 0);

  const updateProfile = (nextProfile: Partial<RoyceOperatingData["profile"]>) => {
    onChange({
      ...data,
      profile: {
        ...data.profile,
        ...nextProfile,
      },
    });
  };

  const updateCurrentCity = (cityId: string) => {
    onChange({
      ...data,
      profile: {
        ...data.profile,
        currentCityId: cityId,
      },
      plannedCities: data.plannedCities.map((city) => ({
        ...city,
        status: city.id === cityId ? "Current" : "Planned",
      })),
    });
  };

  const addExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = readFormNumber(formData, "amount");

    if (amount <= 0) {
      return;
    }

    onChange({
      ...data,
      monthlyExpenses: [
        ...data.monthlyExpenses,
        {
          id: createRecordId("expense"),
          category: readFormText(formData, "category", "Other"),
          amount,
          notes: readFormText(formData, "notes", "New monthly expense"),
        },
      ],
    });
    event.currentTarget.reset();
  };

  const addGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = readFormText(formData, "title");

    if (!title) {
      return;
    }

    onChange({
      ...data,
      goals: [
        ...data.goals,
        {
          id: createRecordId("goal"),
          title,
          category: readGoalCategory(formData),
          target: readFormText(formData, "target", "Define measurable target"),
          timeframe: readFormText(formData, "timeframe", "Next 90 days"),
          priority: readGoalPriority(formData),
        },
      ],
    });
    event.currentTarget.reset();
  };

  const addCity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const city = readFormText(formData, "city");
    const country = readFormText(formData, "country");

    if (!city || !country) {
      return;
    }

    onChange({
      ...data,
      plannedCities: [
        ...data.plannedCities,
        {
          id: createSlug(city),
          city,
          country,
          dateRange: readFormText(formData, "dateRange", "Dates TBD"),
          totalMonthlyCost: readFormNumber(formData, "totalMonthlyCost"),
          opportunityScore: readFormNumber(formData, "opportunityScore"),
          status: "Planned",
          notes: readFormText(formData, "notes", "Needs research"),
        },
      ],
    });
    event.currentTarget.reset();
  };

  const addOrganization = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = readFormText(formData, "name");

    if (!name) {
      return;
    }

    onChange({
      ...data,
      organizations: [
        ...data.organizations,
        {
          id: createRecordId("organization"),
          name,
          type: readFormText(formData, "type", "Brand"),
          country: readFormText(formData, "country", "TBD"),
          city: readFormText(formData, "city", "TBD"),
          fitScore: readFormNumber(formData, "fitScore"),
          nextAction: readFormText(formData, "nextAction", "Research contact"),
        },
      ],
    });
    event.currentTarget.reset();
  };

  const addCollaboration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = readFormText(formData, "title");

    if (!title) {
      return;
    }

    onChange({
      ...data,
      collaborations: [
        ...data.collaborations,
        {
          id: createRecordId("collaboration"),
          title,
          partner: readFormText(formData, "partner", "Partner TBD"),
          city: readFormText(formData, "city", "TBD"),
          status: "Research",
          estimatedValue: readFormNumber(formData, "estimatedValue"),
          nextStep: readFormText(formData, "nextStep", "Define next step"),
        },
      ],
    });
    event.currentTarget.reset();
  };

  const addConcert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = readFormText(formData, "title");

    if (!title) {
      return;
    }

    onChange({
      ...data,
      concerts: [
        ...data.concerts,
        {
          id: createRecordId("concert"),
          title,
          date: readFormText(formData, "date", "TBD"),
          city: readFormText(formData, "city", "TBD"),
          venue: readFormText(formData, "venue", "Venue TBD"),
          status: "Idea",
          expectedRevenue: readFormNumber(formData, "expectedRevenue"),
        },
      ],
    });
    event.currentTarget.reset();
  };

  return (
    <section className="data-page" aria-label="Royce Data intake">
      <div className="data-hero panel">
        <div>
          <span>Phase 1 · Royce Data</span>
          <h2>Make the operating system truthful before Supabase.</h2>
          <p>
            These records persist in this browser and become the baseline for Phase 2 database tables.
          </p>
        </div>
        <button onClick={() => onChange(initialRoyceData)} type="button">
          Reset seed data
        </button>
      </div>

      <div className="data-stats">
        <DataStat label="Current cash" value={euro.format(data.profile.currentCash)} />
        <DataStat label="Monthly expenses" value={euro.format(totalExpenses)} />
        <DataStat label="Sponsor target" value={`${data.profile.sponsorSent}/${data.profile.sponsorTarget}`} />
        <DataStat label="Active goals" value={String(data.goals.length)} />
        <DataStat label="Active collaborations" value={String(activeCollaborations)} />
        <DataStat label="Concert upside" value={euro.format(expectedConcertRevenue)} />
      </div>

      <div className="data-grid">
        <section className="panel data-panel data-panel-wide">
          <PanelTitle title="Operating Baseline" />
          <div className="data-form baseline-form">
            <label>
              <span>Current cash</span>
              <input
                min="0"
                onChange={(event) => updateProfile({ currentCash: Number(event.target.value) })}
                type="number"
                value={data.profile.currentCash}
              />
            </label>
            <label>
              <span>Monthly budget</span>
              <input
                min="0"
                onChange={(event) => updateProfile({ monthlyBudget: Number(event.target.value) })}
                type="number"
                value={data.profile.monthlyBudget}
              />
            </label>
            <label>
              <span>Sponsor target</span>
              <input
                min="0"
                onChange={(event) => updateProfile({ sponsorTarget: Number(event.target.value) })}
                type="number"
                value={data.profile.sponsorTarget}
              />
            </label>
            <label>
              <span>Emails sent</span>
              <input
                min="0"
                onChange={(event) => updateProfile({ sponsorSent: Number(event.target.value) })}
                type="number"
                value={data.profile.sponsorSent}
              />
            </label>
            <label>
              <span>Current city</span>
              <select onChange={(event) => updateCurrentCity(event.target.value)} value={data.profile.currentCityId}>
                {data.plannedCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city}, {city.country}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Updated at</span>
              <input
                onChange={(event) => updateProfile({ updatedAt: event.target.value })}
                type="date"
                value={data.profile.updatedAt}
              />
            </label>
          </div>
        </section>

        <section className="panel data-panel data-panel-wide goals-sync-panel">
          <PanelTitle title="AI Plan Sync" action="Live local strategy" />
          <p>{strategy.headline}</p>
          <div className="strategy-grid">
            {strategy.nextMoves.map((move) => (
              <article key={move}>
                <span>AI</span>
                <strong>{move}</strong>
              </article>
            ))}
          </div>
        </section>

        <DataCollection
          addForm={
            <form className="data-form compact-form goal-form" onSubmit={addGoal}>
              <input name="title" placeholder="Goal" />
              <select name="category" defaultValue="Travel">
                <option>Travel</option>
                <option>Money</option>
                <option>Outreach</option>
                <option>Content</option>
                <option>Collaboration</option>
                <option>Nonprofit</option>
              </select>
              <input name="target" placeholder="Target / metric" />
              <input name="timeframe" placeholder="Timeframe" />
              <select name="priority" defaultValue="High">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <button type="submit">+ Add goal</button>
            </form>
          }
          title="Goals"
        >
          {data.goals.map((goal) => (
            <GoalRecordCard
              goal={goal}
              key={goal.id}
              onRemove={() =>
                onChange({
                  ...data,
                  goals: data.goals.filter((item) => item.id !== goal.id),
                })
              }
            />
          ))}
        </DataCollection>

        <DataCollection
          addForm={
            <form className="data-form compact-form" onSubmit={addExpense}>
              <input name="category" placeholder="Category" />
              <input min="0" name="amount" placeholder="Amount" type="number" />
              <input name="notes" placeholder="Notes" />
              <button type="submit">Add expense</button>
            </form>
          }
          title="Monthly Expenses"
        >
          {data.monthlyExpenses.map((expense) => (
            <ExpenseRecord
              expense={expense}
              key={expense.id}
              onRemove={() =>
                onChange({
                  ...data,
                  monthlyExpenses: data.monthlyExpenses.filter((item) => item.id !== expense.id),
                })
              }
            />
          ))}
        </DataCollection>

        <DataCollection
          addForm={
            <form className="data-form compact-form" onSubmit={addCity}>
              <input name="city" placeholder="City" />
              <input name="country" placeholder="Country" />
              <input name="dateRange" placeholder="Date range" />
              <input min="0" name="totalMonthlyCost" placeholder="Monthly cost" type="number" />
              <input max="10" min="0" name="opportunityScore" placeholder="Score / 10" step="0.1" type="number" />
              <input name="notes" placeholder="Notes" />
              <button type="submit">Add city</button>
            </form>
          }
          title="Planned Cities"
        >
          {data.plannedCities.map((city) => (
            <CityRecord
              city={city}
              key={city.id}
              onRemove={() =>
                onChange({
                  ...data,
                  plannedCities: data.plannedCities.filter((item) => item.id !== city.id),
                })
              }
            />
          ))}
        </DataCollection>

        <DataCollection
          addForm={
            <form className="data-form compact-form" onSubmit={addOrganization}>
              <input name="name" placeholder="Organization" />
              <input name="type" placeholder="Type" />
              <input name="city" placeholder="City" />
              <input name="country" placeholder="Country" />
              <input max="100" min="0" name="fitScore" placeholder="Fit score" type="number" />
              <input name="nextAction" placeholder="Next action" />
              <button type="submit">Add org</button>
            </form>
          }
          title="Organizations"
        >
          {data.organizations.map((organization) => (
            <OrganizationDataRecord
              key={organization.id}
              onRemove={() =>
                onChange({
                  ...data,
                  organizations: data.organizations.filter((item) => item.id !== organization.id),
                })
              }
              organization={organization}
            />
          ))}
        </DataCollection>

        <DataCollection
          addForm={
            <form className="data-form compact-form" onSubmit={addCollaboration}>
              <input name="title" placeholder="Collaboration" />
              <input name="partner" placeholder="Partner" />
              <input name="city" placeholder="City" />
              <input min="0" name="estimatedValue" placeholder="Value" type="number" />
              <input name="nextStep" placeholder="Next step" />
              <button type="submit">Add collaboration</button>
            </form>
          }
          title="Collaborations"
        >
          {data.collaborations.map((collaboration) => (
            <CollaborationDataRecord
              collaboration={collaboration}
              key={collaboration.id}
              onRemove={() =>
                onChange({
                  ...data,
                  collaborations: data.collaborations.filter((item) => item.id !== collaboration.id),
                })
              }
            />
          ))}
        </DataCollection>

        <DataCollection
          addForm={
            <form className="data-form compact-form" onSubmit={addConcert}>
              <input name="title" placeholder="Concert" />
              <input name="date" type="date" />
              <input name="city" placeholder="City" />
              <input name="venue" placeholder="Venue" />
              <input min="0" name="expectedRevenue" placeholder="Revenue" type="number" />
              <button type="submit">Add concert</button>
            </form>
          }
          title="Concerts"
        >
          {data.concerts.map((concert) => (
            <ConcertDataRecord
              concert={concert}
              key={concert.id}
              onRemove={() =>
                onChange({
                  ...data,
                  concerts: data.concerts.filter((item) => item.id !== concert.id),
                })
              }
            />
          ))}
        </DataCollection>
      </div>
    </section>
  );
}

function DataStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel data-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataCollection({ addForm, children, title }: { addForm: ReactElement; children: ReactNode; title: string }) {
  return (
    <section className="panel data-panel">
      <PanelTitle title={title} />
      <p className="long-press-hint">Long-press a card to reveal Delete.</p>
      <div className="record-list">{children}</div>
      {addForm}
    </section>
  );
}

function GoalRecordCard({ goal, onRemove }: { goal: GoalRecord; onRemove: () => void }) {
  return (
    <LongPressDeleteCard ariaLabel={`${goal.title} goal`} className="record-card goal-record" onDelete={onRemove}>
      <div>
        <strong>{goal.title}</strong>
        <small>
          {goal.category} · {goal.target} · {goal.timeframe}
        </small>
      </div>
      <em>{goal.priority}</em>
    </LongPressDeleteCard>
  );
}

function ExpenseRecord({ expense, onRemove }: { expense: MonthlyExpense; onRemove: () => void }) {
  return (
    <LongPressDeleteCard ariaLabel={`${expense.category} expense`} onDelete={onRemove}>
      <div>
        <strong>{expense.category}</strong>
        <small>{expense.notes}</small>
      </div>
      <em>{euro.format(expense.amount)}</em>
    </LongPressDeleteCard>
  );
}

function CityRecord({ city, onRemove }: { city: PlannedCityRecord; onRemove: () => void }) {
  return (
    <LongPressDeleteCard ariaLabel={`${city.city} route city`} onDelete={onRemove}>
      <div>
        <strong>
          {city.city}, {city.country}
        </strong>
        <small>
          {city.status} · {city.dateRange} · {city.notes}
        </small>
      </div>
      <em>{city.opportunityScore.toFixed(1)}</em>
    </LongPressDeleteCard>
  );
}

function OrganizationDataRecord({ organization, onRemove }: { organization: OrganizationRecord; onRemove: () => void }) {
  return (
    <LongPressDeleteCard ariaLabel={`${organization.name} organization`} onDelete={onRemove}>
      <div>
        <strong>{organization.name}</strong>
        <small>
          {organization.type} · {organization.city}, {organization.country} · {organization.nextAction}
        </small>
      </div>
      <em>{organization.fitScore}</em>
    </LongPressDeleteCard>
  );
}

function CollaborationDataRecord({ collaboration, onRemove }: { collaboration: CollaborationRecord; onRemove: () => void }) {
  return (
    <LongPressDeleteCard ariaLabel={`${collaboration.title} collaboration`} onDelete={onRemove}>
      <div>
        <strong>{collaboration.title}</strong>
        <small>
          {collaboration.partner} · {collaboration.city} · {collaboration.nextStep}
        </small>
      </div>
      <em>{compactEuro.format(collaboration.estimatedValue)}</em>
    </LongPressDeleteCard>
  );
}

function ConcertDataRecord({ concert, onRemove }: { concert: ConcertRecord; onRemove: () => void }) {
  return (
    <LongPressDeleteCard ariaLabel={`${concert.title} concert`} onDelete={onRemove}>
      <div>
        <strong>{concert.title}</strong>
        <small>
          {concert.status} · {concert.city} · {concert.date} · {concert.venue}
        </small>
      </div>
      <em>{compactEuro.format(concert.expectedRevenue)}</em>
    </LongPressDeleteCard>
  );
}

function readFormText(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readFormNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));

  return Number.isFinite(value) ? value : 0;
}

function readGoalCategory(formData: FormData): GoalRecord["category"] {
  const value = readFormText(formData, "category", "Travel");
  const categories: GoalRecord["category"][] = ["Travel", "Money", "Outreach", "Content", "Collaboration", "Nonprofit"];

  return categories.includes(value as GoalRecord["category"]) ? (value as GoalRecord["category"]) : "Travel";
}

function readGoalPriority(formData: FormData): GoalRecord["priority"] {
  const value = readFormText(formData, "priority", "High");
  const priorities: GoalRecord["priority"][] = ["High", "Medium", "Low"];

  return priorities.includes(value as GoalRecord["priority"]) ? (value as GoalRecord["priority"]) : "High";
}

function createRecordId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function PanelTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      {action ? <button type="button">{action}</button> : null}
    </div>
  );
}

function iconFor(label: string) {
  const icons: Record<string, string> = {
    Dashboard: "▦",
    "Royce Data": "◉",
    Goals: "◎",
    "Travel Plan": "♜",
    Budget: "◈",
    Outreach: "✉",
    Contacts: "♙",
    Opportunities: "✧",
    Calendar: "▣",
    Content: "▤",
    Documents: "▱",
    Settings: "⚙",
  };

  return icons[label] ?? "•";
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();

  return Math.max(Math.ceil((end - start) / 86_400_000), 0);
}

export default App;
