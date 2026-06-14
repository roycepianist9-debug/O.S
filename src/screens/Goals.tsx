import { useState } from "react";
import { useStore } from "../store";
import { useNav } from "../nav";
import { Empty, FormSheet, Progress } from "../ui";
import { euro } from "../util";
import { buildGoal, goalFields, goalToValues } from "../forms";

const VERT_TAG: Record<string, string> = {
  Music: "t-blue",
  "K-pop": "t-pink",
  Content: "t-purple",
  Nonprofit: "t-green",
  Teaching: "t-gold",
  Brand: "t-blue",
  Touring: "t-grey",
};

export function Goals() {
  const { db } = useStore();
  const nav = useNav();

  return (
    <div className="screen">
      <div className="sect">Goals by vertical</div>
      {db.goals.length === 0 ? <Empty text="No goals yet." /> : null}
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
    </div>
  );
}

export function GoalDetail() {
  const { db, update, remove } = useStore();
  const nav = useNav();
  const [editing, setEditing] = useState(false);
  const g = db.goals.find((x) => x.id === nav.route.param);

  if (!g) return <div className="screen"><Empty text="Goal not found." /></div>;

  const doneCount = g.milestones.filter((m) => m.done).length;
  const grants = db.grants.filter(
    (gr) => gr.type.toLowerCase().includes(g.vertical.toLowerCase()) ||
      g.vertical === "Music",
  );

  const toggle = (mid: string) => {
    update("goals", g.id, {
      milestones: g.milestones.map((m) =>
        m.id === mid ? { ...m, done: !m.done } : m,
      ),
    });
  };

  return (
    <div className="screen">
      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <div className="title" style={{ fontSize: 17 }}>
            {g.title}
          </div>
          <button className="pill" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
        <span className={`tag ${VERT_TAG[g.vertical] ?? "t-grey"}`}>
          {g.vertical}
        </span>
        <div style={{ marginTop: 12 }}>
          <Progress value={g.progress} />
          <div className="sub" style={{ marginTop: 6 }}>
            {g.progress}% complete · {g.timeframe}
          </div>
        </div>
        {g.target ? (
          <div className="note" style={{ marginTop: 12 }}>
            🎯 {g.target}
          </div>
        ) : null}
      </div>

      <div className="card">
        <h3>
          Milestones · {doneCount}/{g.milestones.length}
        </h3>
        {g.milestones.length === 0 ? (
          <div className="sub">No milestones yet.</div>
        ) : (
          g.milestones.map((m) => (
            <div
              className={`check ${m.done ? "on" : ""}`}
              key={m.id}
              onClick={() => toggle(m.id)}
            >
              <span className={`box ${m.done ? "on" : ""}`}>
                {m.done ? "✓" : ""}
              </span>
              <span className="ck-lbl">{m.label}</span>
            </div>
          ))
        )}
      </div>

      {g.vertical === "Music" || g.vertical === "K-pop" ? (
        <div className="card">
          <h3>Related grants</h3>
          {grants.length === 0 ? (
            <div className="sub">No related grants.</div>
          ) : (
            grants.map((gr) => (
              <div className="linkrow" key={gr.id} onClick={() => nav.go("grant", gr.id)}>
                <span>
                  {gr.flag} {gr.name} · {euro.format(gr.amount)}
                </span>
                <span className="chev">›</span>
              </div>
            ))
          )}
        </div>
      ) : null}

      {editing ? (
        <FormSheet
          title="Edit goal"
          fields={goalFields}
          initial={goalToValues(g)}
          onSubmit={(v) => {
            const rebuilt = buildGoal(v, g.id);
            update("goals", g.id, { ...rebuilt, milestones: g.milestones });
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
          onDelete={() => {
            remove("goals", g.id);
            setEditing(false);
            nav.back();
          }}
        />
      ) : null}
    </div>
  );
}
