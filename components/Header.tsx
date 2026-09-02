import {
  User,
  ChevronDown,
} from "lucide-react";
import MobileSidebar from "./MobileSidebar";
import DashboardControls from "./DashboardControls";
import { formatUpdatedAt } from "@/lib/formatters";

type HeaderProps = {
  pathname: string;
  title?: string;
  description?: string;
  targetMonth: string;
  updatedAt: string;
  isFallback: boolean;
  monthOptions: string[];
};

export default function Header({
  pathname,
  title = "ダッシュボード",
  description = "営業実績・売上進捗を確認できます",
  targetMonth,
  updatedAt,
  isFallback,
  monthOptions,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <MobileSidebar pathname={pathname} targetMonth={targetMonth} />
        <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {title}
          </h1>
          {isFallback && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              デモデータを表示しています
            </span>
          )}
        </div>

        <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
          {description}
        </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <DashboardControls
          pathname={pathname}
          targetMonth={targetMonth}
          monthOptions={monthOptions}
          formattedUpdatedAt={formatUpdatedAt(updatedAt)}
        />

        {/* ユーザー */}
        <span className="hidden h-8 w-px bg-slate-200 sm:block" />
        <button aria-label="ユーザーメニュー" className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 sm:pl-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
            <User
              size={17}
              className="text-blue-600"
              aria-hidden="true"
            />
          </div>

          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold text-slate-800">
              ユーザー
            </p>

            <p className="text-[10px] text-slate-400">
              管理者
            </p>
          </div>
          <ChevronDown size={14} className="hidden text-slate-400 md:block" aria-hidden="true" />
        </button>
      </div>
      </div>
    </header>
  );
}
