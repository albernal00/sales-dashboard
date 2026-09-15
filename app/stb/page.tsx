import { CalendarCheck, ClipboardCheck, Tv } from "lucide-react";
import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import Sidebar from "@/components/Sidebar";
import { requirePageUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-api";
import { formatCount, formatDate, formatPercent, formatTargetMonth } from "@/lib/formatters";
import { createMonthOptions, getTokyoCurrentMonth, resolveTargetMonth } from "@/lib/month";
import type { StbCheckCandidate } from "@/types/dashboard";

type StbPageProps = {
  searchParams: Promise<{ month?: string | string[] }>;
};

function CheckTable({
  title,
  subtitle,
  candidates,
  stores,
  staff,
  dueDateColumn = true,
}: {
  title: string;
  subtitle: string;
  candidates: StbCheckCandidate[];
  stores: Map<string, string>;
  staff: Map<string, string>;
  dueDateColumn?: boolean;
}) {
  const sorted = candidates.toSorted((a, b) =>
    (a.dueDate ?? a.applicationDate ?? "").localeCompare(b.dueDate ?? b.applicationDate ?? "")
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        <p className="mt-3 text-xs font-medium text-slate-500">{formatCount(sorted.length)}の候補</p>
      </div>
      {sorted.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">該当する候補はありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold text-slate-500">
                {dueDateColumn && <th scope="col" className="px-6 py-3.5">確認予定日</th>}
                <th scope="col" className="px-4 py-3.5">工事日</th>
                <th scope="col" className="px-4 py-3.5">申込日</th>
                <th scope="col" className="px-4 py-3.5">店舗</th>
                <th scope="col" className="px-4 py-3.5">受付担当者</th>
                <th scope="col" className="px-6 py-3.5">識別番号</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  {dueDateColumn && <th scope="row" className="whitespace-nowrap px-6 py-4 text-left font-semibold text-slate-800">{item.dueDate ? formatDate(item.dueDate) : "日付不明"}</th>}
                  <td className="whitespace-nowrap px-4 py-4 text-slate-700">{item.constructionDate ? formatDate(item.constructionDate) : "未入力"}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-700">{item.applicationDate ? formatDate(item.applicationDate) : "不明"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.storeId ? stores.get(item.storeId) ?? "店舗不明" : "店舗不明"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.staffId ? staff.get(item.staffId) ?? "担当者不明" : "担当者不明"}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">{item.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function StbPage({ searchParams }: StbPageProps) {
  const currentUser = await requirePageUser();
  const currentMonth = getTokyoCurrentMonth();
  const query = await searchParams;
  const requestedMonth = resolveTargetMonth(query.month, currentMonth);
  const dashboardData = await getDashboardData(requestedMonth);
  const monthOptions = createMonthOptions(currentMonth, dashboardData.targetMonth);
  const stb = dashboardData.stb;
  const scope = (items: StbCheckCandidate[]) =>
    currentUser.role === "admin"
      ? items
      : items.filter((item) => item.staffId === currentUser.staffId);
  const storeNames = new Map(dashboardData.stores.map((store) => [store.id, store.name]));
  const staffNames = new Map(dashboardData.staff.map((person) => [person.id, person.name]));
  const twoMonthChecks = stb ? scope(stb.twoMonthChecks) : [];
  const twelveMonthChecks = stb ? scope(stb.twelveMonthChecks) : [];
  const dateNeedsReview = stb ? scope(stb.dateNeedsReview) : [];

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar pathname="/stb" targetMonth={dashboardData.targetMonth} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pathname="/stb"
          title="STB管理"
          description="申込時の添付率と工事後の確認候補を確認できます"
          targetMonth={dashboardData.targetMonth}
          updatedAt={dashboardData.updatedAt}
          isFallback={dashboardData.isFallback}
          monthOptions={monthOptions}
          currentUser={{ name: currentUser.name, role: currentUser.role }}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            {!stb ? (
              <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-5 text-sm font-medium text-amber-800">
                STBデータを取得できません。GASのSTB項目とデプロイ状況を確認してください。
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-600">
                  {formatTargetMonth(dashboardData.targetMonth)}の申込案件と確認予定を表示しています。
                  {currentUser.role === "staff" && " 確認候補は本人分のみ表示します。"}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard title="申込案件数" value={formatCount(stb.applicationCount)} subtext="キャンセルを除く申込月の件数" icon={ClipboardCheck} tone="blue" />
                  <KpiCard title="STB添付申込数" value={formatCount(stb.stbApplicationCount)} subtext="抽出シートZ列がSTB" icon={Tv} tone="violet" />
                  <KpiCard title="STB添付率" value={stb.applicationCount ? formatPercent(stb.attachmentRate * 100) : "算出不可"} subtext="STB添付申込数 ÷ 申込案件数" icon={Tv} tone="emerald" />
                  <KpiCard title="確認予定候補" value={formatCount(twoMonthChecks.length + twelveMonthChecks.length)} subtext="工事後2か月・12か月の候補" icon={CalendarCheck} tone="amber" />
                </div>
                <div role="note" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  この一覧は継続確認の候補です。架電結果・継続状況は別ファイルで管理します。12か月後の候補は、現在の抽出範囲（1220行目以降）より前の案件が含まれないため、過去データの確認が終わるまで完全な架電リストとして使わないでください。
                </div>
                <div className="mt-5 grid gap-5">
                  <CheckTable title="工事後2か月の確認候補" subtitle="対象月に工事日から2か月後を迎えるSTB案件" candidates={twoMonthChecks} stores={storeNames} staff={staffNames} />
                  <CheckTable title="工事後12か月の確認候補" subtitle="対象月に工事日から12か月後を迎えるSTB案件" candidates={twelveMonthChecks} stores={storeNames} staff={staffNames} />
                  <CheckTable title="工事日を確認できないSTB案件" subtitle="抽出範囲内の全期間から、工事日が未入力または読めない案件" candidates={dateNeedsReview} stores={storeNames} staff={staffNames} dueDateColumn={false} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
