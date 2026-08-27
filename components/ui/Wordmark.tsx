/** The mark at text scale: a small yolk, then the name. */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="egg-yolk block size-[0.7em] shadow-none" />
      <span className="font-semibold tracking-[-0.035em]">Breadegg®</span>
    </span>
  );
}
