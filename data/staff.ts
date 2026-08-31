import type { Staff, StaffPerformance } from "@/types/dashboard";

export const staff: Staff[] = [
  { id: "tsuchida", name: "土田" },
  { id: "omori", name: "大森" },
  { id: "tanaka", name: "田中" },
  { id: "yamada", name: "山田" },
];

export const staffPerformances: StaffPerformance[] = [
  { staffId: "tsuchida", count: 13 },
  { staffId: "omori", count: 8 },
  { staffId: "tanaka", count: 4 },
  { staffId: "yamada", count: 2 },
];
