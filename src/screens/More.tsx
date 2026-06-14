import { useState } from "react";
import { useStore } from "../store";
import { useNav } from "../nav";
import { Empty } from "../ui";
import { euro } from "../util";

const ITEMS: { name: string; label: string; emoji: string; sub: string }[] = [
  { name: "goals", label: "Goals", emoji: "◎", sub: "Verticals & milestones" },
  { name: "content", label: "Content & Media", emoji: "▶", sub: "Multi-channel calendar" },
  { name: "bookings", label: "Bookings & Tours", emoji: "♪", sub: "Gigs, fees, routing" },
  { name: "repertoire", label: "Repertoire Vault", emoji: "♬", sub: "Arrangements & shop" },
  { name: "countries", label: "Country Boards", emoji: "⌖", sub: "Strategy per market" },
  { name: "nonprofit", label: "Nonprofit 15%", emoji: "♥", sub: "Redistribution tracker" },
  { name: "search", label: "Search", emoji: "⌕", sub: "Find anything" },
  { name: "settings", label: "Settings", emoji: "⚙", sub: "Profile & data" },
];

export function More() {
  const { db } = useStore();
  const nav = useNav();
  return (
    <div className="screen">
      <div className="card">
        <div className="row">
          <div>
            <div className="title" style={{ fontSize: 17 }}>
              {db.profile.name} · {db.profile.alias}
            </div>
            <div className="sub">
              Based in {db.profile.base} · {db.profile.languages.length} languages
            </div>
          </div>
          <span className="pill">b. {db.profile.born}</span>
        </div>
      </div>

      {ITEMS.map((it) => (
        <div className="card tap" key={it.name} onClick={() => nav.go(it.name)}>
          <div className="lr" style={{ padding: 0, borderBottom: "none" }}>
            <span className="mico">{it.emoji}</span>
            <div style={{ flex: 1 }}>
              <div className="title" style={{ fontSize: 14 }}>
                {it.label}
              </div>
              <div className="sub">{it.sub}</div>
            </div>
            <span className="chev">›</span>
          </div>
        </div>
      ))}
    </div>
  );
}

type Hit = { route: string; id: string; title: string; sub: string };

export function Search() {
  const { db } = useStore();
  const nav = useNav();
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();

  const hits: Hit[] = [];
  if (s) {
    for (const g of db.grants)
      if (g.name.toLowerCase().includes(s) || g.country.toLowerCase().includes(s))
        hits.push({ route: "grant", id: g.id, title: g.name, sub: `Grant · ${g.country}` });
    for (const c of db.contacts)
      if (c.name.toLowerCase().includes(s) || c.role.toLowerCase().includes(s))
        hits.push({ route: "contact", id: c.id, title: c.name, sub: `Contact · ${c.role}` });
    for (const b of db.bookings)
      if (b.title.toLowerCase().includes(s) || b.city.toLowerCase().includes(s))
        hits.push({ route: "booking", id: b.id, title: b.title, sub: `Booking · ${b.city}` });
    for (const a of db.arrangements)
      if (a.title.toLowerCase().includes(s) || a.artist.toLowerCase().includes(s))
        hits.push({ route: "arrangement", id: a.id, title: a.title, sub: `Arrangement · ${a.artist}` });
    for (const c of db.content)
      if (c.title.toLowerCase().includes(s))
        hits.push({ route: "content", id: c.id, title: c.title, sub: `Content · ${c.channel}` });
    for (const c of db.countries)
      if (c.name.toLowerCase().includes(s))
        hits.push({ route: "country", id: c.id, title: c.name, sub: "Country board" });
    for (const g of db.goals)
      if (g.title.toLowerCase().includes(s))
        hits.push({ route: "goal", id: g.id, title: g.title, sub: `Goal · ${g.vertical}` });
  }

  return (
    <div className="screen">
      <input
        className="search"
        autoFocus
        placeholder="Search grants, contacts, bookings…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {!s ? <Empty text="Type to search across everything." /> : null}
      {s && hits.length === 0 ? <Empty text="No matches." /> : null}
      <div className="card">
        {hits.map((h) => (
          <div
            className="lr"
            key={`${h.route}-${h.id}`}
            onClick={() => nav.go(h.route, h.id)}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="title" style={{ fontSize: 13.5 }}>
                {h.title}
              </div>
              <div className="sub">{h.sub}</div>
            </div>
            <span className="chev">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Settings() {
  const { db, setProfile, resetAll } = useStore();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="screen">
      <div className="card">
        <h3>Profile</h3>
        <div className="kv">
          <span>Name</span>
          <b>
            {db.profile.name} ({db.profile.alias})
          </b>
        </div>
        <div className="kv">
          <span>Base</span>
          <b>{db.profile.base}</b>
        </div>
        <div className="kv">
          <span>Languages</span>
          <b style={{ textAlign: "right", maxWidth: 180 }}>
            {db.profile.languages.join(", ")}
          </b>
        </div>
      </div>

      <div className="card">
        <h3>Nonprofit target</h3>
        <div className="field">
          <label htmlFor="np">Redistribution % of income</label>
          <input
            id="np"
            type="number"
            value={db.profile.nonprofitTargetPct}
            onChange={(e) =>
              setProfile({ nonprofitTargetPct: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div className="field">
          <label htmlFor="en">Energy committed %</label>
          <input
            id="en"
            type="number"
            value={db.profile.energyCommittedPct}
            onChange={(e) =>
              setProfile({ energyCommittedPct: Number(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      <div className="card">
        <h3>Data</h3>
        <div className="sub" style={{ marginBottom: 10 }}>
          Everything is stored privately on this device. YTD income:{" "}
          {euro.format(db.income.reduce((a, i) => a + i.amount, 0))}.
        </div>
        {confirm ? (
          <>
            <div className="note" style={{ marginBottom: 10 }}>
              This wipes your edits and restores the seeded data. Sure?
            </div>
            <div className="btnrow">
              <button className="btn danger row2" onClick={resetAll}>
                Yes, reset
              </button>
              <button
                className="btn sec row2"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button className="btn sec" onClick={() => setConfirm(true)}>
            Reset to seed data
          </button>
        )}
      </div>
    </div>
  );
}
