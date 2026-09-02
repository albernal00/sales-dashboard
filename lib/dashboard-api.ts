import "server-only";

import { connection } from "next/server";
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

const FALLBACK_UPDATED_AT = "2026-08-31T17:50:00+09:00";

type UnknownRecord = Record<string, unknown>;

type DiagnosticValue = string | number | boolean;

class DashboardApiError extends Error {
  constructor(
    readonly code: string,
    readonly details: Record<string, DiagnosticValue> = {}
  ) {
    super(code);
    this.name = "DashboardApiError";
  }
}

function logFallback(
  reason: string,
  details: Record<string, DiagnosticValue> = {}
) {
  console.error("[dashboard-api] fallback", { reason, ...details });
}

function logValidationResult(
  section: string,
  receivedCount: number,
  acceptedCount: number
) {
  if (receivedCount !== acceptedCount) {
    console.warn("[dashboard-api] validation_warning", {
      section,
      receivedCount,
      acceptedCount,
    });
  }
}

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
  if (!Array.isArray(value)) throw new DashboardApiError("STORES_NOT_ARRAY");

  const stores = value.flatMap((item, index) => {
    if (!isRecord(item)) return [];

    const name = getString(item, ["name", "storeName"]);
    const target = getNumber(item, ["target"]);
    const actual = getNumber(item, ["actual"]);
    if (!name || actual === undefined) {
      return [];
    }

    return [{
      id: getString(item, ["id", "storeId", "customerId"]) ?? `store-${index + 1}`,
      name,
      target: target ?? 0,
      actual,
      previousActual: getNumber(item, ["previousActual"]) ?? 0,
      staffId: getString(item, ["staffId", "assignedStaffId"]) ?? "",
    }];
  });

  logValidationResult("stores", value.length, stores.length);
  if (value.length > 0 && stores.length === 0) {
    throw new DashboardApiError("STORES_NO_VALID_ROWS", {
      receivedCount: value.length,
    });
  }

  return stores;
}

function hasTargetData(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.some(
      (item) => isRecord(item) && getNumber(item, ["target"]) !== undefined
    )
  );
}

function normalizeStaff(value: unknown): Staff[] {
  if (!Array.isArray(value)) throw new DashboardApiError("STAFF_NOT_ARRAY");

  const staff = value.flatMap((item, index) => {
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

  logValidationResult("staff", value.length, staff.length);
  if (value.length > 0 && staff.length === 0) {
    throw new DashboardApiError("STAFF_NO_VALID_ROWS", {
      receivedCount: value.length,
    });
  }

  return staff;
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
  if (Array.isArray(value)) {
    const acceptedRows = value.filter(
      (item) => normalizeRewardEntries([item]).length > 0
    ).length;
    logValidationResult("rewards", value.length, acceptedRows);
    if (value.length > 0 && entries.length === 0) {
      throw new DashboardApiError("REWARDS_NO_VALID_ROWS", {
        receivedCount: value.length,
      });
    }
    return entries;
  }
  if (!isRecord(value)) throw new DashboardApiError("REWARDS_INVALID");

  const byStaff = normalizeRewardEntries(value.byStaff);
  if (byStaff.length > 0) return byStaff;

  const hasConfirmed = getNumber(value, ["confirmed"]) !== undefined;
  const hasPending = getNumber(value, ["pending"]) !== undefined;
  if (!hasConfirmed && !hasPending) {
    throw new DashboardApiError("REWARDS_TOTALS_MISSING");
  }

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

function normalizeResponse(value: unknown, requestedMonth: string): DashboardData {
  if (!isRecord(value)) throw new DashboardApiError("RESPONSE_NOT_OBJECT");

  const response = value as Partial<GasDashboardResponse>;
  if (
    response.status !== "ok" &&
    response.status !== "success" &&
    response.status !== "warning"
  ) {
    const receivedStatus =
      typeof response.status === "string" && /^[a-z_-]{1,30}$/i.test(response.status)
        ? response.status
        : "invalid_or_missing";
    throw new DashboardApiError("STATUS_NOT_USABLE", { receivedStatus });
  }

  return {
    status: response.status,
    targetMonth:
      typeof response.targetMonth === "string" &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(response.targetMonth)
        ? response.targetMonth
        : requestedMonth,
    stores: normalizeStores(response.stores),
    staff: normalizeStaff(response.staff),
    rewards: normalizeRewards(response.rewards),
    warnings: Array.isArray(response.warnings)
      ? response.warnings.filter((warning): warning is string => typeof warning === "string")
      : [],
    sourceHealth: response.sourceHealth,
    updatedAt: typeof response.updatedAt === "string" ? response.updatedAt : "",
    isFallback: false,
    targetDataAvailable: hasTargetData(response.stores),
  };
}

function getFallbackData(targetMonth: string): DashboardData {
  return {
    status: "warning",
    targetMonth,
    stores: fallbackStores,
    staff: fallbackStaff,
    rewards: fallbackRewards,
    warnings: ["GAS APIからデータを取得できませんでした。"],
    sourceHealth: null,
    updatedAt: FALLBACK_UPDATED_AT,
    isFallback: true,
    targetDataAvailable: true,
  };
}

export async function getDashboardData(targetMonth: string): Promise<DashboardData> {
  await connection();

  const apiUrl = process.env.GAS_DASHBOARD_API_URL;
  if (!apiUrl) {
    logFallback("ENV_MISSING");
    return getFallbackData(targetMonth);
  }

  let url: URL;
  try {
    url = new URL(apiUrl);
    url.searchParams.set("month", targetMonth);
  } catch {
    logFallback("URL_INVALID");
    return getFallbackData(targetMonth);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
    });
  } catch (error) {
    logFallback("NETWORK_ERROR", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return getFallbackData(targetMonth);
  }

  if (response.redirected) {
    console.info("[dashboard-api] redirect_followed", {
      httpStatus: response.status,
    });
  }

  if (!response.ok) {
    logFallback("HTTP_ERROR", {
      httpStatus: response.status,
      redirected: response.redirected,
    });
    return getFallbackData(targetMonth);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    logFallback("JSON_PARSE_ERROR", {
      httpStatus: response.status,
      redirected: response.redirected,
      contentTypeIsJson:
        response.headers.get("content-type")?.includes("application/json") ?? false,
    });
    return getFallbackData(targetMonth);
  }

  try {
    const data = normalizeResponse(payload, targetMonth);
    if (data.status === "warning") {
      console.warn("[dashboard-api] api_warning", {
        warningCount: data.warnings.length,
        storeCount: data.stores.length,
        staffCount: data.staff.length,
        rewardCount: data.rewards.length,
      });
    }
    return data;
  } catch (error) {
    if (error instanceof DashboardApiError) {
      logFallback(error.code, error.details);
    } else {
      logFallback("VALIDATION_UNKNOWN_ERROR", {
        errorType: error instanceof Error ? error.name : "unknown",
      });
    }
    return getFallbackData(targetMonth);
  }
}
