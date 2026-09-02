import type { Reward } from "@/types/dashboard";

type RewardSeed = Omit<Reward, "id" | "applicationKey" | "status">;

const rewardSeeds: RewardSeed[] = [
  { staffId: "staff-001", storeId: "store-001", priceKey: "PLAN-A", amount: 45000, applicationDate: "2026-09-30", constructionDate: "2026-10-08" },
  { staffId: "staff-001", storeId: "store-001", priceKey: "PLAN-B", amount: 20000, applicationDate: "2026-09-28", constructionDateNote: "日程調整中" },
  { staffId: "staff-001", storeId: "store-001", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-26", constructionDate: "2026-10-04" },
  { staffId: "staff-001", storeId: "store-001", priceKey: "PLAN-C", amount: 20000, applicationDate: "2026-09-24", constructionDateNote: "未定" },
  { staffId: "staff-001", storeId: "store-002", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-22", constructionDate: "2026-10-02" },
  { staffId: "staff-001", storeId: "store-002", priceKey: "PLAN-B", amount: 20000, applicationDate: "2026-09-20", constructionDateNote: "連絡待ち" },
  { staffId: "staff-001", storeId: "store-002", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-18", constructionDate: "2026-09-29" },
  { staffId: "staff-001", storeId: "store-003", priceKey: "PLAN-C", amount: 20000, applicationDate: "2026-09-16", constructionDateNote: "確認中" },
  { staffId: "staff-001", storeId: "store-003", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-14", constructionDate: "2026-09-27" },
  { staffId: "staff-001", storeId: "store-003", priceKey: "PLAN-B", amount: 20000, applicationDate: "2026-09-12", constructionDateNote: "日程調整中" },
  { staffId: "staff-001", storeId: "store-003", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-10", constructionDate: "2026-09-25" },
  { staffId: "staff-001", storeId: "store-003", priceKey: "PLAN-C", amount: 20000, applicationDate: "2026-09-08", constructionDateNote: "未定" },
  { staffId: "staff-001", storeId: "store-003", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-06", constructionDate: "2026-09-22" },
  { staffId: "staff-002", storeId: "store-004", priceKey: "PLAN-A", amount: 24000, applicationDate: "2026-09-29", constructionDate: "2026-10-07" },
  { staffId: "staff-002", storeId: "store-005", priceKey: "PLAN-B", amount: 20000, applicationDate: "2026-09-25", constructionDateNote: "日程調整中" },
  { staffId: "staff-002", storeId: "store-005", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-21", constructionDate: "2026-10-01" },
  { staffId: "staff-002", storeId: "store-005", priceKey: "PLAN-C", amount: 20000, applicationDate: "2026-09-17", constructionDateNote: "連絡待ち" },
  { staffId: "staff-002", storeId: "store-005", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-13", constructionDate: "2026-09-28" },
  { staffId: "staff-002", storeId: "store-005", priceKey: "PLAN-B", amount: 20000, applicationDate: "2026-09-09", constructionDateNote: "確認中" },
  { staffId: "staff-002", storeId: "store-005", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-05", constructionDate: "2026-09-20" },
  { staffId: "staff-002", storeId: "store-005", priceKey: "PLAN-C", amount: 20000, applicationDate: "2026-09-02", constructionDateNote: "未定" },
  { staffId: "staff-003", storeId: "store-005", priceKey: "PLAN-A", amount: 22000, applicationDate: "2026-09-27", constructionDate: "2026-10-06" },
  { staffId: "staff-003", storeId: "store-005", priceKey: "PLAN-B", amount: 20000, applicationDate: "2026-09-19", constructionDateNote: "日程調整中" },
  { staffId: "staff-003", storeId: "store-005", priceKey: "PLAN-A", amount: 20000, applicationDate: "2026-09-11", constructionDate: "2026-09-26" },
  { staffId: "staff-003", storeId: "store-005", priceKey: "PLAN-C", amount: 20000, applicationDate: "2026-09-03", constructionDateNote: "未定" },
  { staffId: "staff-004", storeId: "store-005", priceKey: "PLAN-A", amount: 21000, applicationDate: "2026-09-23", constructionDate: "2026-10-03" },
  { staffId: "staff-004", storeId: "store-005", priceKey: "PLAN-B", amount: 20000, applicationDate: "2026-09-07", constructionDateNote: "日程調整中" },
];

export const rewards: Reward[] = rewardSeeds.map((reward, index) => ({
  id: `reward-${String(index + 1).padStart(3, "0")}`,
  applicationKey: `demo-hash-${String(index + 1).padStart(3, "0")}`,
  status: index % 2 === 0 ? "confirmed" : "pending",
  ...reward,
}));
