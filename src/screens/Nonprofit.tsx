import { useState } from "react";
import { useStore } from "../store";
import { Empty, FormSheet, Progress } from "../ui";
import {
  nonprofitGiven,
  nonprofitPctOfYTD,
  nonprofitTarget,
  ytdIncome,
} from "../metrics";
import { euro, euroK, shortDate } from "../util";
import {
  buildContribution,
  contributionFields,
  contributionToValues,
} from "../forms";
import type { Contribution } from "../types";

export function Nonprofit() {
  const { db, update, remove } = useStore();
  const [edit, setEdit] = useState<Contribution | null>(null);

  const given = nonprofitGiven(db);
  const target = nonprofitTarget(db);
  const pct = nonprofitPctOfYTD(db);

  const byRegion = new Map<string, number>();
  for (const c of db.contributions) {
    byRegion.set(c.region, (byRegion.get(c.region) ?? 0) + c.amount);
  }
  const regions = [...byRegion.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="screen">
      <div className="card" style={{ textAlign: "center" }}>
        <h3>15% redistribution pledge</h3>
        <div className="kpi" style={{ fontSize: 30 }}>
          {pct.toFixed(1)}%
        </div>
        <div className="sub" style={{ marginBottom: 12 }}>
          of {euroK(ytdIncome(db))} YTD income
        </div>
        <Progress value={(given / target) * 100} />
        <div className="row" style={{ marginTop: 8 }}>
          <span className="sub">{euro.format(given)} given</span>
          <span className="sub">target {euro.format(target)}</span>
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          {given >= target
            ? "Pledge met — every new euro of income keeps the 15% flowing."
            : `${euro.format(target - given)} more to hit your 15% target this year.`}
        </div>
      </div>

      <div className="card">
        <h3>By region</h3>
        {regions.length === 0 ? (
          <div className="sub">No contributions yet.</div>
        ) : (
          regions.map(([region, amt]) => (
            <div className="kv" key={region}>
              <span>{region}</span>
              <b style={{ color: "var(--accent2)" }}>{euro.format(amt)}</b>
            </div>
          ))
        )}
      </div>

      <div className="sect">Contribution log</div>
      {db.contributions.length === 0 ? (
        <Empty text="Log your first donation with ＋." />
      ) : null}
      <div className="card">
        {db.contributions.map((c) => (
          <div className="lr" key={c.id} onClick={() => setEdit(c)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="title" style={{ fontSize: 13.5 }}>
                {c.cause}
              </div>
              <div className="sub">
                {c.region} · {shortDate(c.date)}
              </div>
            </div>
            <b style={{ color: "var(--accent2)" }}>{euro.format(c.amount)}</b>
          </div>
        ))}
      </div>

      {edit ? (
        <FormSheet
          title="Edit contribution"
          fields={contributionFields}
          initial={contributionToValues(edit)}
          onSubmit={(v) => {
            update("contributions", edit.id, buildContribution(v, edit.id));
            setEdit(null);
          }}
          onClose={() => setEdit(null)}
          onDelete={() => {
            remove("contributions", edit.id);
            setEdit(null);
          }}
        />
      ) : null}
    </div>
  );
}
