import KpiCard from "../components/KpiCard";
import Sidebar from "../components/Sidebar";
import StoreProgress from "../components/StoreProgress";
import StaffRanking from "../components/StaffRanking";
import Header from "../components/Header";
import { BadgeJapaneseYen, ChartNoAxesCombined, Target, Trophy } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard-api";
import {
  calculateDashboardKpis,
  createStaffRanking,
  createStoreProgressRows,
} from "@/lib/dashboard";
import {
  formatCount,
  formatCurrency,
  formatPercent,
  formatSignedCount,
} from "@/lib/formatters";

export default async function Home() {
  const dashboardData = await getDashboardData();
  const kpis = calculateDashboardKpis(
    dashboardData.stores,
    dashboardData.rewards
  );
  const storeRows = createStoreProgressRows(
    dashboardData.stores,
    dashboardData.staff
  );
  const staffRanking = createStaffRanking(
    dashboardData.staff,
    dashboardData.rewards
  );

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          targetMonth={dashboardData.targetMonth}
          updatedAt={dashboardData.updatedAt}
          isFallback={dashboardData.isFallback}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <KpiCard
              title="今月実績"
              value={formatCount(kpis.actual)}
              subtext={`先月比 ${formatSignedCount(kpis.previousMonthDifference)}`}
              icon={ChartNoAxesCombined}
              tone="blue"
            />

            <KpiCard
              title="目標件数"
              value={formatCount(kpis.target)}
              subtext={`残り${formatCount(kpis.remaining)}`}
              icon={Target}
              tone="violet"
            />

            <KpiCard
              title="達成率"
              value={formatPercent(kpis.achievementRate)}
              subtext="今月目標"
              icon={Trophy}
              tone="amber"
            />

            <KpiCard
              title="報酬見込"
              value={formatCurrency(kpis.expectedReward)}
              subtext="確定 + 未確定"
              icon={BadgeJapaneseYen}
              tone="emerald"
            />
          </div>

          <div className="mt-5 grid gap-5 2xl:grid-cols-3">
            <div className="min-w-0 2xl:col-span-2">
              <StoreProgress stores={storeRows} />
            </div>

            <StaffRanking staff={staffRanking} />
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
