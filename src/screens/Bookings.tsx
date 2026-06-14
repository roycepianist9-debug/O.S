import { useState } from "react";
import { useStore } from "../store";
import { useNav } from "../nav";
import { Empty, FormSheet } from "../ui";
import { euro, euroK, shortDate } from "../util";
import {
  buildBooking,
  bookingFields,
  bookingToValues,
} from "../forms";
import type { BookingStatus } from "../types";

const STATUS_TAG: Record<BookingStatus, string> = {
  Inquiry: "t-grey",
  Holding: "t-gold",
  Confirmed: "t-blue",
  Completed: "t-green",
};

export function Bookings() {
  const { db } = useStore();
  const nav = useNav();
  const [filter, setFilter] = useState<BookingStatus | "All">("All");

  const list = db.bookings
    .filter((b) => filter === "All" || b.status === filter)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  const confirmedFees = db.bookings
    .filter((b) => b.status === "Confirmed" || b.status === "Completed")
    .reduce((s, b) => s + b.fee, 0);
  const pipeline = db.bookings
    .filter((b) => b.status === "Inquiry" || b.status === "Holding")
    .reduce((s, b) => s + b.fee, 0);

  return (
    <div className="screen">
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card">
          <h3>Confirmed fees</h3>
          <div className="kpi">{euroK(confirmedFees)}</div>
        </div>
        <div className="card">
          <h3>Pipeline</h3>
          <div className="kpi">{euroK(pipeline)}</div>
        </div>
      </div>

      <div className="seg">
        {(["All", "Inquiry", "Holding", "Confirmed", "Completed"] as const).map(
          (s) => (
            <button
              key={s}
              className={filter === s ? "on" : ""}
              onClick={() => setFilter(s as BookingStatus | "All")}
            >
              {s}
            </button>
          ),
        )}
      </div>

      {list.length === 0 ? <Empty text="No bookings here yet." /> : null}
      {list.map((b) => (
        <div className="card tap" key={b.id} onClick={() => nav.go("booking", b.id)}>
          <div className="row" style={{ marginBottom: 6 }}>
            <div className="title">{b.title}</div>
            <span className={`tag ${STATUS_TAG[b.status]}`}>{b.status}</span>
          </div>
          <div className="row">
            <span className="sub">
              {b.flag} {b.city} · {b.type}
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="sub">{shortDate(b.date)}</span>
              <b style={{ color: "var(--accent2)" }}>{euro.format(b.fee)}</b>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingDetail() {
  const { db, update, remove } = useStore();
  const nav = useNav();
  const [editing, setEditing] = useState(false);
  const b = db.bookings.find((x) => x.id === nav.route.param);

  if (!b) return <div className="screen"><Empty text="Booking not found." /></div>;

  const markCompleted = () => {
    update("bookings", b.id, { status: "Completed" });
  };

  return (
    <div className="screen">
      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <div className="title" style={{ fontSize: 17 }}>
            {b.title}
          </div>
          <button className="pill" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
        <div className="kv">
          <span>Type</span>
          <b>{b.type}</b>
        </div>
        <div className="kv">
          <span>Where</span>
          <b>
            {b.flag} {b.city}, {b.country}
          </b>
        </div>
        <div className="kv">
          <span>Date</span>
          <b>{shortDate(b.date)}</b>
        </div>
        <div className="kv">
          <span>Fee</span>
          <b style={{ color: "var(--accent2)" }}>{euro.format(b.fee)}</b>
        </div>
        <div className="kv">
          <span>Status</span>
          <b>{b.status}</b>
        </div>
      </div>

      {b.notes ? (
        <div className="card">
          <h3>Notes</h3>
          <div className="note">{b.notes}</div>
        </div>
      ) : null}

      {b.status !== "Completed" ? (
        <button className="btn" onClick={markCompleted}>
          Mark completed
        </button>
      ) : (
        <div className="card" style={{ borderColor: "var(--accent2)" }}>
          <div className="sub">
            Completed — log the {euro.format(b.fee)} fee in Money to feed your YTD
            and 15% tracker.
          </div>
        </div>
      )}

      {editing ? (
        <FormSheet
          title="Edit booking"
          fields={bookingFields}
          initial={bookingToValues(b)}
          onSubmit={(v) => {
            update("bookings", b.id, buildBooking(v, b.id));
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
          onDelete={() => {
            remove("bookings", b.id);
            setEditing(false);
            nav.back();
          }}
        />
      ) : null}
    </div>
  );
}
