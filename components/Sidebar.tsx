import {
  LayoutDashboard,
  Store,
  Users,
  ClipboardList,
  Tv,
  Settings,
  BarChart3,
  HelpCircle,
} from "lucide-react";

const menuItems = [
  {
    name: "ダッシュボード",
    icon: LayoutDashboard,
  },
  {
    name: "店舗別実績",
    icon: Store,
  },
  {
    name: "担当者別実績",
    icon: Users,
  },
  {
    name: "案件・報酬管理",
    icon: ClipboardList,
  },
  {
    name: "STB管理",
    icon: Tv,
  },
  {
    name: "マスタ・設定",
    icon: Settings,
  },
];

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
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                index === 0
                  ? "bg-blue-500 text-white shadow-md shadow-blue-950/20"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
              aria-current={index === 0 ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={index === 0 ? 2.3 : 1.9} aria-hidden="true" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white">
          <HelpCircle size={18} aria-hidden="true" />
          <span>ヘルプ・サポート</span>
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
