interface ModulePlaceholderProps {
  module: string;
  phase: string;
  summary: string;
}

/**
 * Temporary scaffold for routes whose module is implemented in a later phase.
 * It states plainly what is missing instead of rendering controls that do
 * nothing.
 */
export function ModulePlaceholder({
  module,
  phase,
  summary,
}: ModulePlaceholderProps) {
  return (
    <section className="mt-6 rounded-card border border-dashed border-border bg-card p-6">
      <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        Not built yet
      </p>
      <h2 className="mt-2 text-base leading-6 font-semibold">{module}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-[1.4rem] text-muted-foreground">
        {summary}
      </p>
      <p className="mt-3 text-[0.8125rem] leading-5 text-muted-foreground">
        Scheduled for {phase} in the development roadmap.
      </p>
    </section>
  );
}
