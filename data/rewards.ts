import type { Reward } from "@/types/dashboard";

export const rewards: Reward[] = [
  { id: "reward-001", applicationKey: "demo-001", staffId: "staff-001", storeId: "store-001", priceKey: "PLAN-A", amount: 185000, status: "confirmed" },
  { id: "reward-002", applicationKey: "demo-002", staffId: "staff-001", storeId: "store-001", priceKey: "PLAN-B", amount: 100000, status: "pending" },
  { id: "reward-003", applicationKey: "demo-003", staffId: "staff-002", storeId: "store-002", priceKey: "PLAN-A", amount: 123000, status: "confirmed" },
  { id: "reward-004", applicationKey: "demo-004", staffId: "staff-002", storeId: "store-002", priceKey: "PLAN-B", amount: 41000, status: "pending" },
  { id: "reward-005", applicationKey: "demo-005", staffId: "staff-003", storeId: "store-003", priceKey: "PLAN-A", amount: 82000, status: "confirmed" },
  { id: "reward-006", applicationKey: "demo-006", staffId: "staff-004", storeId: "store-004", priceKey: "PLAN-B", amount: 41000, status: "pending" },
];
