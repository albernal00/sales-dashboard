import type {
  DashboardKpis,
  Reward,
  Staff,
  StaffRankingRow,
  StoreDetail,
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

  return stores.map((store, index) => ({
    key: `store-${index + 1}`,
    name: store.name,
    target: store.target,
    actual: store.actual,
    staffName: staffNames.get(store.staffId) ?? "未設定",
    remaining: calculateRemaining(store.actual, store.target),
    progress: calculateProgress(store.actual, store.target),
  }));
}

export function createStoreDetails(
  stores: StorePerformance[],
  staff: Staff[],
  rewards: Reward[],
  targetMonth: string
): StoreDetail[] {
  const staffNames = new Map(staff.map((person) => [person.id, person.name]));

  return stores.map((store, index) => {
    const storeRewards = rewards.filter(
      (reward) => reward.storeId === store.id
    );
    const productGroups = new Map<
      string,
      { applications: Set<string>; expectedReward: number }
    >();

    for (const reward of storeRewards) {
      const priceKey = reward.priceKey ?? "未設定";
      const group = productGroups.get(priceKey) ?? {
        applications: new Set<string>(),
        expectedReward: 0,
      };
      group.applications.add(reward.applicationKey);
      group.expectedReward += reward.amount;
      productGroups.set(priceKey, group);
    }

    const products = Array.from(productGroups, ([priceKey, group]) => ({
      priceKey,
      count: group.applications.size,
      expectedReward: group.expectedReward,
    })).sort((a, b) => b.count - a.count || a.priceKey.localeCompare(b.priceKey));

    return {
      key: `store-${index + 1}`,
      name: store.name,
      target: store.target,
      actual: store.actual,
      staffName: staffNames.get(store.staffId) ?? "未設定",
      remaining: calculateRemaining(store.actual, store.target),
      progress: calculateProgress(store.actual, store.target),
      targetMonth,
      expectedReward: storeRewards.reduce(
        (sum, reward) => sum + reward.amount,
        0
      ),
      products,
    };
  });
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
