"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SlotPicker, { useVisitorTime, type BookingDay } from "./SlotPicker";

type Load =
  | { state: "loading" }
  | { state: "missing" }
  | {
      state: "ready";
      booking: { slot: string; name: string; past: boolean };
      days: BookingDay[];
    };
type Step = "view" | "move" | "cancel";
type Done = { kind: "moved"; when: string } | { kind: "cancelled" } | null;

const primary =
  "inline-flex w-fit items-center gap-3 rounded-xl border border-yolk/35 bg-crust-lift px-5 py-3 text-[0.9375rem] font-medium text-crumb transition-colors duration-300 hover:border-yolk/70 disabled:opacity-50";
const ghost =
  "inline-flex w-fit items-center rounded-xl border border-crust-lift px-5 py-3 text-[0.9375rem] font-medium text-ash transition-colors duration-300 hover:border-ash-dim hover:text-crumb disabled:opacity-50";
const yolk = (
  <span aria-hidden="true" className="egg-yolk cta-yolk block size-2.5 shrink-0" />
);

/**
 * The page behind the links in a booking's emails. The token is the booking:
 * whoever has the link can move the call to another free slot or cancel it.
 * Moving issues a new link (and a new email); the old one stops working.
 */
export default function ManageBooking({
  token: firstToken,
  startWith = "view",
}: {
  token: string;
  startWith?: Step;
}) {
  const t = useTranslations("manage");
  const { timeZone, full } = useVisitorTime();

  const [token, setToken] = useState(firstToken);
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [step, setStep] = useState<Step>(startWith);
  const [slot, setSlot] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<"taken" | "error" | null>(null);
  const [done, setDone] = useState<Done>(null);

  const refresh = useCallback(
    (link: string) =>
      fetch(`/api/booking/${link}`, { cache: "no-store" })
        .then(async (res): Promise<Load> =>
          res.ok ? { state: "ready", ...(await res.json()) } : { state: "missing" },
        )
        .catch((): Load => ({ state: "missing" }))
        .then(setLoad),
    [],
  );

  useEffect(() => {
    refresh(token);
  }, [refresh, token]);

  async function act(body: Record<string, string>) {
    setBusy(true);
    setProblem(null);
    try {
      const res = await fetch(`/api/booking/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };
      if (res.ok && body.action === "cancel") {
        setDone({ kind: "cancelled" });
      } else if (res.ok && data.token && body.slot) {
        setDone({ kind: "moved", when: full(body.slot) });
        setStep("view");
        setSlot(null);
        // The old link is dead now: keep the address bar on the new one.
        window.history.replaceState(
          null,
          "",
          window.location.pathname.replace(token, data.token),
        );
        setToken(data.token);
      } else if (res.status === 409 && data.error === "taken") {
        setProblem("taken");
        setSlot(null);
        setAttempt((a) => a + 1);
        refresh(token);
      } else if (res.status === 409 || res.status === 404) {
        refresh(token);
      } else {
        setProblem("error");
      }
    } catch {
      setProblem("error");
    } finally {
      setBusy(false);
    }
  }

  const bookAgain = (
    <Link
      href="/#contact"
      className="t-body text-crumb underline decoration-crust-lift underline-offset-[5px] transition-colors hover:decoration-yolk"
    >
      {t("bookAgain")}
    </Link>
  );

  if (done?.kind === "cancelled") {
    return (
      <div className="flex flex-col items-start gap-6">
        <p className="t-eyebrow text-yolk">{t("eyebrow")}</p>
        <p role="status" className="t-lead text-crumb">
          {t("cancelled")}
        </p>
        {bookAgain}
      </div>
    );
  }

  if (load.state === "loading") {
    return <p className="t-body text-ash-dim">{t("loading")}</p>;
  }

  if (load.state === "missing") {
    return (
      <div className="flex flex-col items-start gap-6">
        <p className="t-eyebrow text-yolk">{t("eyebrow")}</p>
        <p className="t-lead text-ash">{t("notFound")}</p>
        {bookAgain}
      </div>
    );
  }

  const { booking, days } = load;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="t-eyebrow text-yolk">{t("eyebrow")}</p>
        <h1 className="t-h1 mt-4 text-crumb">{full(booking.slot)}</h1>
        <p className="t-eyebrow mt-4 normal-case tracking-normal text-ash-dim">
          {t("timeZone", { timeZone })}
        </p>
      </div>

      {done?.kind === "moved" ? (
        <p role="status" className="t-lead text-yolk">
          {t("moved", { when: done.when })}
        </p>
      ) : null}

      {booking.past ? (
        <p className="t-lead text-ash">{t("past")}</p>
      ) : step === "view" ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" className={primary} onClick={() => setStep("move")}>
            {yolk}
            {t("change")}
          </button>
          <button type="button" className={ghost} onClick={() => setStep("cancel")}>
            {t("cancel")}
          </button>
        </div>
      ) : step === "move" ? (
        <div className="flex flex-col gap-8">
          {problem === "taken" ? (
            <p role="alert" className="t-body text-yolk">
              {t("taken")}
            </p>
          ) : null}
          {days.length === 0 ? (
            <p className="t-body text-ash">{t("none")}</p>
          ) : (
            <SlotPicker key={attempt} days={days} slot={slot} onSlot={setSlot} />
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={primary}
              disabled={!slot || busy}
              onClick={() => slot && act({ action: "move", slot })}
            >
              {yolk}
              {busy ? t("moving") : t("confirmMove")}
            </button>
            <button type="button" className={ghost} onClick={() => setStep("view")}>
              {t("back")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="t-lead text-crumb">{t("confirmCancel")}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={primary}
              disabled={busy}
              onClick={() => act({ action: "cancel" })}
            >
              {yolk}
              {busy ? t("cancelling") : t("yesCancel")}
            </button>
            <button type="button" className={ghost} onClick={() => setStep("view")}>
              {t("keep")}
            </button>
          </div>
        </div>
      )}

      {problem === "error" ? (
        <p role="alert" className="t-body text-yolk">
          {t("error")}
        </p>
      ) : null}
    </div>
  );
}
