import type {
  DashboardKpis,
  Reward,
  Staff,
  StaffRankingRow,
  StorePerformance,
  StoreProgressRow,
} from "@/types/dashboard";

export function calculateProgress(actual: number, target: number): number {
  if (target <= 0) {
    return 0;
  }

  return Math.min(Math.max((actual / target) * 100, 0), 100);
}

export function calculateRemaining(actual: number, target: number): number {
  return Math.max(target - actual, 0);
}

export function calculateDashboardKpis(
  stores: StorePerformance[],
  rewards: Reward[]
): DashboardKpis {
  const actual = stores.reduce((sum, store) => sum + store.actual, 0);
  const target = stores.reduce((sum, store) => sum + store.target, 0);
  const previousActual = stores.reduce(
    (sum, store) => sum + store.previousActual,
    0
  );
  const expectedReward = rewards.reduce(
    (sum, reward) =>
      reward.status === "confirmed" || reward.status === "pending"
        ? sum + reward.amount
        : sum,
    0
  );

  return {
    actual,
    target,
    remaining: calculateRemaining(actual, target),
    achievementRate: calculateProgress(actual, target),
    previousMonthDifference: actual - previousActual,
    expectedReward,
  };
}

export function createStoreProgressRows(
  stores: StorePerformance[],
  staff: Staff[]
): StoreProgressRow[] {
  const staffNames = new Map(staff.map((person) => [person.id, person.name]));

  return stores.map((store) => ({
    ...store,
    staffName: staffNames.get(store.staffId) ?? "未設定",
    remaining: calculateRemaining(store.actual, store.target),
    progress: calculateProgress(store.actual, store.target),
  }));
}

export function createStaffRanking(
  staff: Staff[],
  rewards: Reward[]
): StaffRankingRow[] {
  const rewardTotals = rewards.reduce<Map<string, number>>((totals, reward) => {
    totals.set(reward.staffId, (totals.get(reward.staffId) ?? 0) + reward.amount);
    return totals;
  }, new Map());

  return staff
    .map((person) => ({
      ...person,
      count: person.personalActual,
      reward: rewardTotals.get(person.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || b.reward - a.reward);
}
