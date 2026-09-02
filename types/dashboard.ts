export type Staff = {
  id: string;
  name: string;
  personalActual: number;
};

export type StorePerformance = {
  id: string;
  name: string;
  target: number;
  actual: number;
  previousActual: number;
  staffId: string;
};

export type RewardStatus = "confirmed" | "pending";

export type Reward = {
  id: string;
  applicationKey: string;
  staffId: string;
  storeId?: string;
  priceKey?: string;
  applicationDate?: string;
  constructionDate?: string;
  constructionDateNote?: string;
  amount: number;
  status: RewardStatus;
};

export type DashboardKpis = {
  actual: number;
  target: number;
  remaining: number;
  achievementRate: number;
  previousMonthDifference: number;
  expectedSales: number;
};

export type StoreProgressRow = {
  key: string;
  name: string;
  target: number;
  actual: number;
  staffName: string;
  remaining: number;
  progress: number;
};

export type StoreDetail = StoreProgressRow & {
  targetMonth: string;
};

export type StoreGoalStatus = "achieved" | "inProgress" | "zero" | "unregistered";

export type StoreListRow = StoreProgressRow & {
  goalStatus: StoreGoalStatus;
};

export type StaffListRow = {
  staffId: string;
  key: string;
  name: string;
  storeCount: number;
  storeNames: string[];
  target: number;
  actual: number;
  remaining: number;
  progress: number;
  personalActual: number;
  expectedSales: number;
  targetRegistered: boolean;
};

export type StaffCaseRow = {
  key: string;
  caseNumber: string;
  applicationDate?: string;
  storeName: string;
  productName: string;
  expectedSales: number;
  constructionSchedule: string;
};

export type StaffDetail = StaffListRow & {
  targetMonth: string;
  cases: StaffCaseRow[];
};

export type StaffRankingRow = Staff & {
  count: number;
  sales: number;
};

export type GasDashboardStatus = "ok" | "success" | "warning";

export type GasDashboardResponse = {
  status: GasDashboardStatus;
  targetMonth: string;
  stores: unknown[];
  staff: unknown[];
  rewards: unknown[] | Record<string, unknown>;
  warnings: unknown[];
  sourceHealth: unknown;
  updatedAt: string;
};

export type DashboardData = {
  status: GasDashboardStatus;
  targetMonth: string;
  stores: StorePerformance[];
  staff: Staff[];
  rewards: Reward[];
  warnings: string[];
  sourceHealth: unknown;
  updatedAt: string;
  isFallback: boolean;
  targetDataAvailable: boolean;
};
