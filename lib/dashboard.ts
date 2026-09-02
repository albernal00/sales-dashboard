import type {
  DashboardKpis,
  Reward,
  Staff,
  StaffListRow,
  StaffRankingRow,
  StoreDetail,
  StoreListRow,
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
  const expectedSales = rewards.reduce(
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
    expectedSales,
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
  targetMonth: string
): StoreDetail[] {
  const staffNames = new Map(staff.map((person) => [person.id, person.name]));

  return stores.map((store, index) => ({
      key: `store-${index + 1}`,
      name: store.name,
      target: store.target,
      actual: store.actual,
      staffName: staffNames.get(store.staffId) ?? "未設定",
      remaining: calculateRemaining(store.actual, store.target),
      progress: calculateProgress(store.actual, store.target),
      targetMonth,
  }));
}

export function createStoreListRows(
  stores: StorePerformance[],
  staff: Staff[],
  targetDataAvailable: boolean
): StoreListRow[] {
  const progressRows = createStoreProgressRows(stores, staff);

  return progressRows.map((row) => {
    const goalStatus = !targetDataAvailable
      ? "unregistered"
      : row.target === 0
        ? "zero"
        : row.actual >= row.target
          ? "achieved"
          : "inProgress";

    return {
      ...row,
      goalStatus,
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
      sales: rewardTotals.get(person.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || b.sales - a.sales);
}

export function createStaffListRows(
  staff: Staff[],
  stores: StorePerformance[],
  rewards: Reward[],
  targetDataAvailable: boolean
): StaffListRow[] {
  const rewardTotals = rewards.reduce<Map<string, number>>((totals, reward) => {
    if (!reward.staffId) return totals;
    totals.set(reward.staffId, (totals.get(reward.staffId) ?? 0) + reward.amount);
    return totals;
  }, new Map());

  return staff.map((person, index) => {
    const assignedStores = stores.filter((store) => store.staffId === person.id);
    const target = assignedStores.reduce((sum, store) => sum + store.target, 0);
    const actual = assignedStores.reduce((sum, store) => sum + store.actual, 0);

    return {
      key: `staff-${index + 1}`,
      name: person.name,
      storeCount: assignedStores.length,
      storeNames: assignedStores.map((store) => store.name),
      target,
      actual,
      remaining: calculateRemaining(actual, target),
      progress: calculateProgress(actual, target),
      personalActual: person.personalActual,
      expectedSales: rewardTotals.get(person.id) ?? 0,
      targetRegistered: targetDataAvailable,
    };
  });
}
