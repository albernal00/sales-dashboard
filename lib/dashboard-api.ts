import "server-only";

import { rewards as fallbackRewards } from "@/data/rewards";
import { staff as fallbackStaff } from "@/data/staff";
import { stores as fallbackStores } from "@/data/stores";
import type {
  DashboardData,
  GasDashboardResponse,
  Reward,
  Staff,
  StorePerformance,
} from "@/types/dashboard";

const TARGET_MONTH = "2026-09";
const REVALIDATE_SECONDS = 300;
const FALLBACK_UPDATED_AT = "2026-08-31T17:50:00+09:00";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(record: UnknownRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
}

function getNumber(record: UnknownRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) return number;
  }
}

function normalizeStores(value: unknown): StorePerformance[] {
  if (!Array.isArray(value)) throw new Error("Invalid stores");

  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];

    const name = getString(item, ["name", "storeName"]);
    const target = getNumber(item, ["target"]);
    const actual = getNumber(item, ["actual"]);
    if (!name || target === undefined || actual === undefined) {
      return [];
    }

    return [{
      id: getString(item, ["id", "storeId", "customerId"]) ?? `store-${index + 1}`,
      name,
      target,
      actual,
      previousActual: getNumber(item, ["previousActual"]) ?? 0,
      staffId: getString(item, ["staffId", "assignedStaffId"]) ?? "",
    }];
  });
}

function normalizeStaff(value: unknown): Staff[] {
  if (!Array.isArray(value)) throw new Error("Invalid staff");

  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];

    const name = getString(item, ["name", "staffName"]);
    const personalActual = getNumber(item, ["personalActual"]);
    if (!name || personalActual === undefined) {
      return [];
    }

    return [{
      id: getString(item, ["id", "staffId"]) ?? `staff-${index + 1}`,
      name,
      personalActual,
    }];
  });
}

function normalizeRewardEntries(value: unknown): Reward[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];

    const staffId = getString(item, ["staffId"]) ?? "";
    const amount = getNumber(item, ["amount"]);
    const status = getString(item, ["status"]);
    if (amount !== undefined && (status === "confirmed" || status === "pending")) {
      return [{
        id: getString(item, ["id"]) ?? `reward-${index + 1}`,
        staffId,
        amount,
        status,
      }];
    }

    const confirmed = getNumber(item, ["confirmed"]) ?? 0;
    const pending = getNumber(item, ["pending"]) ?? 0;
    const result: Reward[] = [];

    if (confirmed !== 0) {
      result.push({
        id: `reward-${index + 1}-confirmed`,
        staffId,
        amount: confirmed,
        status: "confirmed",
      });
    }
    if (pending !== 0) {
      result.push({
        id: `reward-${index + 1}-pending`,
        staffId,
        amount: pending,
        status: "pending",
      });
    }

    return result;
  });
}

function normalizeRewards(value: unknown): Reward[] {
  const entries = normalizeRewardEntries(value);
  if (entries.length > 0 || Array.isArray(value)) return entries;
  if (!isRecord(value)) throw new Error("Invalid rewards");

  const byStaff = normalizeRewardEntries(value.byStaff);
  if (byStaff.length > 0) return byStaff;

  return [
    {
      id: "reward-total-confirmed",
      staffId: "",
      amount: getNumber(value, ["confirmed"]) ?? 0,
      status: "confirmed",
    },
    {
      id: "reward-total-pending",
      staffId: "",
      amount: getNumber(value, ["pending"]) ?? 0,
      status: "pending",
    },
  ];
}

function normalizeResponse(value: unknown): DashboardData {
  if (!isRecord(value)) throw new Error("Invalid response");

  const response = value as Partial<GasDashboardResponse>;
  if (response.status !== "success" && response.status !== "warning") {
    throw new Error("API status is not usable");
  }

  return {
    status: response.status,
    targetMonth:
      typeof response.targetMonth === "string" ? response.targetMonth : TARGET_MONTH,
    stores: normalizeStores(response.stores),
    staff: normalizeStaff(response.staff),
    rewards: normalizeRewards(response.rewards),
    warnings: Array.isArray(response.warnings)
      ? response.warnings.filter((warning): warning is string => typeof warning === "string")
      : [],
    sourceHealth: response.sourceHealth,
    updatedAt: typeof response.updatedAt === "string" ? response.updatedAt : "",
    isFallback: false,
  };
}

function getFallbackData(): DashboardData {
  return {
    status: "warning",
    targetMonth: TARGET_MONTH,
    stores: fallbackStores,
    staff: fallbackStaff,
    rewards: fallbackRewards,
    warnings: ["GAS APIからデータを取得できませんでした。"],
    sourceHealth: null,
    updatedAt: FALLBACK_UPDATED_AT,
    isFallback: true,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const apiUrl = process.env.GAS_DASHBOARD_API_URL;
  if (!apiUrl) return getFallbackData();

  try {
    const url = new URL(apiUrl);
    url.searchParams.set("month", TARGET_MONTH);

    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) throw new Error("GAS request failed");

    return normalizeResponse(await response.json());
  } catch {
    return getFallbackData();
  }
}
