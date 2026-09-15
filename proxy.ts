import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error("[auth] configuration_error", { reason: "AUTH_SECRET_MISSING" });
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  let token: Awaited<ReturnType<typeof getToken>> = null;
  try {
    token = await getToken({
      req: request,
      secret,
      secureCookie: process.env.NODE_ENV === "production",
    });
  } catch {
    console.warn("[auth] session_rejected", { reason: "TOKEN_INVALID" });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/",
    "/stores/:path*",
    "/staff/:path*",
    "/appointments/:path*",
    "/stb/:path*",
  ],
};
