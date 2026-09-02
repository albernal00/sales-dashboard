"use client";

import { useMemo, useState } from "react";
import { Search, Store } from "lucide-react";
import {
  formatCount,
  formatCurrency,
  formatPercent,
} from "@/lib/formatters";
import type { StoreGoalStatus, StoreListRow } from "@/types/dashboard";

type StoresTableProps = {
  stores: StoreListRow[];
};

type SortKey = "actual" | "progress" | "remaining" | "reward" | "name";

const statusStyles: Record<
  StoreGoalStatus,
  { label: string; className: string }
> = {
  achieved: {
    label: "達成",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  inProgress: {
    label: "進行中",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  zero: {
    label: "目標0件",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  unregistered: {
    label: "目標未登録",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
};

export default function StoresTable({ stores }: StoresTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("actual");
  const staffOptions = useMemo(
    () =>
      Array.from(new Set(stores.map((store) => store.staffName))).sort((a, b) =>
        a.localeCompare(b, "ja")
      ),
    [stores]
  );
  const visibleStores = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ja");
    const filtered = stores.filter(
      (store) =>
        (!normalizedQuery ||
          store.name.toLocaleLowerCase("ja").includes(normalizedQuery)) &&
        (staffFilter === "all" || store.staffName === staffFilter)
    );

    return filtered.toSorted((a, b) => {
      switch (sortKey) {
        case "progress":
          return b.progress - a.progress || b.actual - a.actual;
        case "remaining":
          return b.remaining - a.remaining || b.actual - a.actual;
        case "reward":
          return b.expectedReward - a.expectedReward || b.actual - a.actual;
        case "name":
          return a.name.localeCompare(b.name, "ja");
        default:
          return b.actual - a.actual || b.progress - a.progress;
      }
    });
  }, [searchQuery, sortKey, staffFilter, stores]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">店舗一覧</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              店舗ごとの目標・実績・報酬見込を比較できます
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                店舗名検索
              </span>
              <span className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100">
                <Search size={16} className="text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="店舗名を入力"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                担当者
              </span>
              <select
                value={staffFilter}
                onChange={(event) => setStaffFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
              >
                <option value="all">すべての担当者</option>
                {staffOptions.map((staffName) => (
                  <option key={staffName} value={staffName}>
                    {staffName}
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
                <option value="actual">実績が多い順</option>
                <option value="progress">進捗率が高い順</option>
                <option value="remaining">残数が多い順</option>
                <option value="reward">報酬見込が多い順</option>
                <option value="name">店舗名順</option>
              </select>
            </label>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-500" aria-live="polite">
          {visibleStores.length}店舗を表示
        </p>
      </div>

      {visibleStores.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Store size={22} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            条件に一致する店舗はありません
          </p>
          <p className="mt-1 text-xs text-slate-400">
            店舗名または担当者の条件を変更してください
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold text-slate-500">
                <th scope="col" className="px-6 py-3.5">店舗名</th>
                <th scope="col" className="px-4 py-3.5">担当者</th>
                <th scope="col" className="px-4 py-3.5 text-right">目標</th>
                <th scope="col" className="px-4 py-3.5 text-right">実績</th>
                <th scope="col" className="px-4 py-3.5 text-right">残数</th>
                <th scope="col" className="min-w-48 px-4 py-3.5">進捗率</th>
                <th scope="col" className="px-4 py-3.5 text-right">報酬見込</th>
                <th scope="col" className="px-6 py-3.5">目標達成状況</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStores.map((store) => {
                const status = statusStyles[store.goalStatus];

                return (
                  <tr
                    key={store.key}
                    data-store-key={store.key}
                    className="transition hover:bg-slate-50/70"
                  >
                    <th scope="row" className="whitespace-nowrap px-6 py-4 text-left font-semibold text-slate-800">
                      {store.name}
                    </th>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {store.staffName}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-slate-500">
                      {formatCount(store.target)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-900">
                      {formatCount(store.actual)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-slate-600">
                      {formatCount(store.remaining)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            role="progressbar"
                            aria-label={`${store.name}の進捗率`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(store.progress)}
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${store.progress}%` }}
                          />
                        </div>
                        <span className="w-11 text-right text-xs font-semibold tabular-nums text-slate-600">
                          {formatPercent(store.progress, 0)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums text-slate-800">
                      {formatCurrency(store.expectedReward)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
