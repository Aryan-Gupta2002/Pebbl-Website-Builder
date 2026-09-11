import { Fragment } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { icon: "⚡", label: "Full-stack apps", mono: false },
  { icon: "◇", label: "Responsive UI", mono: false },
  { icon: "</>", label: "React & Next.js", mono: true },
  { icon: "✦", label: "AI generated", mono: false },
] as const;

export const CapabilityStrip = () => {
  return (
    <section className="mx-auto mt-14 w-full max-w-5xl sm:mt-16">
      <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-full border border-violet-400/15 bg-background/50 px-5 py-2 text-xs text-muted-foreground shadow-[0_0_28px_-12px_rgba(139,92,246,0.4)] backdrop-blur-sm">
        {ITEMS.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (
              <span
                aria-hidden
                className="hidden size-1 shrink-0 rounded-full bg-foreground/15 sm:block"
              />
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap",
                item.mono && "font-mono text-[11px]",
              )}
            >
              <span aria-hidden className="text-violet-400/90">
                {item.icon}
              </span>
              {item.label}
            </span>
          </Fragment>
        ))}
      </div>
    </section>
  );
};
