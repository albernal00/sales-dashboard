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
  amount: number;
  status: RewardStatus;
};

export type DashboardKpis = {
  actual: number;
  target: number;
  remaining: number;
  achievementRate: number;
  previousMonthDifference: number;
  expectedReward: number;
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

export type ProductRewardBreakdown = {
  priceKey: string;
  count: number;
  expectedReward: number;
};

export type StoreDetail = StoreProgressRow & {
  targetMonth: string;
  expectedReward: number;
  products: ProductRewardBreakdown[];
};

export type StoreGoalStatus = "achieved" | "inProgress" | "zero" | "unregistered";

export type StoreListRow = StoreProgressRow & {
  expectedReward: number;
  goalStatus: StoreGoalStatus;
};

export type StaffListRow = {
  key: string;
  name: string;
  storeCount: number;
  storeNames: string[];
  target: number;
  actual: number;
  remaining: number;
  progress: number;
  personalActual: number;
  expectedReward: number;
  targetRegistered: boolean;
};

export type StaffRankingRow = Staff & {
  count: number;
  reward: number;
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
