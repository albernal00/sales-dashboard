"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarX, Search } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import type { AppointmentRow } from "@/types/dashboard";

type AppointmentsTableProps = {
  appointments: AppointmentRow[];
  today: string;
  mode?: "all" | "store" | "staff";
};

type SortKey = "dateAsc" | "dateDesc";

export default function AppointmentsTable({
  appointments,
  today,
  mode = "all",
}: AppointmentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("dateAsc");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const showControls = mode === "all";
  const staffOptions = useMemo(
    () => Array.from(new Set(appointments.map((item) => item.staffName))).sort(
      (a, b) => a.localeCompare(b, "ja")
    ),
    [appointments]
  );
  const storeOptions = useMemo(
    () => Array.from(new Set(appointments.map((item) => item.storeName))).sort(
      (a, b) => a.localeCompare(b, "ja")
    ),
    [appointments]
  );
  const visibleAppointments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ja");
    return appointments
      .filter((item) =>
        (!normalizedQuery ||
          item.staffName.toLocaleLowerCase("ja").includes(normalizedQuery) ||
          item.storeName.toLocaleLowerCase("ja").includes(normalizedQuery)) &&
        (staffFilter === "all" || item.staffName === staffFilter) &&
        (storeFilter === "all" || item.storeName === storeFilter) &&
        (!upcomingOnly || Boolean(item.scheduledDate && item.scheduledDate >= today))
      )
      .toSorted((a, b) => {
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return sortKey === "dateAsc"
          ? a.scheduledDate.localeCompare(b.scheduledDate)
          : b.scheduledDate.localeCompare(a.scheduledDate);
      });
  }, [appointments, searchQuery, sortKey, staffFilter, storeFilter, today, upcomingOnly]);

  const counterpartLabel = mode === "store" ? "受付担当者" : "紹介店舗";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">アポイント予定</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              実績には含まれない商談予定を表示しています
            </p>
          </div>

          {showControls && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">担当者名・店舗名検索</span>
                <span className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100">
                  <Search size={16} className="text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="担当者名または店舗名"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>

              <FilterSelect label="担当者" value={staffFilter} onChange={setStaffFilter}>
                <option value="all">すべての担当者</option>
                {staffOptions.map((name) => <option key={name} value={name}>{name}</option>)}
              </FilterSelect>
              <FilterSelect label="店舗" value={storeFilter} onChange={setStoreFilter}>
                <option value="all">すべての店舗</option>
                {storeOptions.map((name) => <option key={name} value={name}>{name}</option>)}
              </FilterSelect>
              <FilterSelect label="並べ替え" value={sortKey} onChange={(value) => setSortKey(value as SortKey)}>
                <option value="dateAsc">予定日が古い順</option>
                <option value="dateDesc">予定日が新しい順</option>
              </FilterSelect>
              <label className="flex h-10 items-center gap-2 self-end rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={upcomingOnly}
                  onChange={(event) => setUpcomingOnly(event.target.checked)}
                  className="size-4 rounded border-slate-300 accent-blue-600"
                />
                本日以降のみ
              </label>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs font-medium text-slate-500" aria-live="polite">
          {visibleAppointments.length}件を表示
        </p>
      </div>

      {visibleAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <CalendarX size={22} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            対象月のアポイント予定はありません
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold text-slate-500">
                <th scope="col" className="px-6 py-3.5">商談予定日</th>
                {mode === "all" && <th scope="col" className="px-4 py-3.5">受付担当者</th>}
                <th scope="col" className="px-4 py-3.5">{counterpartLabel}</th>
                <th scope="col" className="px-4 py-3.5">商談場所</th>
                <th scope="col" className="px-6 py-3.5">状況</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleAppointments.map((item) => (
                <tr key={item.key} className="transition hover:bg-slate-50/70">
                  <th scope="row" className="whitespace-nowrap px-6 py-4 text-left font-semibold text-slate-800">
                    {item.scheduledDate ? formatDate(item.scheduledDate) : "日付不明"}
                  </th>
                  {mode === "all" && <td className="px-4 py-4 text-slate-700">{item.staffName}</td>}
                  <td className="px-4 py-4 text-slate-700">
                    {mode === "store" ? item.staffName : item.storeName}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{item.locationType}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${item.isProspect ? "bg-violet-50 text-violet-700 ring-violet-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}
