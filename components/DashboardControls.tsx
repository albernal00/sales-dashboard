"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, RefreshCw } from "lucide-react";
import { formatTargetMonth } from "@/lib/formatters";

type DashboardControlsProps = {
  pathname: string;
  targetMonth: string;
  monthOptions: string[];
  formattedUpdatedAt: string;
};

export default function DashboardControls({
  pathname,
  targetMonth,
  monthOptions,
  formattedUpdatedAt,
}: DashboardControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMonthChange = (month: string) => {
    startTransition(() => {
      router.push(`${pathname}?month=${encodeURIComponent(month)}`, {
        scroll: false,
      });
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100">
        <CalendarDays
          size={17}
          className="text-slate-400"
          aria-hidden="true"
        />

        <span className="sr-only">対象月</span>
        <select
          value={targetMonth}
          disabled={isPending}
          onChange={(event) => handleMonthChange(event.target.value)}
          className="cursor-pointer appearance-none bg-transparent pr-4 text-xs font-semibold text-slate-700 outline-none disabled:cursor-wait sm:text-sm"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {formatTargetMonth(month)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        aria-label={isPending ? "実績データを更新中" : "実績データを更新"}
        aria-busy={isPending}
        disabled={isPending}
        onClick={handleRefresh}
        className="hidden items-center gap-2 rounded-xl px-3 py-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60 sm:flex"
      >
        <RefreshCw
          size={16}
          className={isPending ? "animate-spin" : undefined}
          aria-hidden="true"
        />

        <div className="text-left">
          <p className="text-[10px] text-slate-400">
            {isPending ? "更新中" : "最終更新"}
          </p>
          <p className="text-[11px] font-semibold text-slate-600">
            {formattedUpdatedAt}
          </p>
        </div>
      </button>
    </>
  );
}
