import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_PAGE = "/";

const PUBLIC_PATHS = new Set([
  "/",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/manifest.json",
  "/icon.svg",
]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Debugging helper
  try {
    // eslint-disable-next-line no-console
    console.debug(`[proxy] incoming: ${pathname}`);
  } catch {}

  // Allow static assets and public paths
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ks_token")?.value;

  if (!token) {
    // eslint-disable-next-line no-console
    console.debug(`[proxy] no token for ${pathname} — redirecting to ${AUTH_PAGE}`);
    const url = req.nextUrl.clone();
    url.pathname = AUTH_PAGE;
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-production"
    );
    await jwtVerify(token, secret);
    // eslint-disable-next-line no-console
    console.debug(`[proxy] token valid for ${pathname}`);
    return NextResponse.next();
  } catch {
    // eslint-disable-next-line no-console
    console.debug(`[proxy] token invalid/expired for ${pathname} — clearing cookie and redirecting to ${AUTH_PAGE}`);
    const url = req.nextUrl.clone();
    url.pathname = AUTH_PAGE;
    const response = NextResponse.redirect(url);
    response.cookies.set("ks_token", "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)",
  ],
};
