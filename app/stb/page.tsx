import { CalendarCheck, ClipboardCheck, Tv } from "lucide-react";
import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import Sidebar from "@/components/Sidebar";
import StbStaffFilter from "@/components/StbStaffFilter";
import { requirePageUser } from "@/lib/auth";
import { getStbViewData } from "@/lib/dashboard-api";
import { formatCount, formatDate, formatPercent, formatTargetMonth } from "@/lib/formatters";
import { createStbMonthOptions, getTokyoCurrentMonth, resolveStbTargetMonth } from "@/lib/month";
import type { StbCheckCandidate } from "@/types/dashboard";

type StbPageProps = {
  searchParams: Promise<{ month?: string | string[]; staff?: string | string[] }>;
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
  const requestedMonth = resolveStbTargetMonth(query.month, currentMonth);
  const stbView = await getStbViewData(requestedMonth);
  const monthOptions = createStbMonthOptions(currentMonth, requestedMonth);
  const stb = stbView?.stb ?? null;
  const staffNames = stbView?.staff ?? new Map<string, string>();
  const selectedStaffId = currentUser.role === "admin" &&
    typeof query.staff === "string" && staffNames.has(query.staff)
      ? query.staff
      : null;
  const visibleStaffId = currentUser.role === "admin"
    ? selectedStaffId
    : currentUser.staffId ?? null;
  const scope = (items: StbCheckCandidate[]) =>
    currentUser.role === "staff"
      ? items.filter((item) => item.staffId === currentUser.staffId)
      : visibleStaffId
      ? items.filter((item) => item.staffId === visibleStaffId)
      : items;
  const storeNames = stbView?.stores ?? new Map<string, string>();
  const twoMonthChecks = stb ? scope(stb.twoMonthChecks) : [];
  const twelveMonthChecks = stb ? scope(stb.twelveMonthChecks) : [];
  const dateNeedsReview = stb ? scope(stb.dateNeedsReview) : [];
  const staffSummary = visibleStaffId && stb?.byStaff
    ? stb.byStaff.find((item) => item.staffId === visibleStaffId)
    : null;
  const applicationCount = stb
    ? visibleStaffId
      ? stb.byStaff ? staffSummary?.applicationCount ?? 0 : null
      : stb.applicationCount
    : null;
  const stbApplicationCount = stb
    ? visibleStaffId
      ? stb.byStaff ? staffSummary?.stbApplicationCount ?? 0 : null
      : stb.stbApplicationCount
    : null;
  const scopeLabel = visibleStaffId ? staffNames.get(visibleStaffId) ?? "本人" : "全担当者";
  const staffOptions = Array.from(staffNames, ([id, name]) => ({ id, name }))
    .toSorted((a, b) => a.name.localeCompare(b.name, "ja"));

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar pathname="/stb" targetMonth={requestedMonth} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pathname="/stb"
          title="STB管理"
          description="申込時の添付率と工事後の確認候補を確認できます"
          targetMonth={requestedMonth}
          updatedAt={stbView?.updatedAt ?? ""}
          isFallback={false}
          monthOptions={monthOptions}
          monthLabel="確認予定月"
          showMonthStepper
          currentMonth={currentMonth}
          selectedStaffId={selectedStaffId}
          currentUser={{ name: currentUser.name, role: currentUser.role }}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            {!stb ? (
              <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-5 text-sm font-medium text-amber-800">
                STBの確認候補を取得できません。GASのSTB専用APIとデプロイ状況を確認してください。
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">
                    {formatTargetMonth(requestedMonth)}を確認予定月として表示しています。申込件数・添付率は同じ月の申込案件を集計しています。
                    {visibleStaffId && ` 表示対象：${scopeLabel}`}
                  </p>
                  {currentUser.role === "admin" && (
                    <StbStaffFilter
                      targetMonth={requestedMonth}
                      selectedStaffId={selectedStaffId}
                      staff={staffOptions}
                    />
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard title="申込案件数" value={applicationCount === null ? "未取得" : formatCount(applicationCount)} subtext={`${scopeLabel}・選択月の申込・キャンセル除外`} icon={ClipboardCheck} tone="blue" />
                  <KpiCard title="STB添付申込数" value={stbApplicationCount === null ? "未取得" : formatCount(stbApplicationCount)} subtext={`${scopeLabel}・選択月の申込・抽出シートZ列がSTB`} icon={Tv} tone="violet" />
                  <KpiCard title="STB添付率" value={applicationCount === null || stbApplicationCount === null
                    ? "未取得"
                    : applicationCount
                      ? formatPercent(stbApplicationCount / applicationCount * 100)
                      : "算出不可"} subtext="STB添付申込数 ÷ 申込案件数" icon={Tv} tone="emerald" />
                  <KpiCard title="確認予定候補" value={formatCount(twoMonthChecks.length + twelveMonthChecks.length)} subtext="選択月に確認予定の2か月・12か月候補" icon={CalendarCheck} tone="amber" />
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
