import "server-only";

export type DashboardRole = "admin" | "staff";

export type DashboardUser = {
  email: string;
  role: DashboardRole;
  staffId?: string;
};

let cachedSource: string | undefined;
let cachedUsers: DashboardUser[] | null = null;
let lastLoggedCode: string | undefined;

function logConfigurationError(code: string) {
  if (lastLoggedCode === code) return;
  lastLoggedCode = code;
  console.error("[auth] configuration_error", { reason: code });
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function loadDashboardUsers(): DashboardUser[] | null {
  const source = process.env.DASHBOARD_USERS_JSON;
  if (!source) {
    logConfigurationError("USERS_CONFIG_MISSING");
    return null;
  }
  if (source === cachedSource) return cachedUsers;

  cachedSource = source;
  try {
    const parsed: unknown = JSON.parse(source);
    if (!Array.isArray(parsed)) throw new Error("not_array");

    const users: DashboardUser[] = [];
    const emails = new Set<string>();
    for (const item of parsed) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        throw new Error("invalid_row");
      }

      const record = item as Record<string, unknown>;
      const email = typeof record.email === "string"
        ? normalizeEmail(record.email)
        : "";
      const role = record.role;
      const staffId = typeof record.staffId === "string"
        ? record.staffId.trim()
        : undefined;

      if (
        !email ||
        !/^\S+@\S+\.\S+$/.test(email) ||
        (role !== "admin" && role !== "staff") ||
        (role === "staff" && !staffId) ||
        emails.has(email)
      ) {
        throw new Error("invalid_row");
      }

      emails.add(email);
      users.push({ email, role, ...(staffId ? { staffId } : {}) });
    }

    cachedUsers = users;
    lastLoggedCode = undefined;
    return users;
  } catch {
    cachedUsers = null;
    logConfigurationError("USERS_CONFIG_INVALID");
    return null;
  }
}

export function findDashboardUser(email: string | null | undefined): DashboardUser | null {
  if (!email) return null;
  const users = loadDashboardUsers();
  if (!users) return null;
  const normalizedEmail = normalizeEmail(email);
  return users.find((user) => user.email === normalizedEmail) ?? null;
}
