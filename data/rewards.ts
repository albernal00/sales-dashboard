import type { Reward } from "@/types/dashboard";

export const rewards: Reward[] = [
  { id: "reward-001", staffId: "tsuchida", amount: 185000, status: "confirmed" },
  { id: "reward-002", staffId: "tsuchida", amount: 100000, status: "pending" },
  { id: "reward-003", staffId: "omori", amount: 123000, status: "confirmed" },
  { id: "reward-004", staffId: "omori", amount: 41000, status: "pending" },
  { id: "reward-005", staffId: "tanaka", amount: 82000, status: "confirmed" },
  { id: "reward-006", staffId: "yamada", amount: 41000, status: "pending" },
];
