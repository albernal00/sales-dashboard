import type {
  Appointment,
  AppointmentRow,
  AppointmentSummary,
  DashboardKpis,
  Reward,
  SafeCase,
  Staff,
  StaffDetail,
  StaffListRow,
  StaffRankingRow,
  StoreDetail,
  StoreListRow,
  StoreRecordDetail,
  StorePerformance,
  StoreProgressRow,
} from "@/types/dashboard";

export function isProspectAppointment(appointment: Appointment): boolean {
  return appointment.status === "商談未完了";
}

function isCompletedAppointment(appointment: Appointment): boolean {
  return appointment.status === "商談完了";
}

function isAppointmentInMonth(
  appointment: Appointment,
  targetMonth: string
): boolean {
  return (
    !appointment.scheduledDate ||
    appointment.scheduledDate.startsWith(targetMonth)
  );
}

export function createAppointmentRows(
  appointments: Appointment[],
  staff: Staff[],
  stores: StorePerformance[],
  targetMonth: string
): AppointmentRow[] {
  const staffNames = new Map(staff.map((person) => [person.id, person.name]));
  const storeNames = new Map(stores.map((store) => [store.id, store.name]));

  return appointments
    .filter(
      (appointment) =>
        isAppointmentInMonth(appointment, targetMonth) &&
        !isCompletedAppointment(appointment)
    )
    .map((appointment, index) => ({
      key: `appointment-${index + 1}`,
      scheduledDate: appointment.scheduledDate?.match(/^\d{4}-\d{2}-\d{2}/)?.[0],
      staffName: staffNames.get(appointment.staffId) ?? "担当者不明",
      storeName: storeNames.get(appointment.storeId) ?? "店舗不明",
      locationType: appointment.locationType ?? "場所未設定",
      status: appointment.status,
      isProspect: isProspectAppointment(appointment),
    }));
}

export function calculateAppointmentSummary(
  rows: AppointmentRow[],
  today: string
): AppointmentSummary {
  const prospects = rows.filter((row) => row.isProspect);
  return {
    prospectCount: prospects.length,
    upcomingCount: prospects.filter(
      (row) => row.scheduledDate && row.scheduledDate >= today
    ).length,
    staffCount: new Set(prospects.map((row) => row.staffName)).size,
    storeCount: new Set(prospects.map((row) => row.storeName)).size,
  };
}

function countProspectsBy(
  appointments: Appointment[],
  targetMonth: string,
  getId: (appointment: Appointment) => string
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const appointment of appointments) {
    if (
      !isProspectAppointment(appointment) ||
      !isAppointmentInMonth(appointment, targetMonth)
    ) {
      continue;
    }
    const id = getId(appointment);
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

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
  appointments: Appointment[],
  targetMonth: string,
  targetDataAvailable: boolean
): StoreListRow[] {
  const progressRows = createStoreProgressRows(stores, staff);
  const prospectCounts = countProspectsBy(
    appointments,
    targetMonth,
    (appointment) => appointment.storeId
  );

  return progressRows.map((row, index) => {
    const goalStatus = !targetDataAvailable
      ? "unregistered"
      : row.target === 0
        ? "zero"
        : row.actual >= row.target
          ? "achieved"
          : "inProgress";

    return {
      ...row,
      storeId: stores[index].id,
      goalStatus,
      prospectCount: prospectCounts.get(stores[index].id) ?? 0,
    };
  });
}

export function createStoreRecordDetail(
  storeId: string,
  stores: StorePerformance[],
  staff: Staff[],
  casesData: SafeCase[],
  appointments: Appointment[],
  targetMonth: string,
  targetDataAvailable: boolean
): StoreRecordDetail | undefined {
  const storeIndex = stores.findIndex((candidate) => candidate.id === storeId);
  if (storeIndex < 0) return undefined;

  const summary = createStoreListRows(
    [stores[storeIndex]],
    staff,
    appointments,
    targetMonth,
    targetDataAvailable
  )[0];
  const staffNames = new Map(staff.map((person) => [person.id, person.name]));
  const cases = casesData
    .filter((item) =>
      item.storeId === storeId && item.applicationDate.startsWith(targetMonth)
    )
    .map((item, index) => ({
    key: `case-${index + 1}`,
    caseNumber: shortenCaseNumber(item.id, index),
    applicationDate: item.applicationDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0],
    acquiredStaffName: staffNames.get(item.staffId) ?? "担当者不明",
    productName: item.productName,
    constructionSchedule: normalizeConstructionSchedule(
      item.constructionDate,
      item.constructionDateNote
    ),
  }));
  const caseCountMatches = cases.length === summary.actual;

  if (!caseCountMatches) {
    console.warn("[dashboard] store case count mismatch", {
      actualCount: summary.actual,
      caseCount: cases.length,
    });
  }

  return {
    ...summary,
    targetMonth,
    cases,
    caseCountMatches,
    appointments: createAppointmentRows(
      appointments.filter((appointment) => appointment.storeId === storeId),
      staff,
      stores,
      targetMonth
    ),
  };
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
  appointments: Appointment[],
  targetMonth: string,
  targetDataAvailable: boolean
): StaffListRow[] {
  const rewardTotals = rewards.reduce<Map<string, number>>((totals, reward) => {
    if (!reward.staffId) return totals;
    totals.set(reward.staffId, (totals.get(reward.staffId) ?? 0) + reward.amount);
    return totals;
  }, new Map());
  const prospectCounts = countProspectsBy(
    appointments,
    targetMonth,
    (appointment) => appointment.staffId
  );

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
      prospectCount: prospectCounts.get(person.id) ?? 0,
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
  casesData: SafeCase[],
  appointments: Appointment[],
  targetMonth: string,
  targetDataAvailable: boolean
): StaffDetail | undefined {
  const person = staff.find((candidate) => candidate.id === staffId);
  if (!person) return undefined;

  const summary = createStaffListRows(
    [person],
    stores,
    rewards,
    appointments,
    targetMonth,
    targetDataAvailable
  )[0];
  const storeNames = new Map(stores.map((store) => [store.id, store.name]));
  const cases = casesData
    .filter((item) =>
      item.staffId === staffId && item.applicationDate.startsWith(targetMonth)
    )
    .map((item, index) => ({
    key: `case-${index + 1}`,
    caseNumber: shortenCaseNumber(item.id, index),
    applicationDate: item.applicationDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0],
    storeName: storeNames.get(item.storeId) ?? "店舗不明",
    productName: item.productName,
    expectedSales: item.estimatedSales,
    constructionSchedule: normalizeConstructionSchedule(
      item.constructionDate,
      item.constructionDateNote
    ),
  }));

  const caseCountMatches = cases.length === person.personalActual;
  const caseSalesTotal = cases.reduce(
    (sum, item) => sum + (item.expectedSales ?? 0),
    0
  );
  const salesTotalMatches =
    cases.every((item) => item.expectedSales !== null) &&
    caseSalesTotal === summary.expectedSales;

  if (!caseCountMatches || !salesTotalMatches) {
    console.warn("[dashboard] staff case reconciliation mismatch", {
      personalActual: person.personalActual,
      caseCount: cases.length,
      rewardSalesTotal: summary.expectedSales,
      caseSalesTotal,
      hasUnsetSales: cases.some((item) => item.expectedSales === null),
    });
  }

  return {
    ...summary,
    targetMonth,
    cases,
    caseCountMatches,
    salesTotalMatches,
    appointments: createAppointmentRows(
      appointments.filter((appointment) => appointment.staffId === staffId),
      staff,
      stores,
      targetMonth
    ),
  };
}
