"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BarChart3, HelpCircle, Menu, X } from "lucide-react";
import { menuItems } from "./navigation";

const subscribe = () => () => {};

export default function MobileSidebar() {
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const drawer = (
    <div
      className={`fixed inset-0 z-[100] isolate transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="メニューを閉じる"
        tabIndex={isOpen ? 0 : -1}
        onClick={() => setIsOpen(false)}
        className={`absolute inset-0 z-0 bg-slate-950/55 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        id="mobile-navigation"
        aria-label="モバイルメニュー"
        className={`absolute inset-y-0 left-0 z-10 flex w-[min(82vw,304px)] flex-col bg-[#101b36] px-4 py-5 text-white opacity-100 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-950/30">
              <BarChart3 size={21} strokeWidth={2.3} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-wide">営業実績管理</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Sales Performance</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="メニューを閉じる"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => setIsOpen(false)}
            className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-500">MAIN MENU</p>
        <nav className="space-y-1" aria-label="モバイルメインメニュー">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.name}
                disabled={!item.available}
                onClick={item.available ? () => setIsOpen(false) : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  item.available
                    ? "bg-blue-500 text-white shadow-md shadow-blue-950/20"
                    : "cursor-not-allowed text-slate-500"
                }`}
                aria-current={item.available ? "page" : undefined}
                tabIndex={isOpen ? 0 : -1}
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
          <button
            type="button"
            disabled
            tabIndex={isOpen ? 0 : -1}
            className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-500"
          >
            <HelpCircle size={18} aria-hidden="true" />
            <span className="flex-1">ヘルプ・サポート</span>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-semibold text-slate-500">準備中</span>
          </button>
        </div>
      </aside>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="メニューを開く"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen(true)}
        className="flex size-10 items-center justify-center rounded-xl bg-[#101b36] text-white transition hover:bg-[#182746]"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {isMounted && createPortal(drawer, document.body)}
    </div>
  );
}
