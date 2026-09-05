import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeJapaneseYen, ChartNoAxesCombined, Target, Trophy } from "lucide-react";
import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import Sidebar from "@/components/Sidebar";
import StaffCasesTable from "@/components/StaffCasesTable";
import { getDashboardData } from "@/lib/dashboard-api";
import { createStaffDetail } from "@/lib/dashboard";
import {
  formatCount,
  formatCurrency,
  formatPercent,
  formatTargetMonth,
} from "@/lib/formatters";
import {
  createMonthOptions,
  getTokyoCurrentMonth,
  resolveTargetMonth,
} from "@/lib/month";

type StaffDetailPageProps = {
  params: Promise<{ staffId: string }>;
  searchParams: Promise<{ month?: string | string[] }>;
};

export default async function StaffDetailPage({
  params,
  searchParams,
}: StaffDetailPageProps) {
  const [{ staffId }, query] = await Promise.all([params, searchParams]);
  const currentMonth = getTokyoCurrentMonth();
  const requestedMonth = resolveTargetMonth(query.month, currentMonth);
  const dashboardData = await getDashboardData(requestedMonth);
  const detail = createStaffDetail(
    staffId,
    dashboardData.staff,
    dashboardData.stores,
    dashboardData.rewards,
    dashboardData.cases,
    dashboardData.targetMonth,
    dashboardData.targetDataAvailable
  );

  if (!detail) notFound();

  const monthOptions = createMonthOptions(
    currentMonth,
    dashboardData.targetMonth
  );
  const detailPath = `/staff/${encodeURIComponent(staffId)}`;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar pathname="/staff" targetMonth={dashboardData.targetMonth} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pathname="/staff"
          controlsPathname={detailPath}
          title={detail.name}
          description="担当店舗の進捗と対象月の案件を確認できます"
          targetMonth={dashboardData.targetMonth}
          updatedAt={dashboardData.updatedAt}
          isFallback={dashboardData.isFallback}
          monthOptions={monthOptions}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            <Link
              href={{ pathname: "/staff", query: { month: dashboardData.targetMonth } }}
              className="mb-4 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 outline-none transition hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              担当者別実績へ戻る
            </Link>

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
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-medium text-slate-400">担当店舗</p>
                  <p className="mt-1 max-w-xl text-sm font-semibold text-slate-700">
                    {detail.storeNames.length > 0
                      ? detail.storeNames.join("、")
                      : "担当店舗なし"}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="個人獲得件数"
                value={formatCount(detail.personalActual)}
                subtext="本人が受付担当者となった件数"
                icon={ChartNoAxesCombined}
                tone="blue"
              />
              <KpiCard
                title="売上見込合計"
                value={formatCurrency(detail.expectedSales)}
                subtext="キャンセル以外の案件単価合計"
                icon={BadgeJapaneseYen}
                tone="emerald"
              />
              <KpiCard
                title="担当店舗目標"
                value={detail.targetRegistered ? formatCount(detail.target) : "未登録"}
                subtext={detail.targetRegistered ? `残り${formatCount(detail.remaining)}` : "目標データなし"}
                icon={Target}
                tone="violet"
              />
              <KpiCard
                title="担当店舗進捗率"
                value={detail.targetRegistered ? formatPercent(detail.progress) : "—"}
                subtext={`担当店舗実績 ${formatCount(detail.actual)}`}
                icon={Trophy}
                tone="amber"
              />
            </div>

            <div className="mt-5">
              <StaffCasesTable
                cases={detail.cases}
                caseCountMatches={detail.caseCountMatches}
                salesTotalMatches={detail.salesTotalMatches}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
