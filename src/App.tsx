import {
  cities,
  contentProjects,
  opportunities,
  organizations,
  outreachCampaigns,
  recentActivity,
  routeCoordinates,
  tasks,
  transactions,
  type City,
  type Opportunity,
} from "./data";
import type { CSSProperties } from "react";

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
  "Travel Plan",
  "Budget",
  "Outreach",
  "Contacts",
  "Opportunities",
  "Calendar",
  "Content",
  "Documents",
  "Settings",
];

function App() {
  const selectedCity = cities[1];
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyBudget = 850;
  const cashBalance = 8240;
  const runwayMonths = cashBalance / monthlyBudget;
  const primaryCampaign = outreachCampaigns[0];
  const outreachProgress = primaryCampaign.sentCount / primaryCampaign.targetCount;
  const daysUntilDeadline = daysBetween("2025-05-25", primaryCampaign.deadline);
  const cadenceSlots = Math.ceil(daysUntilDeadline / primaryCampaign.cadenceEveryDays);
  const projectedEmails = primaryCampaign.sentCount + cadenceSlots * primaryCampaign.cadenceQuantity;
  const activeOpportunities = opportunities.filter(
    (opportunity) => !["Won", "Lost"].includes(opportunity.status),
  );

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span>ROYCE</span>
          <strong>OS</strong>
        </div>
        <p className="brand-subtitle">Your Personal Navigation System</p>

        <nav className="side-nav" aria-label="Primary navigation">
          {menuItems.map((item) => (
            <a className={item === "Dashboard" ? "active" : ""} href={`#${item}`} key={item}>
              <span className="nav-icon">{iconFor(item)}</span>
              {item}
            </a>
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
          <div>
            <h1>Dashboard <span>👋</span></h1>
            <p>Good morning, Royce. Let&apos;s make today count.</p>
          </div>
          <div className="topbar-actions">
            <Pill icon="⌖" label="Shanghai, China" />
            <Pill icon="☀" label="28°C" />
            <Pill icon="📅" label="May 25, 2025 · Sunday" />
            <button className="add-button" type="button" aria-label="Add opportunity">
              +
            </button>
          </div>
        </header>

        <section className="metrics-grid" aria-label="Dashboard metrics">
          <MetricCard
            accent="green"
            eyebrow="Cash Runway"
            value={runwayMonths.toFixed(1)}
            suffix="months"
            detail="+0.6 from last week"
            sparkline={[4, 5, 5, 6, 5, 4, 4, 6, 8, 7, 10, 9, 12]}
          />
          <MetricCard
            accent="blue"
            eyebrow="Daily Budget"
            value="€28.40"
            suffix="avg. per day"
            detail={`${euro.format(monthlyBudget)} / month`}
            sparkline={[3, 4, 4, 5, 4, 4, 4, 6, 8, 7, 10, 9, 12]}
          />
          <CityCard city={cities[0]} title="Current City" />
          <CityCard city={selectedCity} title="Next City" />
          <OutreachCard
            campaignName={primaryCampaign.name}
            progress={outreachProgress}
            sentCount={primaryCampaign.sentCount}
            targetCount={primaryCampaign.targetCount}
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
                {cities.map((city, index) => (
                  <li className={city.id === selectedCity.id ? "selected" : ""} key={city.id}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{city.city}</strong>
                      <small>{city.dateRange}</small>
                    </div>
                    <em>{city.overallScore.toFixed(1)}</em>
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
            monthlyBudget={monthlyBudget}
            totalExpenses={totalExpenses}
            cashBalance={cashBalance}
            selectedCity={selectedCity}
          />

          <OpportunityPanel opportunities={activeOpportunities} />

          <ContentPanel />

          <ActivityPanel />

          <AiNotes selectedCity={selectedCity} />
        </section>
      </main>
    </div>
  );
}

function Pill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="pill">
      <span>{icon}</span>
      {label}
    </span>
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
  progress,
  sentCount,
  targetCount,
  projectedEmails,
}: {
  campaignName: string;
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
        <span>Need 30 every 2 days</span>
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
  selectedCity,
}: {
  monthlyBudget: number;
  totalExpenses: number;
  cashBalance: number;
  selectedCity: City;
}) {
  const spendPercent = Math.round((totalExpenses / monthlyBudget) * 100);
  const twelveMonthProjection = Array.from({ length: 12 }, (_, index) => {
    const seasonalVariance = index % 3 === 0 ? 90 : -20;
    return Math.max(cashBalance - (index + 1) * (selectedCity.totalMonthlyCost + seasonalVariance), 0);
  });

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
        {transactions
          .filter((transaction) => transaction.type === "expense")
          .map((transaction) => (
            <div key={transaction.id}>
              <span>{transaction.category}</span>
              <strong>{euro.format(transaction.amount)}</strong>
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

function AiNotes({ selectedCity }: { selectedCity: City }) {
  const topBrands = organizations
    .filter((organization) => organization.city === selectedCity.city || organization.country === selectedCity.country)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3)
    .map((organization) => organization.name)
    .join(", ");

  return (
    <section className="panel notes-panel">
      <PanelTitle title="Notes from AI Assistant" />
      <p>
        {selectedCity.city} has the best near-term opportunity density per euro. Prioritize {topBrands}
        , then turn each warm reply into a task, interaction, and opportunity record.
      </p>
      <button type="button">View Opportunities</button>
    </section>
  );
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
