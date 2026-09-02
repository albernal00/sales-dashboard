"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import {
  formatCount,
  formatCurrency,
  formatPercent,
} from "@/lib/formatters";
import type { StaffListRow } from "@/types/dashboard";

type StaffTableProps = {
  staff: StaffListRow[];
};

type SortKey = "personal" | "reward" | "actual" | "progress" | "name";

export default function StaffTable({ staff }: StaffTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("personal");
  const storeOptions = useMemo(
    () =>
      Array.from(new Set(staff.flatMap((person) => person.storeNames))).sort(
        (a, b) => a.localeCompare(b, "ja")
      ),
    [staff]
  );
  const visibleStaff = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ja");
    const filtered = staff.filter(
      (person) =>
        (!normalizedQuery ||
          person.name.toLocaleLowerCase("ja").includes(normalizedQuery)) &&
        (storeFilter === "all" || person.storeNames.includes(storeFilter))
    );

    return filtered.toSorted((a, b) => {
      switch (sortKey) {
        case "reward":
          return b.expectedReward - a.expectedReward ||
            b.personalActual - a.personalActual;
        case "actual":
          return b.actual - a.actual || b.personalActual - a.personalActual;
        case "progress":
          return b.progress - a.progress || b.actual - a.actual;
        case "name":
          return a.name.localeCompare(b.name, "ja");
        default:
          return b.personalActual - a.personalActual ||
            b.expectedReward - a.expectedReward;
      }
    });
  }, [searchQuery, sortKey, staff, storeFilter]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">担当者一覧</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              担当店舗の進捗と個人実績を比較できます
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                担当者名検索
              </span>
              <span className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100">
                <Search size={16} className="text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="担当者名を入力"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                担当店舗
              </span>
              <select
                value={storeFilter}
                onChange={(event) => setStoreFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
              >
                <option value="all">すべての店舗</option>
                {storeOptions.map((storeName) => (
                  <option key={storeName} value={storeName}>
                    {storeName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                並べ替え
              </span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
              >
                <option value="personal">個人獲得件数が多い順</option>
                <option value="reward">個人報酬見込が多い順</option>
                <option value="actual">担当店舗実績が多い順</option>
                <option value="progress">担当店舗進捗率が高い順</option>
                <option value="name">担当者名順</option>
              </select>
            </label>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-500" aria-live="polite">
          {visibleStaff.length}名を表示
        </p>
      </div>

      {visibleStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Users size={22} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            条件に一致する担当者はいません
          </p>
          <p className="mt-1 text-xs text-slate-400">
            担当者名または店舗の条件を変更してください
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] text-sm">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold text-slate-500">
                <th scope="col" className="px-6 py-3.5">担当者名</th>
                <th scope="col" className="px-4 py-3.5 text-right">担当店舗数</th>
                <th scope="col" className="min-w-56 px-4 py-3.5">担当店舗名</th>
                <th scope="col" className="px-4 py-3.5 text-right">店舗目標</th>
                <th scope="col" className="px-4 py-3.5 text-right">店舗実績</th>
                <th scope="col" className="px-4 py-3.5 text-right">残数</th>
                <th scope="col" className="min-w-48 px-4 py-3.5">店舗進捗率</th>
                <th scope="col" className="px-4 py-3.5 text-right">個人獲得件数</th>
                <th scope="col" className="px-6 py-3.5 text-right">個人報酬見込</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStaff.map((person) => (
                <tr
                  key={person.key}
                  data-staff-key={person.key}
                  className="transition hover:bg-slate-50/70"
                >
                  <th scope="row" className="whitespace-nowrap px-6 py-4 text-left font-semibold text-slate-800">
                    {person.name}
                  </th>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-600">
                    {formatCount(person.storeCount)}
                  </td>
                  <td className="px-4 py-4">
                    {person.storeNames.length === 0 ? (
                      <span className="text-xs text-slate-400">担当店舗なし</span>
                    ) : (
                      <div className="flex max-w-xs flex-wrap gap-1.5">
                        {person.storeNames.map((storeName) => (
                          <span
                            key={storeName}
                            className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                          >
                            {storeName}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-500">
                    {person.targetRegistered ? (
                      formatCount(person.target)
                    ) : (
                      <span className="whitespace-nowrap text-xs font-semibold text-amber-700">
                        未登録
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-900">
                    {formatCount(person.actual)}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-600">
                    {person.targetRegistered ? formatCount(person.remaining) : "—"}
                  </td>
                  <td className="px-4 py-4">
                    {person.targetRegistered ? (
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            role="progressbar"
                            aria-label={`${person.name}の担当店舗進捗率`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(person.progress)}
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${person.progress}%` }}
                          />
                        </div>
                        <span className="w-11 text-right text-xs font-semibold tabular-nums text-slate-600">
                          {formatPercent(person.progress, 0)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-bold tabular-nums text-blue-700">
                    {formatCount(person.personalActual)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-slate-800">
                    {formatCurrency(person.expectedReward)}
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
