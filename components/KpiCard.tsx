import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  tone: "blue" | "violet" | "amber" | "emerald";
};

const tones = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
};

export default function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  tone,
}: KpiCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className={`flex size-10 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}>
          <Icon size={19} strokeWidth={2} aria-hidden="true" />
        </div>
      </div>

      <p className="mt-3 text-[28px] font-bold tracking-tight text-slate-950">
        {value}
      </p>

      {subtext && (
        <p className="mt-1.5 text-xs font-medium text-slate-400">
          {subtext}
        </p>
      )}
    </article>
  );
}
