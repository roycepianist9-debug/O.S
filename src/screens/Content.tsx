import { useState } from "react";
import { useStore } from "../store";
import { Empty, FormSheet } from "../ui";
import { shortDate } from "../util";
import {
  buildContent,
  CONTENT_CHANNELS,
  contentFields,
  contentToValues,
} from "../forms";
import type { Content as ContentT, ContentStatus } from "../types";

const STATUS_TAG: Record<ContentStatus, string> = {
  Idea: "t-grey",
  Scripted: "t-blue",
  Filming: "t-gold",
  Editing: "t-purple",
  Published: "t-green",
};

export function Content() {
  const { db, update, remove } = useStore();
  const [filter, setFilter] = useState<string>("All");
  const [edit, setEdit] = useState<ContentT | null>(null);

  const list = db.content
    .filter((c) => filter === "All" || c.channel === filter)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  const published = db.content.filter((c) => c.status === "Published").length;
  const inProgress = db.content.filter(
    (c) => c.status !== "Published" && c.status !== "Idea",
  ).length;

  return (
    <div className="screen">
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="card">
          <h3>In progress</h3>
          <div className="kpi">{inProgress}</div>
        </div>
        <div className="card">
          <h3>Published</h3>
          <div className="kpi">{published}</div>
        </div>
      </div>

      <div className="seg">
        {(["All", ...CONTENT_CHANNELS] as const).map((s) => (
          <button
            key={s}
            className={filter === s ? "on" : ""}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {list.length === 0 ? <Empty text="No content here yet." /> : null}
      {list.map((c) => (
        <div className="card tap" key={c.id} onClick={() => setEdit(c)}>
          <div className="row" style={{ marginBottom: 6 }}>
            <div className="title">{c.title}</div>
            <span className={`tag ${STATUS_TAG[c.status]}`}>{c.status}</span>
          </div>
          <div className="row">
            <span className="sub">{c.channel}</span>
            <span className="sub">{shortDate(c.date)}</span>
          </div>
        </div>
      ))}

      {edit ? (
        <FormSheet
          title="Edit content"
          fields={contentFields}
          initial={contentToValues(edit)}
          onSubmit={(v) => {
            update("content", edit.id, buildContent(v, edit.id));
            setEdit(null);
          }}
          onClose={() => setEdit(null)}
          onDelete={() => {
            remove("content", edit.id);
            setEdit(null);
          }}
        />
      ) : null}
    </div>
  );
}
