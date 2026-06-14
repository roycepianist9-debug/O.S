import { useState } from "react";
import { useStore } from "../store";
import { useNav } from "../nav";
import { Empty, FormSheet } from "../ui";
import { euro } from "../util";
import {
  buildArrangement,
  arrangementFields,
  arrangementToValues,
} from "../forms";
import type { Arrangement } from "../types";

const DIFF_TAG: Record<Arrangement["difficulty"], string> = {
  Easy: "t-green",
  Intermediate: "t-gold",
  Advanced: "t-red",
};

export function Repertoire() {
  const { db } = useStore();
  const nav = useNav();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | "Shop">("All");

  const list = db.arrangements.filter((a) => {
    if (filter === "Shop" && !a.inShop) return false;
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      a.title.toLowerCase().includes(s) ||
      a.artist.toLowerCase().includes(s) ||
      a.category.toLowerCase().includes(s)
    );
  });

  const inShop = db.arrangements.filter((a) => a.inShop).length;

  return (
    <div className="screen">
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card">
          <h3>Arrangements</h3>
          <div className="kpi">{db.arrangements.length}</div>
        </div>
        <div className="card">
          <h3>In shop</h3>
          <div className="kpi">{inShop}</div>
        </div>
      </div>

      <input
        className="search"
        placeholder="Search title, artist, category…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="seg">
        {(["All", "Shop"] as const).map((s) => (
          <button
            key={s}
            className={filter === s ? "on" : ""}
            onClick={() => setFilter(s)}
          >
            {s === "Shop" ? "In shop" : "All"}
          </button>
        ))}
      </div>

      {list.length === 0 ? <Empty text="No arrangements match." /> : null}
      <div className="card">
        {list.map((a) => (
          <div
            className="lr"
            key={a.id}
            onClick={() => nav.go("arrangement", a.id)}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="title" style={{ fontSize: 13.5 }}>
                {a.title}
              </div>
              <div className="sub">
                {a.artist} · {a.usedInSetlists} setlists
              </div>
            </div>
            <span className={`tag ${DIFF_TAG[a.difficulty]}`}>
              {a.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArrangementDetail() {
  const { db, update, remove } = useStore();
  const nav = useNav();
  const [editing, setEditing] = useState(false);
  const a = db.arrangements.find((x) => x.id === nav.route.param);

  if (!a) return <div className="screen"><Empty text="Arrangement not found." /></div>;

  return (
    <div className="screen">
      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <div className="title" style={{ fontSize: 17 }}>
            {a.title}
          </div>
          <button className="pill" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
        <div className="kv">
          <span>Artist</span>
          <b>{a.artist}</b>
        </div>
        <div className="kv">
          <span>Category</span>
          <b>{a.category}</b>
        </div>
        <div className="kv">
          <span>Difficulty</span>
          <b>{a.difficulty}</b>
        </div>
        <div className="kv">
          <span>Used in</span>
          <b>{a.usedInSetlists} setlists</b>
        </div>
      </div>

      <div className="card">
        <h3>Shop listing</h3>
        <div className="row">
          <span className={`tag ${a.inShop ? "t-green" : "t-grey"}`}>
            {a.inShop ? "Listed" : "Not listed"}
          </span>
          {a.inShop ? (
            <b style={{ color: "var(--accent2)" }}>{euro.format(a.price)}</b>
          ) : null}
        </div>
        <button
          className="btn sec"
          style={{ marginTop: 12 }}
          onClick={() => update("arrangements", a.id, { inShop: !a.inShop })}
        >
          {a.inShop ? "Remove from shop" : "List in shop"}
        </button>
      </div>

      {editing ? (
        <FormSheet
          title="Edit arrangement"
          fields={arrangementFields}
          initial={arrangementToValues(a)}
          onSubmit={(v) => {
            const rebuilt = buildArrangement(v, a.id);
            update("arrangements", a.id, {
              ...rebuilt,
              usedInSetlists: a.usedInSetlists,
            });
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
          onDelete={() => {
            remove("arrangements", a.id);
            setEditing(false);
            nav.back();
          }}
        />
      ) : null}
    </div>
  );
}
