export type Staff = {
  id: string;
  name: string;
};

export type StorePerformance = {
  id: string;
  name: string;
  target: number;
  actual: number;
  previousActual: number;
  staffId: string;
};

export type StaffPerformance = {
  staffId: string;
  count: number;
};

export type RewardStatus = "confirmed" | "pending";

export type Reward = {
  id: string;
  staffId: string;
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

export type StoreProgressRow = StorePerformance & {
  staffName: string;
  remaining: number;
  progress: number;
};

export type StaffRankingRow = Staff & {
  count: number;
  reward: number;
};
