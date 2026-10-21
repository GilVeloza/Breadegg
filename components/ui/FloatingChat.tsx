"use client";

import { useEffect, useState } from "react";

/**
 * "Let's talk", always one tap away — the egg itself is the button. It keeps
 * out of the way on the hero, which has its own call to action, and while the
 * contact form is on screen, where it would only point at itself.
 */
export default function FloatingChat({ label }: { label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let pastHero = false;
    let atContact = false;
    const update = () => setShow(pastHero && !atContact);

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.6;
      update();
    };

    const contact = document.getElementById("contact");
    const watcher = contact
      ? new IntersectionObserver(
          ([entry]) => {
            atContact = entry.isIntersecting;
            update();
          },
          { threshold: 0.2 },
        )
      : null;
    if (contact && watcher) watcher.observe(contact);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      watcher?.disconnect();
    };
  }, []);

  return (
    <a
      href="#contact"
      inert={!show}
      className={`fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] z-40 inline-flex items-center gap-3 rounded-full border border-crust-lift bg-crust/80 py-2 pr-5 pl-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[opacity,transform] duration-500 ease-[var(--ease-egg)] ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span aria-hidden="true" className="egg-yolk block size-9 shadow-none" />
      <span className="text-[0.9375rem] font-medium text-crumb">{label}</span>
    </a>
  );
}
