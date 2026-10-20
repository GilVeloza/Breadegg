"use client";

import { useId, useState } from "react";
import BookingPicker from "./BookingPicker";
import ContactForm from "./ContactForm";

type Tab = "book" | "write";

/**
 * Booking a call first, writing second. Both panels stay mounted, so going
 * back and forth keeps whatever was already picked or typed.
 */
export default function ContactTabs({
  labels,
}: {
  labels: Record<Tab, string>;
}) {
  const [tab, setTab] = useState<Tab>("book");
  const id = useId();

  return (
    <div>
      <div
        role="tablist"
        className="mb-8 inline-flex rounded-xl border border-crust-lift p-1"
      >
        {(["book", "write"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`${id}-${key}-tab`}
            aria-selected={tab === key}
            aria-controls={`${id}-${key}`}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 t-body transition-colors duration-200 ${
              tab === key ? "bg-crust-lift text-crumb" : "text-ash hover:text-crumb"
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${id}-book`}
        aria-labelledby={`${id}-book-tab`}
        hidden={tab !== "book"}
      >
        <BookingPicker onWrite={() => setTab("write")} />
      </div>
      <div
        role="tabpanel"
        id={`${id}-write`}
        aria-labelledby={`${id}-write-tab`}
        hidden={tab !== "write"}
      >
        <ContactForm />
      </div>
    </div>
  );
}
