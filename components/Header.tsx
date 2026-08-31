import {
  CalendarDays,
  RefreshCw,
  User,
  ChevronDown,
  BarChart3,
} from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#101b36] text-white lg:hidden">
          <BarChart3 size={20} aria-hidden="true" />
        </div>
        <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
          ダッシュボード
        </h1>

        <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
          営業実績・報酬進捗を確認できます
        </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* 対象月 */}
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100">
          <CalendarDays
            size={17}
            className="text-slate-400"
            aria-hidden="true"
          />

          <span className="sr-only">対象月</span>
          <select className="cursor-pointer appearance-none bg-transparent pr-4 text-xs font-semibold text-slate-700 outline-none sm:text-sm">
            <option>2026年8月</option>
            <option>2026年7月</option>
            <option>2026年6月</option>
          </select>
        </label>

        {/* 最終更新 */}
        <button aria-label="実績データを更新" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-slate-500 transition hover:bg-slate-100 sm:flex">
          <RefreshCw size={16} aria-hidden="true" />

          <div className="text-left">
            <p className="text-[10px] text-slate-400">
              最終更新
            </p>

            <p className="text-[11px] font-semibold text-slate-600">
              2026/08/31 17:50
            </p>
          </div>
        </button>

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
