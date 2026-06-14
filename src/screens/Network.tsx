import { useState } from "react";
import { useStore } from "../store";
import { useNav } from "../nav";
import { Empty, FormSheet, Warmth, avatarColor, initials } from "../ui";
import { WARMTH_LEVEL, contactStats } from "../metrics";
import { shortDate, todayISO, uid } from "../util";
import {
  buildContact,
  contactFields,
  contactToValues,
} from "../forms";
import type { Warmth as WarmthT } from "../types";

const WARMTH_TAG: Record<WarmthT, string> = {
  Cold: "t-grey",
  Cool: "t-blue",
  Warm: "t-gold",
  Active: "t-green",
};

export function Network() {
  const { db } = useStore();
  const nav = useNav();
  const [filter, setFilter] = useState<WarmthT | "All">("All");
  const cs = contactStats(db);
  const list = db.contacts.filter((c) => filter === "All" || c.warmth === filter);

  return (
    <div className="screen">
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card">
          <h3>Network</h3>
          <div className="kpi">{cs.total}</div>
          <div className="delta up">{cs.active} active</div>
        </div>
        <div className="card">
          <h3>Cooling</h3>
          <div className="kpi">{cs.cooling}</div>
          <div className="delta down">need re-warming</div>
        </div>
      </div>

      <div className="seg">
        {(["All", "Active", "Warm", "Cool", "Cold"] as const).map((s) => (
          <button
            key={s}
            className={filter === s ? "on" : ""}
            onClick={() => setFilter(s as WarmthT | "All")}
          >
            {s}
          </button>
        ))}
      </div>

      {list.length === 0 ? <Empty text="No contacts here yet." /> : null}
      <div className="card">
        {list.map((c) => (
          <div className="lr" key={c.id} onClick={() => nav.go("contact", c.id)}>
            <span
              className="ava"
              style={{ background: avatarColor(c.name) }}
            >
              {initials(c.name)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="title" style={{ fontSize: 13.5 }}>
                {c.name}
              </div>
              <div className="sub">
                {c.flag} {c.role} · {shortDate(c.lastContact)}
              </div>
            </div>
            <Warmth level={WARMTH_LEVEL[c.warmth]} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactDetail() {
  const { db, update, remove } = useStore();
  const nav = useNav();
  const [editing, setEditing] = useState(false);
  const [logging, setLogging] = useState(false);
  const contact = db.contacts.find((c) => c.id === nav.route.param);

  if (!contact)
    return <div className="screen"><Empty text="Contact not found." /></div>;

  const relatedGrants = db.grants.filter((g) => g.country === contact.country);

  return (
    <div className="screen">
      <div className="card" style={{ textAlign: "center" }}>
        <span
          className="ava"
          style={{
            background: avatarColor(contact.name),
            width: 60,
            height: 60,
            fontSize: 20,
            margin: "4px auto 10px",
          }}
        >
          {initials(contact.name)}
        </span>
        <div className="title" style={{ fontSize: 18 }}>
          {contact.name}
        </div>
        <div className="sub" style={{ marginBottom: 10 }}>
          {contact.flag} {contact.role} · {contact.country}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <span className={`tag ${WARMTH_TAG[contact.warmth]}`}>
            {contact.warmth}
          </span>
          <Warmth level={WARMTH_LEVEL[contact.warmth]} />
        </div>
        <div className="btnrow">
          <button className="btn row2" onClick={() => setLogging(true)}>
            Log interaction
          </button>
          <button className="btn sec row2" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
      </div>

      {contact.tags.length ? (
        <div className="card">
          <h3>Tags</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {contact.tags.map((t) => (
              <span className="tag t-grey" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {contact.nextAction ? (
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <h3>Suggested next action</h3>
          <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>
            {contact.nextAction}
          </div>
        </div>
      ) : null}

      <div className="card">
        <h3>Interaction history</h3>
        {contact.history.length === 0 ? (
          <div className="sub">No interactions logged yet.</div>
        ) : (
          <div className="tl">
            {contact.history.map((h) => (
              <div className="ti" key={h.id}>
                <div className="td">{shortDate(h.date)}</div>
                <div className="tn">{h.note}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Linked grants · {contact.country}</h3>
        {relatedGrants.length === 0 ? (
          <div className="sub">No grants in this country.</div>
        ) : (
          relatedGrants.map((g) => (
            <div className="linkrow" key={g.id} onClick={() => nav.go("grant", g.id)}>
              <span>
                {g.flag} {g.name}
              </span>
              <span className="chev">›</span>
            </div>
          ))
        )}
      </div>

      {logging ? (
        <FormSheet
          title="Log interaction"
          fields={[
            { name: "note", label: "What happened?", type: "textarea", required: true },
          ]}
          submitLabel="Save & mark active"
          onSubmit={(v) => {
            update("contacts", contact.id, {
              warmth: "Active",
              lastContact: todayISO(),
              history: [
                { id: uid("h"), date: todayISO(), note: v.note },
                ...contact.history,
              ],
            });
            setLogging(false);
          }}
          onClose={() => setLogging(false)}
        />
      ) : null}

      {editing ? (
        <FormSheet
          title="Edit contact"
          fields={contactFields}
          initial={contactToValues(contact)}
          onSubmit={(v) => {
            const rebuilt = buildContact(v, contact.id);
            update("contacts", contact.id, {
              ...rebuilt,
              lastContact: contact.lastContact,
              history: contact.history,
            });
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
          onDelete={() => {
            remove("contacts", contact.id);
            setEditing(false);
            nav.back();
          }}
        />
      ) : null}
    </div>
  );
}
