"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { track } from "@/lib/analytics";
import { fieldClass } from "./ContactForm";
import SlotPicker, { useVisitorTime, type BookingDay as Day } from "./SlotPicker";

type Load =
  | { state: "loading" }
  | { state: "ready"; days: Day[] }
  | { state: "unavailable" };
type Send = "idle" | "sending" | "error" | "taken";

/**
 * Pick a day, then a time, then say who you are. The days come from the API,
 * which applies the rules in content/booking; times are shown in the
 * visitor's own time zone, so nobody has to convert from Madeira.
 */
export default function BookingPicker({ onWrite }: { onWrite: () => void }) {
  const t = useTranslations("booking");
  const f = useTranslations("contact.form");
  const siteLocale = useLocale();
  const { timeZone, full } = useVisitorTime();

  const [load, setLoad] = useState<Load>({ state: "loading" });
  // Bumped to start the picker afresh after a slot was taken under them.
  const [attempt, setAttempt] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [send, setSend] = useState<Send>("idle");
  const [booked, setBooked] = useState<{ when: string; email: string } | null>(
    null,
  );

  const refresh = useCallback(
    () =>
      fetch("/api/booking", { cache: "no-store" })
        .then((res) => res.json() as Promise<{ ready: boolean; days: Day[] }>)
        .then(
          (data): Load =>
            data.ready ? { state: "ready", days: data.days } : { state: "unavailable" },
        )
        .catch((): Load => ({ state: "unavailable" }))
        .then(setLoad),
    [],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slot) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setSend("sending");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, slot, timeZone, locale: siteLocale }),
      });
      if (res.ok) {
        setBooked({ when: full(slot), email: String(data.email) });
        track("generate_lead", { method: "booking" });
        return;
      }
      if (res.status === 409) {
        setSend("taken");
        setSlot(null);
        setAttempt((a) => a + 1);
        refresh();
        return;
      }
      setSend("error");
    } catch {
      setSend("error");
    }
  }

  if (booked) {
    return (
      <p role="status" className="t-lead text-yolk">
        {t("success", booked)}
      </p>
    );
  }

  if (load.state === "loading") {
    return <p className="t-body text-ash-dim">{t("loading")}</p>;
  }

  if (load.state === "unavailable" || load.days.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="t-body text-ash">
          {t(load.state === "unavailable" ? "unavailable" : "none")}
        </p>
        <button
          type="button"
          onClick={onWrite}
          className="t-body text-crumb underline decoration-crust-lift underline-offset-[5px] transition-colors hover:decoration-yolk"
        >
          {t("write")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="t-body text-ash">{t("intro")}</p>
        <p className="t-eyebrow mt-2 normal-case tracking-normal text-ash-dim">
          {t("timeZone", { timeZone })}
        </p>
      </div>

      {send === "taken" ? (
        <p role="alert" className="t-body text-yolk">
          {t("taken")}
        </p>
      ) : null}

      <SlotPicker
        key={attempt}
        days={load.days}
        slot={slot}
        onSlot={(next) => {
          setSlot(next);
          setSend("idle");
        }}
      />

      {slot ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <p className="t-lead text-crumb">
            {full(slot)}{" "}
            <button
              type="button"
              onClick={() => setSlot(null)}
              className="t-body text-ash underline decoration-crust-lift underline-offset-[5px] transition-colors hover:text-crumb"
            >
              {t("change")}
            </button>
          </p>

          {/* Bots fill this; people never see it. */}
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <label>
              Fax
              <input name="fax" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="t-eyebrow text-ash-dim">{f("name")}</span>
              <input name="name" required autoComplete="name" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="t-eyebrow text-ash-dim">{f("email")}</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className={fieldClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="t-eyebrow text-ash-dim">
              {f("company")} <span className="normal-case">({f("optional")})</span>
            </span>
            <input name="company" autoComplete="organization" className={fieldClass} />
          </label>

          <label className="flex flex-col gap-2">
            <span className="t-eyebrow text-ash-dim">{t("message")}</span>
            <textarea name="message" rows={3} className={fieldClass} />
          </label>

          {send === "error" ? (
            <p role="alert" className="t-body text-yolk">
              {t("error")}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={send === "sending"}
            className="mt-2 self-start rounded-full bg-crumb px-7 py-3.5 t-body font-semibold text-crust transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
          >
            {send === "sending" ? t("sending") : t("submit")}
          </button>
        </form>
      ) : null}
    </div>
  );
}
