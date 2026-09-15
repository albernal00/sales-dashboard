import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import StaffTable from "@/components/StaffTable";
import { getDashboardData } from "@/lib/dashboard-api";
import { createStaffListRows } from "@/lib/dashboard";
import {
  createMonthOptions,
  getTokyoCurrentMonth,
  resolveTargetMonth,
} from "@/lib/month";
import { requirePageUser } from "@/lib/auth";
import { createStaffStbMetrics } from "@/lib/stb-metrics";
import type { StaffTableRow } from "@/types/dashboard";

type StaffPageProps = {
  searchParams: Promise<{ month?: string | string[] }>;
};

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const currentUser = await requirePageUser();
  const canViewSales = currentUser.role === "admin";
  const currentMonth = getTokyoCurrentMonth();
  const query = await searchParams;
  const requestedMonth = resolveTargetMonth(query.month, currentMonth);
  const dashboardData = await getDashboardData(requestedMonth);
  const monthOptions = createMonthOptions(
    currentMonth,
    dashboardData.targetMonth
  );
  const staffRows = createStaffListRows(
    dashboardData.staff,
    dashboardData.stores,
    canViewSales ? dashboardData.rewards : [],
    dashboardData.appointments,
    dashboardData.targetMonth,
    dashboardData.targetDataAvailable
  );
  const stbMetrics = createStaffStbMetrics(dashboardData.stb, dashboardData.staff);
  const staff: StaffTableRow[] = canViewSales
    ? staffRows.map((person) => ({
        ...person,
        stbAttachmentCount: stbMetrics.get(person.staffId)?.attachmentCount ?? null,
        stbAttachmentRate: stbMetrics.get(person.staffId)?.attachmentRate ?? null,
      }))
    : staffRows.map(({ staffId, key, name, personalActual, prospectCount }) => ({
        staffId,
        key,
        name,
        personalActual,
        prospectCount,
        stbAttachmentCount: stbMetrics.get(staffId)?.attachmentCount ?? null,
        stbAttachmentRate: stbMetrics.get(staffId)?.attachmentRate ?? null,
      }));

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar pathname="/staff" targetMonth={dashboardData.targetMonth} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pathname="/staff"
          title="担当者別実績"
          description="個人の獲得件数と、その案件に対するSTB添付件数・率を確認できます"
          targetMonth={dashboardData.targetMonth}
          updatedAt={dashboardData.updatedAt}
          isFallback={dashboardData.isFallback}
          monthOptions={monthOptions}
          currentUser={{ name: currentUser.name, role: currentUser.role }}
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

            <StaffTable
              staff={staff}
              targetMonth={dashboardData.targetMonth}
              canViewSales={canViewSales}
              viewerStaffId={currentUser.staffId}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
