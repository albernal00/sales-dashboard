import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChartNoAxesCombined, CircleCheckBig, Target, Trophy } from "lucide-react";
import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import Sidebar from "@/components/Sidebar";
import StoreCasesTable from "@/components/StoreCasesTable";
import { getDashboardData } from "@/lib/dashboard-api";
import { createStoreRecordDetail } from "@/lib/dashboard";
import {
  formatCount,
  formatPercent,
  formatTargetMonth,
} from "@/lib/formatters";
import {
  createMonthOptions,
  getTokyoCurrentMonth,
  resolveTargetMonth,
} from "@/lib/month";
import type { StoreGoalStatus } from "@/types/dashboard";

type StoreDetailPageProps = {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ month?: string | string[] }>;
};

const goalStatuses: Record<
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

export default async function StoreDetailPage({
  params,
  searchParams,
}: StoreDetailPageProps) {
  const [{ storeId }, query] = await Promise.all([params, searchParams]);
  const currentMonth = getTokyoCurrentMonth();
  const requestedMonth = resolveTargetMonth(query.month, currentMonth);
  const dashboardData = await getDashboardData(requestedMonth);
  const detail = createStoreRecordDetail(
    storeId,
    dashboardData.stores,
    dashboardData.staff,
    dashboardData.rewards,
    dashboardData.targetMonth,
    dashboardData.targetDataAvailable
  );
  let knownStoreName: string | undefined;

  if (!detail && requestedMonth !== currentMonth) {
    const currentData = await getDashboardData(currentMonth);
    knownStoreName = currentData.stores.find(
      (store) => store.id === storeId
    )?.name;
  }

  const isUnavailableForMonth =
    !detail && (Boolean(knownStoreName) || !dashboardData.targetDataAvailable);
  if (!detail && !isUnavailableForMonth) notFound();

  const monthOptions = createMonthOptions(
    currentMonth,
    dashboardData.targetMonth
  );
  const detailPath = `/stores/${encodeURIComponent(storeId)}`;
  const pageTitle = detail?.name ?? knownStoreName ?? "店舗詳細";

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar pathname="/stores" targetMonth={dashboardData.targetMonth} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pathname="/stores"
          controlsPathname={detailPath}
          title={pageTitle}
          description="店舗の件数進捗と対象月の案件を確認できます"
          targetMonth={dashboardData.targetMonth}
          updatedAt={dashboardData.updatedAt}
          isFallback={dashboardData.isFallback}
          monthOptions={monthOptions}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            <Link
              href={{ pathname: "/stores", query: { month: dashboardData.targetMonth } }}
              className="mb-4 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 outline-none transition hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              店舗別実績へ戻る
            </Link>

            {isUnavailableForMonth ? (
              <div
                role="status"
                className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center"
              >
                <p className="text-base font-bold text-amber-900">
                  この月の店舗目標・実績はありません
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  対象月を変更するか、店舗別実績へ戻って確認してください
                </p>
              </div>
            ) : detail ? (
              <>
                {!dashboardData.isFallback &&
                  !dashboardData.targetDataAvailable && (
                    <div
                      role="status"
                      className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
                    >
                      この月の目標データは登録されていません
                    </div>
                  )}

                <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">
                        {formatTargetMonth(detail.targetMonth)}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-950">
                        {detail.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        店舗担当者：{detail.staffName}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${goalStatuses[detail.goalStatus].className}`}
                    >
                      {goalStatuses[detail.goalStatus].label}
                    </span>
                  </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    title="目標件数"
                    value={detail.goalStatus === "unregistered" ? "未登録" : formatCount(detail.target)}
                    subtext="担当店舗の月間目標"
                    icon={Target}
                    tone="violet"
                  />
                  <KpiCard
                    title="実績件数"
                    value={formatCount(detail.actual)}
                    subtext="店舗の対象月実績"
                    icon={ChartNoAxesCombined}
                    tone="blue"
                  />
                  <KpiCard
                    title="残数"
                    value={detail.goalStatus === "unregistered" ? "—" : formatCount(detail.remaining)}
                    subtext="目標達成までの件数"
                    icon={CircleCheckBig}
                    tone="emerald"
                  />
                  <KpiCard
                    title="進捗率"
                    value={detail.goalStatus === "unregistered" ? "—" : formatPercent(detail.progress)}
                    subtext="店舗実績 ÷ 店舗目標"
                    icon={Trophy}
                    tone="amber"
                  />
                </div>

                <div className="mt-5">
                  <StoreCasesTable
                    cases={detail.cases}
                    caseCountMatches={detail.caseCountMatches}
                  />
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
