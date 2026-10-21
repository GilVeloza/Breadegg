"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { intlLocale } from "@/lib/intl";

export type BookingDay = { date: string; slots: string[] };

const chip =
  "rounded-xl border px-4 py-2.5 t-body transition-colors duration-200";
const chipIdle =
  "border-crust-lift text-ash hover:border-ash-dim hover:text-crumb";
const chipOn = "border-yolk/60 bg-crust-lift text-crumb";

/** Times in the visitor's own clock: the server's time zone is not theirs. */
export function useVisitorTime() {
  const locale = intlLocale(useLocale());
  const timeZone =
    typeof window === "undefined"
      ? "UTC"
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const format = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(
      new Date(iso),
    );
  const full = (iso: string) =>
    format(iso, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  return { timeZone, format, full };
}

/**
 * Pick a day, then a time on it. Used for booking and for moving a booking;
 * the days come from the API, which applies the rules in content/booking.
 */
export default function SlotPicker({
  days,
  slot,
  onSlot,
}: {
  days: BookingDay[];
  slot: string | null;
  onSlot: (slot: string | null) => void;
}) {
  const t = useTranslations("booking");
  const { timeZone, format } = useVisitorTime();
  const [day, setDay] = useState<string | null>(null);
  const localDate = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date(iso));
  const chosen = days.find((d) => d.date === day);

  return (
    <>
      <fieldset>
        <legend className="t-eyebrow text-ash-dim">{t("pickDay")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {days.map((d) => (
            <button
              key={d.date}
              type="button"
              aria-pressed={d.date === day}
              onClick={() => {
                setDay(d.date);
                onSlot(null);
              }}
              className={`${chip} ${d.date === day ? chipOn : chipIdle}`}
            >
              {format(d.slots[0], { weekday: "short", day: "numeric", month: "short" })}
            </button>
          ))}
        </div>
      </fieldset>

      {chosen ? (
        <fieldset>
          <legend className="t-eyebrow text-ash-dim">{t("pickTime")}</legend>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {chosen.slots.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={s === slot}
                onClick={() => onSlot(s)}
                className={`${chip} t-num ${s === slot ? chipOn : chipIdle}`}
              >
                {format(s, { hour: "2-digit", minute: "2-digit" })}
                {/* Far enough east, an afternoon in Madeira is tomorrow. */}
                {localDate(s) !== localDate(chosen.slots[0])
                  ? ` · ${format(s, { weekday: "short" })}`
                  : null}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
    </>
  );
}
