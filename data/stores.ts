import type { StorePerformance } from "@/types/dashboard";

export const stores: StorePerformance[] = [
  {
    id: "store-001",
    name: "デモ中央店",
    target: 6,
    actual: 4,
    previousActual: 1,
    staffId: "staff-001",
  },
  {
    id: "store-002",
    name: "デモ東店",
    target: 5,
    actual: 3,
    previousActual: 1,
    staffId: "staff-001",
  },
  {
    id: "store-003",
    name: "デモ西店",
    target: 10,
    actual: 6,
    previousActual: 2,
    staffId: "staff-001",
  },
  {
    id: "store-004",
    name: "デモ南店",
    target: 5,
    actual: 1,
    previousActual: 1,
    staffId: "staff-002",
  },
  {
    id: "store-005",
    name: "デモ北店",
    target: 15,
    actual: 13,
    previousActual: 4,
    staffId: "staff-002",
  },
];
