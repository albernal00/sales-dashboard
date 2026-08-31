import { BarChart3, HelpCircle } from "lucide-react";
import { menuItems } from "./navigation";

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-[#101b36] px-4 py-5 text-white lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-950/30">
          <BarChart3 size={21} strokeWidth={2.3} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold tracking-wide">営業実績管理</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">Sales Performance</p>
        </div>
      </div>

      <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-500">MAIN MENU</p>
      <nav className="space-y-1" aria-label="メインメニュー">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.name}
              disabled={!item.available}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                item.available
                  ? "bg-blue-500 text-white shadow-md shadow-blue-950/20"
                  : "cursor-not-allowed text-slate-500"
              }`}
              aria-current={item.available ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={item.available ? 2.3 : 1.9} aria-hidden="true" />
              <span className="flex-1">{item.name}</span>
              {!item.available && (
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                  準備中
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <button type="button" disabled className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-500">
          <HelpCircle size={18} aria-hidden="true" />
          <span className="flex-1">ヘルプ・サポート</span>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-semibold text-slate-500">準備中</span>
        </button>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] font-medium text-slate-300">システムステータス</p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            すべて正常に稼働中
          </div>
        </div>
      </div>
    </aside>
  );
}
