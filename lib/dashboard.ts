import type {
  DashboardKpis,
  Reward,
  Staff,
  StaffDetail,
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
      staffId: person.id,
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

function normalizeConstructionSchedule(
  constructionDate?: string,
  constructionDateNote?: string
): string {
  const date = constructionDate?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (date) return date;

  const note = constructionDateNote?.trim() ?? "";
  if (/工事不要/.test(note)) return "工事不要";
  if (/未定/.test(note)) return "日程未定";
  if (/調整/.test(note)) return "日程調整中";
  if (/連絡待ち/.test(note)) return "連絡待ち";
  if (/確認/.test(note)) return "日程確認中";
  return "日程未定";
}

function shortenCaseNumber(applicationKey: string, index: number): string {
  if (/^(reward-row-|reward-total)/.test(applicationKey)) {
    return `案件${String(index + 1).padStart(3, "0")}`;
  }

  const safeHash = applicationKey.replace(/[^a-z0-9]/gi, "");
  return safeHash ? `#${safeHash.slice(0, 8).toUpperCase()}` : `案件${index + 1}`;
}

export function createStaffDetail(
  staffId: string,
  staff: Staff[],
  stores: StorePerformance[],
  rewards: Reward[],
  targetMonth: string,
  targetDataAvailable: boolean
): StaffDetail | undefined {
  const person = staff.find((candidate) => candidate.id === staffId);
  if (!person) return undefined;

  const summary = createStaffListRows(
    [person],
    stores,
    rewards,
    targetDataAvailable
  )[0];
  const storeNames = new Map(stores.map((store) => [store.id, store.name]));
  const groupedCases = new Map<
    string,
    {
      applicationDate?: string;
      storeId?: string;
      productNames: Set<string>;
      expectedSales: number;
      constructionDate?: string;
      constructionDateNote?: string;
    }
  >();

  for (const reward of rewards) {
    if (reward.staffId !== staffId) continue;
    if (
      reward.applicationDate &&
      /^\d{4}-\d{2}/.test(reward.applicationDate) &&
      !reward.applicationDate.startsWith(targetMonth)
    ) {
      continue;
    }

    const group = groupedCases.get(reward.applicationKey) ?? {
      applicationDate: reward.applicationDate,
      storeId: reward.storeId,
      productNames: new Set<string>(),
      expectedSales: 0,
      constructionDate: reward.constructionDate,
      constructionDateNote: reward.constructionDateNote,
    };
    if (reward.priceKey) group.productNames.add(reward.priceKey);
    group.expectedSales += reward.amount;
    groupedCases.set(reward.applicationKey, group);
  }

  const cases = Array.from(groupedCases, ([applicationKey, group], index) => ({
    key: `case-${index + 1}`,
    caseNumber: shortenCaseNumber(applicationKey, index),
    applicationDate: group.applicationDate?.match(/^\d{4}-\d{2}-\d{2}/)?.[0],
    storeName: group.storeId
      ? (storeNames.get(group.storeId) ?? "店舗不明")
      : "店舗不明",
    productName:
      group.productNames.size > 0
        ? Array.from(group.productNames).join(" / ")
        : "商品未設定",
    expectedSales: group.expectedSales,
    constructionSchedule: normalizeConstructionSchedule(
      group.constructionDate,
      group.constructionDateNote
    ),
  }));

  return {
    ...summary,
    expectedSales: cases.reduce((sum, item) => sum + item.expectedSales, 0),
    targetMonth,
    cases,
  };
}
