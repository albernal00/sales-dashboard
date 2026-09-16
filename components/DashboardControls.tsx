"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { formatTargetMonth } from "@/lib/formatters";
import { shiftMonth } from "@/lib/month";

type DashboardControlsProps = {
  pathname: string;
  targetMonth: string;
  monthOptions: string[];
  formattedUpdatedAt: string;
  monthLabel?: string;
  showMonthStepper?: boolean;
  currentMonth?: string;
  selectedStaffId?: string | null;
};

export default function DashboardControls({
  pathname,
  targetMonth,
  monthOptions,
  formattedUpdatedAt,
  monthLabel = "対象月",
  showMonthStepper = false,
  currentMonth,
  selectedStaffId,
}: DashboardControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMonthChange = (month: string) => {
    startTransition(() => {
      const params = new URLSearchParams({ month });
      if (selectedStaffId) params.set("staff", selectedStaffId);
      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    });
  };

  const previousMonth = shiftMonth(targetMonth, -1);
  const nextMonth = shiftMonth(targetMonth, 1);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      {showMonthStepper && currentMonth ? (
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm" aria-label={monthLabel}>
          <span className="hidden pl-2 text-[11px] font-medium text-slate-500 sm:inline">確認月</span>
          <button
            type="button"
            aria-label="前月へ"
            disabled={isPending || !monthOptions.includes(previousMonth)}
            onClick={() => handleMonthChange(previousMonth)}
            className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <label className="px-1">
            <span className="sr-only">{monthLabel}</span>
            <select
              value={targetMonth}
              disabled={isPending}
              onChange={(event) => handleMonthChange(event.target.value)}
              className="w-28 cursor-pointer bg-transparent text-center text-xs font-semibold text-slate-700 outline-none disabled:cursor-wait sm:text-sm"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>{formatTargetMonth(month)}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-label="翌月へ"
            disabled={isPending || !monthOptions.includes(nextMonth)}
            onClick={() => handleMonthChange(nextMonth)}
            className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={isPending || targetMonth === currentMonth}
            onClick={() => handleMonthChange(currentMonth)}
            className="rounded-lg px-2.5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            当月
          </button>
        </div>
      ) : <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100">
        <CalendarDays
          size={17}
          className="text-slate-400"
          aria-hidden="true"
        />

        <span className="sr-only">{monthLabel}</span>
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
      </label>}

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
