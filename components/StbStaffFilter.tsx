"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type StaffOption = { id: string; name: string };

export default function StbStaffFilter({
  targetMonth,
  selectedStaffId,
  staff,
}: {
  targetMonth: string;
  selectedStaffId: string | null;
  staff: StaffOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeStaff = (staffId: string) => {
    startTransition(() => {
      const params = new URLSearchParams({ month: targetMonth });
      if (staffId) params.set("staff", staffId);
      router.push(`/stb?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
      <span>担当者別表示</span>
      <select
        value={selectedStaffId ?? ""}
        disabled={isPending}
        onChange={(event) => changeStaff(event.target.value)}
        className="h-10 min-w-40 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100 disabled:cursor-wait"
      >
        <option value="">全担当者</option>
        {staff.map((person) => (
          <option key={person.id} value={person.id}>{person.name}</option>
        ))}
      </select>
    </label>
  );
}
