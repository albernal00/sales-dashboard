import { formatCount, formatPercent } from "@/lib/formatters";
import type { StoreProgressRow } from "@/types/dashboard";

type StoreProgressProps = {
  stores: StoreProgressRow[];
};

export default function StoreProgress({ stores }: StoreProgressProps) {
  return (
    <section className="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
        <h2 className="text-[15px] font-bold text-slate-900">
          店舗別進捗状況
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          今月の目標と実績
        </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">全{stores.length}店舗</span>
      </div>

      <div className="overflow-x-auto px-5 pb-2 sm:px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 font-semibold">店舗名</th>
              <th className="py-3 font-semibold">目標</th>
              <th className="py-3 font-semibold">実績</th>
              <th className="min-w-44 py-3 font-semibold">進捗</th>
              <th className="py-3 font-semibold">残数</th>
              <th className="py-3 font-semibold">担当者</th>
            </tr>
          </thead>

          <tbody>
            {stores.map((store) => {
              return (
                <tr
                  key={store.name}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0"
                >
                  <td className="whitespace-nowrap py-4 font-semibold text-slate-800">
                    {store.name}
                  </td>

                  <td className="py-4 tabular-nums text-slate-500">
                    {formatCount(store.target, false)}
                  </td>

                  <td className="py-4 font-semibold tabular-nums text-slate-800">
                    {formatCount(store.actual, false)}
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${store.progress}%` }}
                          role="progressbar"
                          aria-label={`${store.name}の進捗`}
                          aria-valuenow={Math.round(store.progress)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>

                      <span className="w-8 text-right text-[11px] font-semibold tabular-nums text-slate-500">
                        {formatPercent(store.progress, 0)}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="inline-flex min-w-7 justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-600">{formatCount(store.remaining, false)}</span>
                  </td>

                  <td className="whitespace-nowrap py-4 text-slate-600">
                    {store.staffName}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
