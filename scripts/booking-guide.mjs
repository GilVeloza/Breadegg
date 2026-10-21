// The guide attached to every booking confirmation: what the 15-minute call
// is for, how it goes and how to come prepared. One landscape PDF per locale,
// in the site's look, printed by headless Chrome from the HTML below.
//
//   node scripts/booking-guide.mjs
//
// Writes public/pdf/breadegg-call-<locale>.pdf. Needs Google Chrome; set
// CHROME to its binary if it isn't in the usual place on macOS.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const CHROME =
  process.env.CHROME ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PHOTO = `file://${join(root, "public/founder/gil-veloza.jpg")}`;
const WORK = "Rackers · Política+ · The Silicon Guys · Travel Now Madeira";

const COPY = {
  en: {
    title: "Your call with Breadegg",
    cover: {
      eyebrow: "Your 15-minute call",
      title: "Fifteen minutes to see if we can build it together.",
      lead: "What the call is for, how it goes, and how to make the most of it.",
      note: "The Google Meet link arrives by email before the call.",
    },
    flow: {
      eyebrow: "How it goes",
      title: "Three parts, five minutes each.",
      steps: [
        { time: "0–5 min", who: "You", body: "Tell us about your company and what you want: the problem, the goal and any deadline. In your own words, not a spec." },
        { time: "5–10 min", who: "Gil", body: "Gil introduces himself and Breadegg, and sketches a first idea of how we would do it." },
        { time: "10–15 min", who: "Together", body: "We agree on the next step: the subscription, a fixed-price proposal, or an honest no if we're not the right fit." },
      ],
    },
    prep: {
      eyebrow: "Before the call",
      title: "Come with these, and fifteen minutes go a long way.",
      items: [
        "What your company does, in one sentence.",
        "The problem to solve or the goal to reach.",
        "Links: your website, your app, or examples you like.",
        "A deadline, if there is one.",
        "Who else has a say in the decision.",
      ],
      leaveTitle: "You leave with",
      leave: [
        "A clear next step, agreed before we hang up.",
        "If we're not the right people for it, we'll say so and point you somewhere better.",
      ],
    },
    who: {
      eyebrow: "Who you'll talk to",
      body: "Breadegg is run by Gil. Every request is designed and built by the same person you talk to: no account managers, no handoffs.",
      waysTitle: "Two ways to work together",
      ways: [
        { name: "Monthly subscription", body: "Design, web, apps and AI, one request at a time. Pause or cancel anytime." },
        { name: "Fixed-price project", body: "Native apps and custom AI, with the scope and the dates in writing." },
      ],
      work: "Recent work",
    },
  },
  es: {
    title: "Tu llamada con Breadegg",
    cover: {
      eyebrow: "Tu llamada de 15 minutos",
      title: "Quince minutos para ver si lo construimos juntos.",
      lead: "Para qué es la llamada, cómo va y cómo sacarle el máximo partido.",
      note: "El enlace de Google Meet te llega por email antes de la llamada.",
    },
    flow: {
      eyebrow: "Cómo va",
      title: "Tres partes, cinco minutos cada una.",
      steps: [
        { time: "0–5 min", who: "Tú", body: "Cuéntanos tu empresa y lo que quieres: el problema, el objetivo y si hay fecha límite. Con tus palabras, sin especificaciones." },
        { time: "5–10 min", who: "Gil", body: "Gil se presenta, te cuenta qué es Breadegg y te da una primera idea de cómo lo haríamos." },
        { time: "10–15 min", who: "Juntos", body: "Acordamos el siguiente paso: la suscripción, una propuesta a precio cerrado o un no sincero si no somos los adecuados." },
      ],
    },
    prep: {
      eyebrow: "Antes de la llamada",
      title: "Ven con esto y los quince minutos dan para mucho.",
      items: [
        "Qué hace tu empresa, en una frase.",
        "El problema que quieres resolver o el objetivo que quieres alcanzar.",
        "Enlaces: tu web, tu app o ejemplos que te gusten.",
        "La fecha límite, si la hay.",
        "Quién más participa en la decisión.",
      ],
      leaveTitle: "Te llevas",
      leave: [
        "Un siguiente paso claro, acordado antes de colgar.",
        "Si no somos los adecuados, te lo decimos y te señalamos un sitio mejor.",
      ],
    },
    who: {
      eyebrow: "Con quién hablas",
      body: "Breadegg lo lleva Gil. Cada encargo lo diseña y lo construye la misma persona con la que hablas: sin gestores de cuenta ni intermediarios.",
      waysTitle: "Dos formas de trabajar juntos",
      ways: [
        { name: "Suscripción mensual", body: "Diseño, web, apps e IA, un encargo a la vez. Pausa o cancela cuando quieras." },
        { name: "Proyecto a precio cerrado", body: "Apps nativas e IA a medida, con el alcance y las fechas por escrito." },
      ],
      work: "Trabajos recientes",
    },
  },
  pt: {
    title: "A sua chamada com a Breadegg",
    cover: {
      eyebrow: "A sua chamada de 15 minutos",
      title: "Quinze minutos para ver se o construímos juntos.",
      lead: "Para que serve a chamada, como decorre e como tirar o máximo partido dela.",
      note: "O link do Google Meet chega por email antes da chamada.",
    },
    flow: {
      eyebrow: "Como decorre",
      title: "Três partes, cinco minutos cada.",
      steps: [
        { time: "0–5 min", who: "A sua parte", body: "Fale-nos da sua empresa e do que procura: o problema, o objetivo e se há prazo. Por palavras suas, sem especificações." },
        { time: "5–10 min", who: "Gil", body: "O Gil apresenta-se, apresenta a Breadegg e dá-lhe uma primeira ideia de como o faríamos." },
        { time: "10–15 min", who: "Juntos", body: "Combinamos o próximo passo: a subscrição, uma proposta de preço fechado ou um não sincero, se não formos as pessoas certas." },
      ],
    },
    prep: {
      eyebrow: "Antes da chamada",
      title: "Traga isto e os quinze minutos rendem muito.",
      items: [
        "O que faz a sua empresa, numa frase.",
        "O problema que quer resolver ou o objetivo que quer atingir.",
        "Links: o seu website, a sua app ou exemplos de que goste.",
        "O prazo, se existir.",
        "Quem mais participa na decisão.",
      ],
      leaveTitle: "Sai com",
      leave: [
        "Um próximo passo claro, combinado antes de desligarmos.",
        "Se não formos as pessoas certas, dizemos e apontamos-lhe um sítio melhor.",
      ],
    },
    who: {
      eyebrow: "Com quem vai falar",
      body: "A Breadegg é gerida pelo Gil. Cada pedido é desenhado e construído pela mesma pessoa com quem fala: sem gestores de conta nem intermediários.",
      waysTitle: "Duas formas de trabalhar connosco",
      ways: [
        { name: "Subscrição mensal", body: "Design, web, apps e IA, um pedido de cada vez. Pause ou cancele quando quiser." },
        { name: "Projeto de preço fechado", body: "Apps nativas e IA à medida, com o âmbito e as datas por escrito." },
      ],
      work: "Trabalhos recentes",
    },
  },
  de: {
    title: "Ihr Gespräch mit Breadegg",
    cover: {
      eyebrow: "Ihr 15-Minuten-Gespräch",
      title: "Fünfzehn Minuten, um zu sehen, ob wir es zusammen bauen.",
      lead: "Wofür das Gespräch ist, wie es abläuft und wie Sie das Beste daraus machen.",
      note: "Den Google-Meet-Link bekommen Sie vor dem Gespräch per E-Mail.",
    },
    flow: {
      eyebrow: "Ablauf",
      title: "Drei Teile, je fünf Minuten.",
      steps: [
        { time: "0–5 Min.", who: "Sie", body: "Erzählen Sie uns von Ihrem Unternehmen und was Sie vorhaben: das Problem, das Ziel und eine mögliche Frist. In Ihren Worten, ohne Spezifikation." },
        { time: "5–10 Min.", who: "Gil", body: "Gil stellt sich und Breadegg vor und skizziert eine erste Idee, wie wir es umsetzen würden." },
        { time: "10–15 Min.", who: "Gemeinsam", body: "Wir vereinbaren den nächsten Schritt: das Abo, ein Festpreisangebot oder ein ehrliches Nein, wenn wir nicht die Richtigen sind." },
      ],
    },
    prep: {
      eyebrow: "Vor dem Gespräch",
      title: "Bringen Sie das mit, und fünfzehn Minuten reichen weit.",
      items: [
        "Was Ihr Unternehmen macht, in einem Satz.",
        "Das Problem, das Sie lösen, oder das Ziel, das Sie erreichen wollen.",
        "Links: Ihre Website, Ihre App oder Beispiele, die Ihnen gefallen.",
        "Eine Frist, falls es eine gibt.",
        "Wer sonst noch mitentscheidet.",
      ],
      leaveTitle: "Sie gehen mit",
      leave: [
        "einem klaren nächsten Schritt, vereinbart, bevor wir auflegen.",
        "Wenn wir nicht die Richtigen sind, sagen wir es und verweisen Sie weiter.",
      ],
    },
    who: {
      eyebrow: "Mit wem Sie sprechen",
      body: "Breadegg wird von Gil geführt. Jeder Auftrag wird von derselben Person gestaltet und gebaut, mit der Sie sprechen: keine Account-Manager, keine Übergaben.",
      waysTitle: "Zwei Wege der Zusammenarbeit",
      ways: [
        { name: "Monatsabo", body: "Design, Web, Apps und KI, ein Auftrag nach dem anderen. Jederzeit pausieren oder kündigen." },
        { name: "Festpreisprojekt", body: "Native Apps und KI nach Maß, mit Umfang und Terminen schriftlich." },
      ],
      work: "Aktuelle Arbeiten",
    },
  },
};

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const YOLK =
  "radial-gradient(circle at 35% 32%, #fff7d4 0%, #ffeaa4 10%, #fcd063 26%, #f8ab2a 48%, #f4901c 66%, #ea7a12 84%, #dd660a 100%)";

const CSS = `
@page { size: 1280px 720px; margin: 0; }
* { box-sizing: border-box; }
html, body {
  margin: 0; background: #2a1a0f; color: #f7f1e8;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  -webkit-font-smoothing: antialiased;
}
.page {
  position: relative; width: 1280px; height: 720px; overflow: hidden;
  padding: 56px 72px; display: flex; flex-direction: column;
  break-after: page;
}
.page:last-child { break-after: auto; }
.top { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 2; }
.wordmark { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
.dot { width: 12px; height: 12px; border-radius: 50%; background: ${YOLK}; }
.count, .foot, .eyebrow-dim { font-size: 12px; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: #6f6154; }
.eyebrow { font-size: 13px; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: #f4901c; }
h1 { margin: 18px 0 0; font-size: 60px; line-height: 1.02; font-weight: 600; letter-spacing: -0.045em; max-width: 660px; text-wrap: balance; }
h2 { margin: 14px 0 0; font-size: 42px; line-height: 1.08; font-weight: 600; letter-spacing: -0.035em; max-width: 820px; text-wrap: balance; }
.lead { margin: 24px 0 0; font-size: 21px; line-height: 1.5; color: #a89685; max-width: 560px; }
.note { margin: 28px 0 0; display: flex; align-items: center; gap: 10px; font-size: 15px; color: #a89685; }
.foot { margin-top: auto; display: flex; justify-content: space-between; position: relative; z-index: 2; }
.body { position: relative; z-index: 2; }

/* The mark, as on the site: a glowing yolk with a soft wet highlight. */
.glow { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(244,144,28,0.30) 0%, rgba(244,144,28,0.10) 42%, rgba(244,144,28,0) 70%); }
.yolk { position: absolute; border-radius: 50%; background: ${YOLK}; box-shadow: inset -36px -46px 120px rgba(120,48,0,0.26); overflow: hidden; }
.gloss { position: absolute; left: 14%; top: 9%; width: 36%; height: 20%; border-radius: 50%; transform: rotate(-36deg);
  background: radial-gradient(closest-side, rgba(255,255,255,0.42), rgba(255,251,236,0.14) 55%, rgba(255,251,236,0)); }

.cover .body { margin-top: 92px; }
.cards { margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.card { border: 1px solid #34210f; border-radius: 20px; background: #1c1109; padding: 28px; display: flex; flex-direction: column; min-height: 300px; }
.card .n { font-size: 13px; font-weight: 500; letter-spacing: 0.09em; color: #6f6154; font-variant-numeric: tabular-nums; }
.card .time { margin-top: 18px; font-size: 13px; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: #f4901c; }
.card .speaker { margin-top: 10px; font-size: 30px; font-weight: 600; letter-spacing: -0.03em; }
.card p { margin: 14px 0 0; font-size: 17px; line-height: 1.6; color: #a89685; }

.split { margin-top: 36px; display: grid; grid-template-columns: 1.35fr 1fr; gap: 40px; align-items: start; }
ul { list-style: none; margin: 0; padding: 0; }
.check li { display: flex; gap: 14px; padding: 13px 0; border-top: 1px solid #34210f; font-size: 19px; line-height: 1.45; }
.check li:last-child { border-bottom: 1px solid #34210f; }
.bullet { margin-top: 0.55em; width: 7px; height: 7px; flex-shrink: 0; border-radius: 50%; background: #f4901c; }
.panel { border: 1px solid #34210f; border-radius: 20px; background: #1c1109; padding: 30px; }
.panel li { display: flex; gap: 14px; margin-top: 16px; font-size: 18px; line-height: 1.5; color: #f7f1e8; }

.person { display: grid; grid-template-columns: 300px 1fr; gap: 48px; margin-top: 28px; align-items: start; }
.photo { width: 300px; height: 440px; border-radius: 20px; object-fit: cover; object-position: 50% 28%; display: block; }
.name { margin: 12px 0 0; font-size: 50px; line-height: 1; font-weight: 600; letter-spacing: -0.04em; }
.role { margin-top: 12px; }
.bio { margin: 20px 0 0; font-size: 18px; line-height: 1.6; color: #a89685; max-width: 640px; }
.ways { margin-top: 26px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.way { border: 1px solid #34210f; border-radius: 16px; padding: 18px 20px; }
.way b { display: block; font-size: 17px; font-weight: 600; letter-spacing: -0.01em; }
.way span { display: block; margin-top: 6px; font-size: 15px; line-height: 1.5; color: #a89685; }
.work { margin-top: 22px; font-size: 15px; color: #a89685; }
.work .eyebrow-dim { margin-right: 10px; }
`;

function page(locale, c) {
  const top = (n) => `<div class="top">
    <div class="wordmark"><span class="dot"></span>Breadegg</div>
    <div class="count">${n} / 4</div>
  </div>`;
  const foot = `<div class="foot"><span>breadegg.com · hello@breadegg.com</span><span>Madeira, Portugal</span></div>`;
  const role = JSON.parse(readFileSync(join(root, `messages/${locale}.json`), "utf8")).founder.role;

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<title>${esc(c.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=block" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>

<section class="page cover">
  <div class="glow" style="width:1100px;height:1100px;right:-430px;top:-190px;"></div>
  <div class="yolk" style="width:560px;height:560px;right:-90px;top:80px;"><div class="gloss"></div></div>
  <div class="top"><div class="wordmark"><span class="dot"></span>Breadegg</div></div>
  <div class="body">
    <div class="eyebrow">${esc(c.cover.eyebrow)}</div>
    <h1>${esc(c.cover.title)}</h1>
    <p class="lead">${esc(c.cover.lead)}</p>
    <p class="note"><span class="dot"></span>${esc(c.cover.note)}</p>
  </div>
  ${foot}
</section>

<section class="page">
  ${top(2)}
  <div class="body" style="margin-top:44px;">
    <div class="eyebrow">${esc(c.flow.eyebrow)}</div>
    <h2>${esc(c.flow.title)}</h2>
    <div class="cards">
      ${c.flow.steps
        .map(
          (s, i) => `<div class="card">
        <div class="n">0${i + 1}</div>
        <div class="time">${esc(s.time)}</div>
        <div class="speaker">${esc(s.who)}</div>
        <p>${esc(s.body)}</p>
      </div>`,
        )
        .join("")}
    </div>
  </div>
  ${foot}
</section>

<section class="page">
  ${top(3)}
  <div class="body" style="margin-top:44px;">
    <div class="eyebrow">${esc(c.prep.eyebrow)}</div>
    <h2>${esc(c.prep.title)}</h2>
    <div class="split">
      <ul class="check">
        ${c.prep.items.map((item) => `<li><span class="bullet"></span>${esc(item)}</li>`).join("")}
      </ul>
      <div class="panel">
        <div class="eyebrow">${esc(c.prep.leaveTitle)}</div>
        <ul>
          ${c.prep.leave.map((item) => `<li><span class="bullet"></span>${esc(item)}</li>`).join("")}
        </ul>
      </div>
    </div>
  </div>
  ${foot}
</section>

<section class="page">
  ${top(4)}
  <div class="person body">
    <img class="photo" src="${PHOTO}" alt="Gil Veloza">
    <div>
      <div class="eyebrow">${esc(c.who.eyebrow)}</div>
      <div class="name">Gil Veloza</div>
      <div class="role eyebrow-dim">${esc(role)}</div>
      <p class="bio">${esc(c.who.body)}</p>
      <div class="eyebrow-dim" style="margin-top:26px;">${esc(c.who.waysTitle)}</div>
      <div class="ways" style="margin-top:12px;">
        ${c.who.ways.map((w) => `<div class="way"><b>${esc(w.name)}</b><span>${esc(w.body)}</span></div>`).join("")}
      </div>
      <p class="work"><span class="eyebrow-dim">${esc(c.who.work)}</span>${esc(WORK)}</p>
    </div>
  </div>
  ${foot}
</section>

</body>
</html>`;
}

const out = join(root, "public/pdf");
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "breadegg-guide-"));

for (const [locale, copy] of Object.entries(COPY)) {
  const htmlFile = join(work, `guide-${locale}.html`);
  writeFileSync(htmlFile, page(locale, copy));
  const pdf = join(out, `breadegg-call-${locale}.pdf`);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      `--user-data-dir=${join(work, "chrome")}`,
      "--no-pdf-header-footer",
      "--virtual-time-budget=15000",
      `--print-to-pdf=${pdf}`,
      `file://${htmlFile}`,
    ],
    { stdio: "ignore" },
  );
  console.log(`public/pdf/breadegg-call-${locale}.pdf`);
}
