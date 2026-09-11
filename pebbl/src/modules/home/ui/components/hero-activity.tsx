import { Check, Code2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface StatusCardProps {
  icon: ReactNode;
  label: string;
  dotClassName: string;
  width: string;
}

const StatusCard = ({ icon, label, dotClassName, width }: StatusCardProps) => (
  <div
    className={`flex ${width} items-center gap-2.5 rounded-xl border border-violet-400/20 bg-background/60 p-3 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.55),0_0_28px_-14px_rgba(139,92,246,0.45)] backdrop-blur-md`}
  >
    {icon}
    <span className="truncate text-[11px] leading-tight text-muted-foreground">
      {label}
    </span>
    <span
      aria-hidden
      className={`${dotClassName} ml-auto size-1.5 shrink-0 rounded-full`}
    />
  </div>
);

export const HeroActivity = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden select-none xl:block"
    >
      <div className="absolute top-1/2 -left-44 -translate-y-1/2 -rotate-3 motion-safe:animate-drift">
        <StatusCard
          width="w-44"
          label="Generating UI…"
          icon={<Sparkles className="size-3.5 shrink-0 text-violet-400" />}
          dotClassName="bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)] motion-safe:animate-blink"
        />
      </div>
      <div className="absolute top-1/2 -right-44 -translate-y-1/2 rotate-2 motion-safe:animate-drift-slow">
        <StatusCard
          width="w-44"
          label="Writing components"
          icon={<Code2 className="size-3.5 shrink-0 text-indigo-400" />}
          dotClassName="bg-indigo-400/80 motion-safe:animate-blink"
        />
      </div>
      <div className="absolute -top-8 -right-40 -rotate-2 motion-safe:animate-drift">
        <StatusCard
          width="w-40"
          label="App ready to preview"
          icon={<Check className="size-3.5 shrink-0 text-emerald-400" />}
          dotClassName="bg-emerald-400 motion-safe:animate-blink"
        />
      </div>
    </div>
  );
};
