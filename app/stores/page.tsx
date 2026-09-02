import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import StoresTable from "@/components/StoresTable";
import { getDashboardData } from "@/lib/dashboard-api";
import { createStoreListRows } from "@/lib/dashboard";
import {
  createMonthOptions,
  getTokyoCurrentMonth,
  resolveTargetMonth,
} from "@/lib/month";

type StoresPageProps = {
  searchParams: Promise<{ month?: string | string[] }>;
};

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const currentMonth = getTokyoCurrentMonth();
  const query = await searchParams;
  const requestedMonth = resolveTargetMonth(query.month, currentMonth);
  const dashboardData = await getDashboardData(requestedMonth);
  const monthOptions = createMonthOptions(
    currentMonth,
    dashboardData.targetMonth
  );
  const stores = createStoreListRows(
    dashboardData.stores,
    dashboardData.staff,
    dashboardData.targetDataAvailable
  );

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar pathname="/stores" targetMonth={dashboardData.targetMonth} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pathname="/stores"
          title="店舗別実績"
          description="店舗ごとの目標件数と実績件数を確認できます"
          targetMonth={dashboardData.targetMonth}
          updatedAt={dashboardData.updatedAt}
          isFallback={dashboardData.isFallback}
          monthOptions={monthOptions}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            {!dashboardData.isFallback &&
              !dashboardData.targetDataAvailable && (
                <div
                  role="status"
                  className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
                >
                  この月の目標データは登録されていません
                </div>
              )}

            <StoresTable
              stores={stores}
              targetMonth={dashboardData.targetMonth}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
