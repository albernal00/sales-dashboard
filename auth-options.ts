import "server-only";

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { findDashboardUser } from "@/lib/auth-users";

function safeRedirectUrl(url: string, baseUrl: string): string {
  if (url.startsWith("/") && !url.startsWith("//")) return `${baseUrl}${url}`;
  try {
    const candidate = new URL(url);
    return candidate.origin === baseUrl ? candidate.toString() : baseUrl;
  } catch {
    return baseUrl;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
  logger: {
    error(code) {
      console.error("[auth] provider_error", { reason: code });
    },
    warn(code) {
      console.warn("[auth] provider_warning", { reason: code });
    },
    debug() {},
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") {
        console.warn("[auth] sign_in_denied", { reason: "PROVIDER_NOT_ALLOWED" });
        return false;
      }

      const googleProfile = profile as { email_verified?: boolean } | undefined;
      if (googleProfile?.email_verified !== true) {
        console.warn("[auth] sign_in_denied", { reason: "EMAIL_NOT_VERIFIED" });
        return "/access-denied";
      }

      if (!findDashboardUser(user.email)) {
        console.warn("[auth] sign_in_denied", { reason: "USER_NOT_ALLOWED" });
        return "/access-denied";
      }
      return true;
    },
    async jwt({ token }) {
      const dashboardUser = findDashboardUser(token.email);
      if (!dashboardUser) {
        delete token.role;
        delete token.staffId;
        return token;
      }
      token.role = dashboardUser.role;
      token.staffId = dashboardUser.staffId;
      token.email = dashboardUser.email;
      return token;
    },
    async session({ session, token }) {
      const dashboardUser = findDashboardUser(token.email);
      if (!dashboardUser) {
        session.user = undefined;
        return session;
      }
      if (session.user && dashboardUser) {
        session.user.email = dashboardUser.email;
        session.user.role = dashboardUser.role;
        session.user.staffId = dashboardUser.staffId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return safeRedirectUrl(url, baseUrl);
    },
  },
};
