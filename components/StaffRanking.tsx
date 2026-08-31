const staff = [
  { name: "土田", count: 13, reward: 285000 },
  { name: "大森", count: 8, reward: 164000 },
  { name: "田中", count: 4, reward: 82000 },
  { name: "山田", count: 2, reward: 41000 },
];

export default function StaffRanking() {
  return (
    <section className="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-[15px] font-bold text-slate-900">
          担当者ランキング
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          今月の獲得実績
        </p>
      </div>

      <div className="divide-y divide-slate-100 px-5 sm:px-6">
        {staff.map((person, index) => (
          <div
            key={person.name}
            className="flex items-center justify-between gap-4 py-[15px]"
          >
            <div className="flex items-center gap-3">
              <div className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${index === 0 ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100" : index === 1 ? "bg-slate-100 text-slate-600" : index === 2 ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-400"}`}>
                {index + 1}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {person.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {person.count}件
                </p>
              </div>
            </div>

            <p className="text-sm font-bold tabular-nums text-slate-800">
              ¥{person.reward.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
