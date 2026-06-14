import { useState } from "react";
import { useStore } from "../store";
import { useNav } from "../nav";
import { Empty, FormSheet } from "../ui";
import { euro } from "../util";
import {
  buildCountry,
  countryFields,
  countryToValues,
} from "../forms";
import type { Country } from "../types";

const STATUS_TAG: Record<Country["status"], string> = {
  Active: "t-green",
  Building: "t-gold",
  Exploring: "t-grey",
};

function revenueFor(countryName: string, income: { country: string; amount: number }[]) {
  return income
    .filter((i) => i.country === countryName)
    .reduce((s, i) => s + i.amount, 0);
}

export function Countries() {
  const { db } = useStore();
  const nav = useNav();

  return (
    <div className="screen">
      <div className="sect">Country strategy boards</div>
      {db.countries.length === 0 ? <Empty text="No countries yet." /> : null}
      {db.countries.map((c) => {
        const rev = revenueFor(c.name, db.income);
        const grants = db.grants.filter((g) => g.country === c.name).length;
        const contacts = db.contacts.filter((x) => x.country === c.name).length;
        return (
          <div className="card tap" key={c.id} onClick={() => nav.go("country", c.id)}>
            <div className="row" style={{ marginBottom: 6 }}>
              <div className="title" style={{ fontSize: 15 }}>
                {c.flag} {c.name}
              </div>
              <span className={`tag ${STATUS_TAG[c.status]}`}>{c.status}</span>
            </div>
            <div className="row">
              <span className="sub">
                {contacts} contacts · {grants} grants
              </span>
              <b style={{ color: "var(--accent2)" }}>{euro.format(rev)}</b>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CountryDetail() {
  const { db, update, remove } = useStore();
  const nav = useNav();
  const [editing, setEditing] = useState(false);
  const c = db.countries.find((x) => x.id === nav.route.param);

  if (!c) return <div className="screen"><Empty text="Country not found." /></div>;

  const rev = revenueFor(c.name, db.income);
  const grants = db.grants.filter((g) => g.country === c.name);
  const contacts = db.contacts.filter((x) => x.country === c.name);
  const bookings = db.bookings.filter((b) => b.country === c.name);
  const doneCount = c.roadmap.filter((r) => r.done).length;

  const toggle = (rid: string) => {
    update("countries", c.id, {
      roadmap: c.roadmap.map((r) =>
        r.id === rid ? { ...r, done: !r.done } : r,
      ),
    });
  };

  return (
    <div className="screen">
      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <div className="title" style={{ fontSize: 18 }}>
            {c.flag} {c.name}
          </div>
          <button className="pill" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
        <span className={`tag ${STATUS_TAG[c.status]}`}>{c.status}</span>
        {c.notes ? (
          <div className="note" style={{ marginTop: 10 }}>
            {c.notes}
          </div>
        ) : null}
      </div>

      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card">
          <h3>Revenue</h3>
          <div className="kpi s">{euro.format(rev)}</div>
        </div>
        <div className="card">
          <h3>Network</h3>
          <div className="kpi s">{contacts.length}</div>
        </div>
      </div>

      <div className="card">
        <h3>
          Pathway roadmap · {doneCount}/{c.roadmap.length}
        </h3>
        {c.roadmap.length === 0 ? (
          <div className="sub">No roadmap items yet.</div>
        ) : (
          c.roadmap.map((r) => (
            <div
              className={`check ${r.done ? "on" : ""}`}
              key={r.id}
              onClick={() => toggle(r.id)}
            >
              <span className={`box ${r.done ? "on" : ""}`}>
                {r.done ? "✓" : ""}
              </span>
              <span className="ck-lbl">{r.label}</span>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Contacts</h3>
        {contacts.length === 0 ? (
          <div className="sub">No contacts here yet.</div>
        ) : (
          contacts.map((x) => (
            <div className="linkrow" key={x.id} onClick={() => nav.go("contact", x.id)}>
              <span>
                {x.name} · {x.role}
              </span>
              <span className="chev">›</span>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Grants</h3>
        {grants.length === 0 ? (
          <div className="sub">No grants here yet.</div>
        ) : (
          grants.map((g) => (
            <div className="linkrow" key={g.id} onClick={() => nav.go("grant", g.id)}>
              <span>
                {g.name} · {euro.format(g.amount)}
              </span>
              <span className="chev">›</span>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Bookings</h3>
        {bookings.length === 0 ? (
          <div className="sub">No bookings here yet.</div>
        ) : (
          bookings.map((b) => (
            <div className="linkrow" key={b.id} onClick={() => nav.go("booking", b.id)}>
              <span>
                {b.title} · {b.status}
              </span>
              <span className="chev">›</span>
            </div>
          ))
        )}
      </div>

      {editing ? (
        <FormSheet
          title="Edit country"
          fields={countryFields}
          initial={countryToValues(c)}
          onSubmit={(v) => {
            const rebuilt = buildCountry(v, c.id);
            update("countries", c.id, { ...rebuilt, roadmap: c.roadmap });
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
          onDelete={() => {
            remove("countries", c.id);
            setEditing(false);
            nav.back();
          }}
        />
      ) : null}
    </div>
  );
}
