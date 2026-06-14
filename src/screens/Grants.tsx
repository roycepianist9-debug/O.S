import { useState } from "react";
import { useStore } from "../store";
import { useNav } from "../nav";
import { Empty, FormSheet } from "../ui";
import { grantStats } from "../metrics";
import { dueLabel, euro, euroK } from "../util";
import {
  buildGrant,
  GRANT_STAGES,
  grantFields,
  grantToValues,
} from "../forms";
import type { GrantStage } from "../types";

const STAGE_TAG: Record<GrantStage, string> = {
  Research: "t-grey",
  Preparing: "t-blue",
  Submitted: "t-gold",
  Awarded: "t-green",
  Reporting: "t-purple",
};

export function Grants() {
  const { db } = useStore();
  const nav = useNav();
  const [filter, setFilter] = useState<GrantStage | "All">("All");
  const gs = grantStats(db);
  const list = db.grants.filter((g) => filter === "All" || g.stage === filter);

  return (
    <div className="screen">
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card">
          <h3>Open</h3>
          <div className="kpi">{gs.openCount}</div>
          <div className="delta muted">{euroK(gs.potential)} potential</div>
        </div>
        <div className="card">
          <h3>Win rate</h3>
          <div className="kpi">{gs.winRate}%</div>
          <div className="delta up">{euroK(gs.won)} won</div>
        </div>
      </div>

      <div className="seg">
        {(["All", ...GRANT_STAGES] as const).map((s) => (
          <button
            key={s}
            className={filter === s ? "on" : ""}
            onClick={() => setFilter(s as GrantStage | "All")}
          >
            {s}
          </button>
        ))}
      </div>

      {list.length === 0 ? <Empty text="No grants in this stage yet." /> : null}
      {list.map((g) => {
        const due = dueLabel(g.due);
        return (
          <div
            className="card tap"
            key={g.id}
            style={due?.urgent ? { borderColor: "var(--red)" } : undefined}
            onClick={() => nav.go("grant", g.id)}
          >
            <div className="row" style={{ marginBottom: 6 }}>
              <div className="title">{g.name}</div>
              <span className={`tag ${STAGE_TAG[g.stage]}`}>{g.stage}</span>
            </div>
            <div className="row">
              <div className="sub">
                {g.flag} {g.type}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {due ? (
                  <span className={`tag ${due.urgent ? "t-red" : "t-grey"}`}>
                    {due.text}
                  </span>
                ) : null}
                <b style={{ color: "var(--accent2)" }}>{euro.format(g.amount)}</b>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GrantDetail() {
  const { db, update, remove } = useStore();
  const nav = useNav();
  const [editing, setEditing] = useState(false);
  const grant = db.grants.find((g) => g.id === nav.route.param);

  if (!grant) return <div className="screen"><Empty text="Grant not found." /></div>;

  const due = dueLabel(grant.due);
  const doneCount = grant.checklist.filter((c) => c.done).length;
  const relatedContacts = db.contacts.filter((c) => c.country === grant.country);

  const toggle = (cid: string) => {
    update("grants", grant.id, {
      checklist: grant.checklist.map((c) =>
        c.id === cid ? { ...c, done: !c.done } : c,
      ),
    });
  };

  return (
    <div className="screen">
      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <div className="title" style={{ fontSize: 17 }}>
            {grant.flag} {grant.name}
          </div>
          <button className="pill" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
        <div className="row">
          <span className="pill">{grant.type}</span>
          <b style={{ color: "var(--accent2)", fontSize: 18 }}>
            {euro.format(grant.amount)}
          </b>
        </div>
        <hr />
        <div className="kv">
          <span>Stage</span>
          <b>{grant.stage}</b>
        </div>
        <div className="kv">
          <span>Deadline</span>
          <b style={due?.urgent ? { color: "var(--red)" } : undefined}>
            {due ? due.text : "—"}
          </b>
        </div>
        <div className="kv">
          <span>Country</span>
          <b>
            {grant.flag} {grant.country}
          </b>
        </div>
      </div>

      <div className="card">
        <h3>
          Application checklist · {doneCount}/{grant.checklist.length}
        </h3>
        {grant.checklist.length === 0 ? (
          <div className="sub">No checklist items yet — edit to add notes.</div>
        ) : null}
        {grant.checklist.map((c) => (
          <div
            className={`check ${c.done ? "on" : ""}`}
            key={c.id}
            onClick={() => toggle(c.id)}
          >
            <span className={`box ${c.done ? "on" : ""}`}>{c.done ? "✓" : ""}</span>
            <span className="ck-lbl">{c.label}</span>
          </div>
        ))}
      </div>

      {grant.notes ? (
        <div className="card">
          <h3>Notes</h3>
          <div className="note">{grant.notes}</div>
        </div>
      ) : null}

      <div className="card">
        <h3>Linked contacts · {grant.country}</h3>
        {relatedContacts.length === 0 ? (
          <div className="sub">No contacts in this country yet.</div>
        ) : (
          relatedContacts.map((c) => (
            <div
              className="linkrow"
              key={c.id}
              onClick={() => nav.go("contact", c.id)}
            >
              <span>
                {c.flag} {c.name} · {c.role}
              </span>
              <span className="chev">›</span>
            </div>
          ))
        )}
      </div>

      {editing ? (
        <FormSheet
          title="Edit grant"
          fields={grantFields}
          initial={grantToValues(grant)}
          onSubmit={(v) => {
            update("grants", grant.id, buildGrant(v, grant.id));
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
          onDelete={() => {
            remove("grants", grant.id);
            setEditing(false);
            nav.back();
          }}
        />
      ) : null}
    </div>
  );
}
