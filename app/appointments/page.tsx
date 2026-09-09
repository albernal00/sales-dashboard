import { CalendarClock, CalendarDays, Store, Users } from "lucide-react";
import AppointmentsTable from "@/components/AppointmentsTable";
import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import Sidebar from "@/components/Sidebar";
import { getDashboardData } from "@/lib/dashboard-api";
import { calculateAppointmentSummary, createAppointmentRows } from "@/lib/dashboard";
import { formatCount } from "@/lib/formatters";
import {
  createMonthOptions,
  getTokyoCurrentMonth,
  getTokyoToday,
  resolveTargetMonth,
} from "@/lib/month";
import { requirePageUser } from "@/lib/auth";

type AppointmentsPageProps = {
  searchParams: Promise<{ month?: string | string[] }>;
};

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const currentUser = await requirePageUser();
  const currentMonth = getTokyoCurrentMonth();
  const query = await searchParams;
  const requestedMonth = resolveTargetMonth(query.month, currentMonth);
  const dashboardData = await getDashboardData(requestedMonth);
  const monthOptions = createMonthOptions(currentMonth, dashboardData.targetMonth);
  const visibleAppointments = currentUser.role === "admin"
    ? dashboardData.appointments
    : dashboardData.appointments.filter(
        (appointment) => appointment.staffId === currentUser.staffId
      );
  const appointments = createAppointmentRows(
    visibleAppointments,
    dashboardData.staff,
    dashboardData.stores,
    dashboardData.targetMonth
  );
  const today = getTokyoToday();
  const summary = calculateAppointmentSummary(appointments, today);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar pathname="/appointments" targetMonth={dashboardData.targetMonth} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pathname="/appointments"
          title="アポイント予定"
          description="対象月の商談予定と見込み件数を確認できます"
          targetMonth={dashboardData.targetMonth}
          updatedAt={dashboardData.updatedAt}
          isFallback={dashboardData.isFallback}
          monthOptions={monthOptions}
          currentUser={{ name: currentUser.name, role: currentUser.role }}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard title="見込み件数合計" value={formatCount(summary.prospectCount)} subtext="商談未完了の予定" icon={CalendarClock} tone="violet" />
              <KpiCard title="本日以降の件数" value={formatCount(summary.upcomingCount)} subtext="商談未完了・本日以降" icon={CalendarDays} tone="blue" />
              <KpiCard title="担当者数" value={`${summary.staffCount}名`} subtext="見込み予定の受付担当者" icon={Users} tone="emerald" />
              <KpiCard title="店舗数" value={`${summary.storeCount}店`} subtext="見込み予定の紹介店舗" icon={Store} tone="amber" />
            </div>
            <div className="mt-5">
              <AppointmentsTable appointments={appointments} today={today} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
