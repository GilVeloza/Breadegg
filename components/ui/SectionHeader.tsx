import Reveal from "./Reveal";

export default function SectionHeader({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  note?: string;
}) {
  return (
    <Reveal className="max-w-3xl">
      <p className="t-eyebrow text-yolk">{eyebrow}</p>
      <h2 className="t-h2 mt-4 text-crumb">{title}</h2>
      {note ? <p className="t-lead mt-5 text-ash">{note}</p> : null}
    </Reveal>
  );
}
