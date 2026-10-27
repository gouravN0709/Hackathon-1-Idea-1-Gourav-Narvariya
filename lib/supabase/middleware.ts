import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  buildAdminLoginUrl,
  isAdminPathRequiringAuthSession,
  adminPathFromRequest,
} from "@/lib/admin/admin-routes";
import {
  buildStaffLoginUrl,
  isStaffPathRequiringAuthSession,
  staffPathFromRequest,
} from "@/lib/staff/staff-routes";
import {
  intendedPathFromUrl,
  REQUEST_PATHNAME_HEADER,
} from "@/lib/request-path";

function nextWithRequestPath(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    REQUEST_PATHNAME_HEADER,
    intendedPathFromUrl(request.nextUrl.pathname, request.nextUrl.search),
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = nextWithRequestPath(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  const pathname = request.nextUrl.pathname;

  if (!supabaseUrl || !publishableKey) {
    if (isStaffPathRequiringAuthSession(pathname)) {
      const intended = staffPathFromRequest(pathname, request.nextUrl.search);
      return NextResponse.redirect(new URL(buildStaffLoginUrl(intended), request.url));
    }
    if (isAdminPathRequiringAuthSession(pathname)) {
      const intended = adminPathFromRequest(pathname, request.nextUrl.search);
      return NextResponse.redirect(new URL(buildAdminLoginUrl(intended), request.url));
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = nextWithRequestPath(request);
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isStaffPathRequiringAuthSession(pathname)) {
    const intended = staffPathFromRequest(pathname, request.nextUrl.search);
    const loginUrl = new URL(buildStaffLoginUrl(intended), request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!user && isAdminPathRequiringAuthSession(pathname)) {
    const intended = adminPathFromRequest(pathname, request.nextUrl.search);
    const loginUrl = new URL(buildAdminLoginUrl(intended), request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
