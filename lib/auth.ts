import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth-options";
import { findDashboardUser, type DashboardUser } from "@/lib/auth-users";

export class AuthenticationRequiredError extends Error {
  readonly status = 401;
}

export class AuthorizationDeniedError extends Error {
  readonly status = 403;
}

export async function requireUser(): Promise<DashboardUser & { name: string; image?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new AuthenticationRequiredError("AUTH_REQUIRED");

  const dashboardUser = findDashboardUser(session.user.email);
  if (!dashboardUser) {
    console.warn("[auth] authorization_denied", { reason: "USER_NOT_ALLOWED" });
    throw new AuthorizationDeniedError("USER_NOT_ALLOWED");
  }

  return {
    ...dashboardUser,
    name: session.user.name?.trim() || "ユーザー",
    ...(session.user.image ? { image: session.user.image } : {}),
  };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    console.warn("[auth] authorization_denied", { reason: "ADMIN_REQUIRED" });
    throw new AuthorizationDeniedError("ADMIN_REQUIRED");
  }
  return user;
}

export async function requirePageUser() {
  try {
    return await requireUser();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/login");
    redirect("/access-denied");
  }
}

export function assertStaffDetailAccess(
  user: DashboardUser,
  requestedStaffId: string
) {
  if (user.role === "staff" && user.staffId !== requestedStaffId) {
    console.warn("[auth] authorization_denied", { reason: "STAFF_SCOPE_DENIED" });
    throw new AuthorizationDeniedError("STAFF_SCOPE_DENIED");
  }
}

export function assertPageStaffDetailAccess(
  user: DashboardUser,
  requestedStaffId: string
) {
  try {
    assertStaffDetailAccess(user, requestedStaffId);
  } catch {
    redirect("/access-denied");
  }
}
