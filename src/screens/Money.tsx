import { useState } from "react";
import { useStore } from "../store";
import { useNav } from "../nav";
import { Empty, FormSheet, Progress } from "../ui";
import {
  byStream,
  monthIncome,
  monthlySeries,
  nonprofitGiven,
  nonprofitPctOfYTD,
  nonprofitTarget,
  ytdIncome,
} from "../metrics";
import { euro, euroK, shortDate } from "../util";
import {
  buildIncome,
  incomeFields,
  incomeToValues,
} from "../forms";
import type { Income } from "../types";

export function Money() {
  const { db, update, remove } = useStore();
  const nav = useNav();
  const [edit, setEdit] = useState<Income | null>(null);

  const streams = byStream(db);
  const series = monthlySeries(db);
  const maxBar = Math.max(...series.map((s) => s.amount), 1);
  const npGiven = nonprofitGiven(db);
  const npTarget = nonprofitTarget(db);

  const stops = streams
    .reduce<{ at: number; parts: string[] }>(
      (acc, s) => {
        const end = acc.at + s.pct;
        acc.parts.push(`${s.color} ${acc.at}% ${end}%`);
        return { at: end, parts: acc.parts };
      },
      { at: 0, parts: [] },
    )
    .parts.join(", ");

  return (
    <div className="screen">
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card">
          <h3>This Month</h3>
          <div className="kpi">{euroK(monthIncome(db))}</div>
        </div>
        <div className="card">
          <h3>YTD</h3>
          <div className="kpi">{euroK(ytdIncome(db))}</div>
        </div>
      </div>

      <div className="card tap" onClick={() => nav.go("nonprofit")}>
        <div className="row" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Nonprofit 15% redistribution</h3>
          <span className="chev">›</span>
        </div>
        <Progress value={(npGiven / npTarget) * 100} />
        <div className="row" style={{ marginTop: 8 }}>
          <span className="sub">{euro.format(npGiven)} given</span>
          <span className="sub">
            target {euro.format(npTarget)} ({nonprofitPctOfYTD(db).toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="card">
        <h3>Monthly trend</h3>
        <div className="bars">
          {series.map((s) => (
            <div className="barcol" key={s.key}>
              <div
                className="barfill"
                style={{ height: `${(s.amount / maxBar) * 100}%` }}
              />
              <div className="bl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Income by stream</h3>
        <div className="donutwrap">
          <div
            className="donut"
            style={{ background: `conic-gradient(${stops})` }}
          >
            <div className="hole">
              <b>{euroK(ytdIncome(db))}</b>
            </div>
          </div>
        </div>
        <div className="legend">
          {streams.map((s) => (
            <div className="lg" key={s.stream}>
              <span className="dot" style={{ background: s.color }} />
              <span className="ln">{s.stream}</span>
              <span className="lv">{s.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sect">Income log</div>
      {db.income.length === 0 ? <Empty text="No income logged yet." /> : null}
      <div className="card">
        {db.income.map((i) => (
          <div className="lr" key={i.id} onClick={() => setEdit(i)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="title" style={{ fontSize: 13.5 }}>
                {i.label}
              </div>
              <div className="sub">
                {i.flag} {i.stream} · {shortDate(i.date)}
              </div>
            </div>
            <b style={{ color: "var(--accent2)" }}>{euro.format(i.amount)}</b>
          </div>
        ))}
      </div>

      {edit ? (
        <FormSheet
          title="Edit income"
          fields={incomeFields}
          initial={incomeToValues(edit)}
          onSubmit={(v) => {
            update("income", edit.id, buildIncome(v, edit.id));
            setEdit(null);
          }}
          onClose={() => setEdit(null)}
          onDelete={() => {
            remove("income", edit.id);
            setEdit(null);
          }}
        />
      ) : null}
    </div>
  );
}
