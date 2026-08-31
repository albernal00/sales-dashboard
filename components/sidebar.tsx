const menuItems = [
  "ダッシュボード",
  "店舗別実績",
  "担当者別実績",
  "案件・報酬管理",
  "STB管理",
  "マスタ・設定",
];

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-gray-200 bg-white p-5">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900">
          営業実績管理
        </h2>
        <p className="text-xs text-gray-500">
          KPI・報酬管理ダッシュボード
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={item}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
              index === 0
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}