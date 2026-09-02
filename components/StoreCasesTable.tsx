"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import type { StoreCaseRow } from "@/types/dashboard";

type StoreCasesTableProps = {
  cases: StoreCaseRow[];
  caseCountMatches: boolean;
};

type SortKey = "dateDesc" | "dateAsc";

export default function StoreCasesTable({
  cases,
  caseCountMatches,
}: StoreCasesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("dateDesc");
  const staffOptions = useMemo(
    () =>
      Array.from(new Set(cases.map((item) => item.acquiredStaffName))).sort(
        (a, b) => a.localeCompare(b, "ja")
      ),
    [cases]
  );
  const visibleCases = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ja");
    const filtered = cases.filter(
      (item) =>
        (!normalizedQuery ||
          item.acquiredStaffName
            .toLocaleLowerCase("ja")
            .includes(normalizedQuery) ||
          item.productName.toLocaleLowerCase("ja").includes(normalizedQuery)) &&
        (staffFilter === "all" || item.acquiredStaffName === staffFilter)
    );

    return filtered.toSorted((a, b) => {
      const aDate = a.applicationDate ?? "";
      const bDate = b.applicationDate ?? "";
      if (!aDate && bDate) return 1;
      if (aDate && !bDate) return -1;
      return sortKey === "dateAsc"
        ? aDate.localeCompare(bDate)
        : bDate.localeCompare(aDate);
    });
  }, [cases, searchQuery, sortKey, staffFilter]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">案件一覧</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              対象月に紹介された申込案件
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                担当者名・商品名検索
              </span>
              <span className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100">
                <Search size={16} className="text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="担当者名または商品名"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                獲得担当者
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
                <option value="dateDesc">申込日が新しい順</option>
                <option value="dateAsc">申込日が古い順</option>
              </select>
            </label>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-500" aria-live="polite">
          {visibleCases.length}件を表示
        </p>
      </div>

      {!caseCountMatches && (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800 sm:px-6"
        >
          一部の案件情報を表示できません
        </div>
      )}

      {visibleCases.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ClipboardList size={22} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            {cases.length === 0
              ? "対象月の案件はありません"
              : "条件に一致する案件はありません"}
          </p>
          {cases.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              担当者名、商品名または絞り込み条件を変更してください
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold text-slate-500">
                <th scope="col" className="px-6 py-3.5">案件番号</th>
                <th scope="col" className="px-4 py-3.5">申込日</th>
                <th scope="col" className="px-4 py-3.5">獲得担当者</th>
                <th scope="col" className="px-4 py-3.5">商品・獲得内容</th>
                <th scope="col" className="px-6 py-3.5">工事日・状況</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleCases.map((item) => (
                <tr key={item.key} className="transition hover:bg-slate-50/70">
                  <th scope="row" className="whitespace-nowrap px-6 py-4 text-left font-mono text-xs font-semibold text-slate-700">
                    {item.caseNumber}
                  </th>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {item.applicationDate
                      ? formatDate(item.applicationDate)
                      : "申込日不明"}
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-700">
                    {item.acquiredStaffName}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {item.productName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {/^\d{4}-\d{2}-\d{2}$/.test(item.constructionSchedule)
                      ? formatDate(item.constructionSchedule)
                      : item.constructionSchedule}
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
