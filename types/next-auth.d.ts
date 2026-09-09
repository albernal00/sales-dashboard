import type { DefaultSession } from "next-auth";
import type { DashboardRole } from "@/lib/auth-users";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role?: DashboardRole;
      staffId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: DashboardRole;
    staffId?: string;
  }
}
