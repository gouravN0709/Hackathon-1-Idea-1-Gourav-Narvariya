import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api")
  ) {
    return updateSession(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(en|es|eu)/:path*",
    "/((?!api|staff|admin|_next|_vercel|.*\\..*).*)",
  ],
};
