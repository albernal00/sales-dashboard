"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { ChevronRight, X } from "lucide-react";
import {
  formatCount,
  formatCurrency,
  formatPercent,
  formatTargetMonth,
} from "@/lib/formatters";
import type { StoreDetail, StoreProgressRow } from "@/types/dashboard";

type StoreProgressProps = {
  stores: StoreProgressRow[];
  details: StoreDetail[];
};

const subscribe = () => () => {};

export default function StoreProgress({ stores, details }: StoreProgressProps) {
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const selectedStore = details.find((store) => store.key === selectedKey);

  const openDetail = (key: string, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setSelectedKey(key);
  };

  const closeDetail = () => {
    setSelectedKey(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  };

  useEffect(() => {
    if (!selectedStore) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetail();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedStore]);

  const dialog = selectedStore ? (
    <div className="fixed inset-0 z-[100] isolate flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="店舗詳細を閉じる"
        onClick={closeDetail}
        className="absolute inset-0 z-0 bg-slate-950/55"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-detail-title"
        aria-describedby="store-detail-description"
        className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold text-blue-600">
              {formatTargetMonth(selectedStore.targetMonth)}
            </p>
            <h2
              id="store-detail-title"
              className="mt-1 text-lg font-bold text-slate-950"
            >
              {selectedStore.name}
            </h2>
            <p
              id="store-detail-description"
              className="mt-0.5 text-xs text-slate-500"
            >
              担当者：{selectedStore.staffName}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="店舗詳細を閉じる"
            onClick={closeDetail}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["目標", formatCount(selectedStore.target)],
              ["実績", formatCount(selectedStore.actual)],
              ["残数", formatCount(selectedStore.remaining)],
              ["進捗率", formatPercent(selectedStore.progress)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3 py-3">
                <dt className="text-[11px] font-medium text-slate-400">{label}</dt>
                <dd className="mt-1 text-base font-bold tabular-nums text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
            <p className="text-[11px] font-semibold text-emerald-700">報酬見込合計</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-950">
              {formatCurrency(selectedStore.expectedReward)}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900">商品別内訳</h3>

            {selectedStore.actual === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                対象月の実績はありません
              </div>
            ) : selectedStore.products.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                商品別報酬データはありません
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-96 text-sm">
                  <thead className="bg-slate-50 text-left text-[11px] font-semibold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">商品</th>
                      <th className="px-4 py-3 text-right">件数</th>
                      <th className="px-4 py-3 text-right">報酬見込</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStore.products.map((product) => (
                      <tr key={product.priceKey}>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {product.priceKey}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                          {formatCount(product.count)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">
                          {formatCurrency(product.expectedReward)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

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
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
          全{stores.length}店舗
        </span>
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
            {stores.map((store) => (
              <tr
                key={store.key}
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest("a, button, input, select, textarea")) return;
                  const opener = event.currentTarget.querySelector("button");
                  if (opener) openDetail(store.key, opener);
                }}
                className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0"
              >
                <td className="whitespace-nowrap py-4 font-semibold text-slate-800">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={(event) => openDetail(store.key, event.currentTarget)}
                    className="group flex items-center gap-1.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {store.name}
                    <ChevronRight
                      size={14}
                      className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
                      aria-hidden="true"
                    />
                  </button>
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
                  <span className="inline-flex min-w-7 justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-600">
                    {formatCount(store.remaining, false)}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 text-slate-600">
                  {store.staffName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isMounted && dialog && createPortal(dialog, document.body)}
    </section>
  );
}
