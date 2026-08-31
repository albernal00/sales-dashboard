import type { Staff, StaffPerformance } from "@/types/dashboard";

export const staff: Staff[] = [
  { id: "staff-001", name: "担当者A" },
  { id: "staff-002", name: "担当者B" },
  { id: "staff-003", name: "担当者C" },
  { id: "staff-004", name: "担当者D" },
];

export const staffPerformances: StaffPerformance[] = [
  { staffId: "staff-001", count: 13 },
  { staffId: "staff-002", count: 8 },
  { staffId: "staff-003", count: 4 },
  { staffId: "staff-004", count: 2 },
];
