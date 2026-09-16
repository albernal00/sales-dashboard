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

export type SafeCase = {
  id: string;
  storeId: string;
  staffId: string;
  applicationDate: string;
  productName: string;
  constructionDate?: string;
  constructionDateNote?: string;
  estimatedSales: number | null;
};

export type Appointment = {
  id: string;
  staffId: string;
  storeId: string;
  scheduledDate?: string;
  status: string;
  locationType?: string;
};

export type StbCheckCandidate = {
  id: string;
  customerId: string | null;
  storeId: string | null;
  staffId: string | null;
  applicationDate: string | null;
  constructionDate: string | null;
  dueDate?: string;
  milestoneMonths?: 2 | 12;
};

export type StbDashboard = {
  applicationCount: number;
  stbApplicationCount: number;
  attachmentRate: number;
  byStaff: StbStaffSummary[] | null;
  twoMonthChecks: StbCheckCandidate[];
  twelveMonthChecks: StbCheckCandidate[];
  dateNeedsReview: StbCheckCandidate[];
};

export type StbStaffSummary = {
  staffId: string;
  applicationCount: number;
  stbApplicationCount: number;
};

export type AppointmentRow = {
  key: string;
  scheduledDate?: string;
  staffName: string;
  storeName: string;
  locationType: string;
  status: string;
  isProspect: boolean;
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
  storeId: string;
  goalStatus: StoreGoalStatus;
  prospectCount: number;
};

export type StoreCaseRow = {
  key: string;
  caseNumber: string;
  applicationDate?: string;
  acquiredStaffName: string;
  productName: string;
  constructionSchedule: string;
};

export type StoreRecordDetail = StoreListRow & {
  targetMonth: string;
  cases: StoreCaseRow[];
  caseCountMatches: boolean;
  appointments: AppointmentRow[];
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
  prospectCount: number;
  targetRegistered: boolean;
};

export type StaffTableRow = Pick<
  StaffListRow,
  "staffId" | "key" | "name" | "personalActual" | "prospectCount"
> & Partial<Omit<StaffListRow, "staffId" | "key" | "name" | "personalActual" | "prospectCount">> & {
  stbAttachmentCount: number | null;
  stbAttachmentRate: number | null;
};

export type StaffCaseRow = {
  key: string;
  caseNumber: string;
  applicationDate?: string;
  storeName: string;
  productName: string;
  expectedSales?: number | null;
  constructionSchedule: string;
};

export type StaffDetail = StaffListRow & {
  targetMonth: string;
  cases: StaffCaseRow[];
  caseCountMatches: boolean;
  salesTotalMatches: boolean;
  appointments: AppointmentRow[];
};

export type AppointmentSummary = {
  prospectCount: number;
  upcomingCount: number;
  staffCount: number;
  storeCount: number;
};

export type StaffRankingRow = Staff & {
  count: number;
  sales?: number;
};

export type GasDashboardStatus = "ok" | "success" | "warning";

export type GasDashboardResponse = {
  status: GasDashboardStatus;
  targetMonth: string;
  stores: unknown[];
  staff: unknown[];
  rewards: unknown[] | Record<string, unknown>;
  cases: unknown;
  appointments?: unknown;
  stb?: unknown;
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
  cases: SafeCase[];
  appointments: Appointment[];
  stb: StbDashboard | null;
  warnings: string[];
  sourceHealth: unknown;
  updatedAt: string;
  isFallback: boolean;
  targetDataAvailable: boolean;
};
