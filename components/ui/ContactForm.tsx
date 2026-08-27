"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type State = "idle" | "sending" | "sent" | "error";

const field =
  "w-full rounded-lg border border-crust-lift bg-crust-lift/30 px-4 py-3 t-body text-crumb placeholder:text-ash-dim transition-colors duration-200 focus:border-yolk/60 focus:outline-none";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, setState] = useState<State>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setState(res.ok ? "sent" : "error");
      if (res.ok) event.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="t-lead text-yolk">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Bots fill this; people never see it. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Fax
          <input name="fax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="t-eyebrow text-ash-dim">{t("name")}</span>
          <input
            name="name"
            required
            autoComplete="name"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="t-eyebrow text-ash-dim">{t("email")}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="t-eyebrow text-ash-dim">
          {t("company")} <span className="normal-case">({t("optional")})</span>
        </span>
        <input name="company" autoComplete="organization" className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="t-eyebrow text-ash-dim">{t("message")}</span>
        <textarea name="message" required rows={5} className={field} />
      </label>

      {state === "error" ? (
        <p role="alert" className="t-body text-yolk">
          {t("error")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-2 self-start rounded-full bg-crumb px-7 py-3.5 t-body font-semibold text-crust transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
      >
        {state === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
