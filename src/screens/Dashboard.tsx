import { useStore } from "../store";
import { useNav } from "../nav";
import { Progress } from "../ui";
import {
  byCountry,
  grantStats,
  monthIncome,
  nonprofitGiven,
  nonprofitPctOfYTD,
  nonprofitTarget,
  ytdIncome,
} from "../metrics";
import { dueLabel, euro, euroK } from "../util";

const VERT_TAG: Record<string, string> = {
  Music: "t-blue",
  "K-pop": "t-pink",
  Content: "t-purple",
  Nonprofit: "t-green",
  Teaching: "t-gold",
  Brand: "t-blue",
  Touring: "t-grey",
};

export default function Dashboard() {
  const { db } = useStore();
  const nav = useNav();
  const gs = grantStats(db);
  const npPct = nonprofitPctOfYTD(db);
  const npTarget = nonprofitTarget(db);
  const npGiven = nonprofitGiven(db);

  const urgentGrant = db.grants
    .filter((g) => dueLabel(g.due)?.urgent)
    .sort((a, b) => a.due.localeCompare(b.due))[0];
  const coolingContact = db.contacts.find(
    (c) => c.warmth === "Cool" || c.warmth === "Cold",
  );
  const countries = byCountry(db);

  return (
    <div className="screen">
      <div className="banner">
        <b>Bonjour, {db.profile.name}.</b> {gs.openCount} grants open ·{" "}
        {euroK(gs.potential)} potential · {db.bookings.filter((b) => b.status !== "Completed").length}{" "}
        upcoming bookings.
      </div>

      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card">
          <h3>This Month</h3>
          <div className="kpi">{euroK(monthIncome(db))}</div>
          <div className="delta muted">income logged</div>
        </div>
        <div className="card">
          <h3>YTD Total</h3>
          <div className="kpi">{euroK(ytdIncome(db))}</div>
          <div className="delta up">9 income streams</div>
        </div>
      </div>
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card tap" onClick={() => nav.go("nonprofit")}>
          <h3>Nonprofit 15%</h3>
          <div className="kpi s">{npPct.toFixed(1)}%</div>
          <div className="delta down">{euroK(npTarget - npGiven)} to goal</div>
        </div>
        <div className="card">
          <h3>Energy</h3>
          <div className="kpi s">{db.profile.energyCommittedPct}%</div>
          <div className="delta muted">committed</div>
        </div>
      </div>

      <div className="sect">Needs attention</div>
      {urgentGrant ? (
        <div
          className="card tap"
          style={{ borderColor: "var(--red)" }}
          onClick={() => nav.go("grant", urgentGrant.id)}
        >
          <div className="row">
            <div>
              <div className="title">{urgentGrant.name}</div>
              <div className="sub">
                {urgentGrant.flag} {urgentGrant.type}
              </div>
            </div>
            <span className="tag t-red">{dueLabel(urgentGrant.due)?.text}</span>
          </div>
        </div>
      ) : null}
      {coolingContact ? (
        <div
          className="card tap"
          onClick={() => nav.go("contact", coolingContact.id)}
        >
          <div className="row">
            <div>
              <div className="title">{coolingContact.name} cooling off</div>
              <div className="sub">{coolingContact.nextAction}</div>
            </div>
            <span className="tag t-gold">Re-warm</span>
          </div>
        </div>
      ) : null}

      <div className="sect">Goals by vertical</div>
      {db.goals.map((g) => (
        <div className="card tap" key={g.id} onClick={() => nav.go("goal", g.id)}>
          <div className="row" style={{ marginBottom: 9 }}>
            <div className="title">{g.title}</div>
            <span className={`tag ${VERT_TAG[g.vertical] ?? "t-grey"}`}>
              {g.vertical}
            </span>
          </div>
          <Progress value={g.progress} />
          <div className="sub" style={{ marginTop: 6 }}>
            {g.progress}% · {g.timeframe}
          </div>
        </div>
      ))}

      <div className="sect">Country status</div>
      <div className="card">
        {countries.slice(0, 6).map((c) => (
          <div className="linkrow" key={c.country}>
            <span>
              {c.flag} {c.country}
            </span>
            <span className="b" style={{ color: "var(--accent2)" }}>
              {euro.format(c.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
