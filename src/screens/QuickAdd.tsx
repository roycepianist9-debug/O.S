import { useState } from "react";
import { useStore } from "../store";
import { Sheet, FormSheet, type FormValues } from "../ui";
import {
  arrangementFields,
  bookingFields,
  buildArrangement,
  buildBooking,
  buildContact,
  buildContent,
  buildContribution,
  buildCountry,
  buildGoal,
  buildGrant,
  buildIncome,
  contactFields,
  contentFields,
  contributionFields,
  countryFields,
  goalFields,
  grantFields,
  incomeFields,
} from "../forms";

type Kind =
  | "income"
  | "grant"
  | "contact"
  | "booking"
  | "content"
  | "goal"
  | "arrangement"
  | "contribution"
  | "country";

const CHOICES: { kind: Kind; label: string; emoji: string }[] = [
  { kind: "income", label: "Income", emoji: "＄" },
  { kind: "grant", label: "Grant", emoji: "◆" },
  { kind: "contact", label: "Contact", emoji: "◈" },
  { kind: "booking", label: "Booking", emoji: "♪" },
  { kind: "content", label: "Content", emoji: "▶" },
  { kind: "goal", label: "Goal", emoji: "◎" },
  { kind: "arrangement", label: "Arrangement", emoji: "♬" },
  { kind: "contribution", label: "Donation", emoji: "♥" },
  { kind: "country", label: "Country", emoji: "⌖" },
];

export default function QuickAdd({
  onClose,
  initialKind,
}: {
  onClose: () => void;
  initialKind?: Kind;
}) {
  const store = useStore();
  const [kind, setKind] = useState<Kind | null>(initialKind ?? null);

  if (!kind) {
    return (
      <Sheet title="Quick add" onClose={onClose}>
        <div className="chooser">
          {CHOICES.map((c) => (
            <button key={c.kind} onClick={() => setKind(c.kind)}>
              <span className="ce">{c.emoji}</span>
              <span className="ct">{c.label}</span>
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  const submit = (v: FormValues) => {
    switch (kind) {
      case "income":
        store.add("income", buildIncome(v));
        break;
      case "grant":
        store.add("grants", buildGrant(v));
        break;
      case "contact":
        store.add("contacts", buildContact(v));
        break;
      case "booking":
        store.add("bookings", buildBooking(v));
        break;
      case "content":
        store.add("content", buildContent(v));
        break;
      case "goal":
        store.add("goals", buildGoal(v));
        break;
      case "arrangement":
        store.add("arrangements", buildArrangement(v));
        break;
      case "contribution":
        store.add("contributions", buildContribution(v));
        break;
      case "country":
        store.add("countries", buildCountry(v));
        break;
    }
    onClose();
  };

  const fields = {
    income: incomeFields,
    grant: grantFields,
    contact: contactFields,
    booking: bookingFields,
    content: contentFields,
    goal: goalFields,
    arrangement: arrangementFields,
    contribution: contributionFields,
    country: countryFields,
  }[kind];

  const title = `New ${CHOICES.find((c) => c.kind === kind)?.label.toLowerCase()}`;

  return (
    <FormSheet
      title={title}
      fields={fields}
      submitLabel="Add"
      onSubmit={submit}
      onClose={onClose}
    />
  );
}
