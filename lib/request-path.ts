import { adminPathFromRequest } from "@/lib/admin/admin-routes";
import { staffPathFromRequest } from "@/lib/staff/staff-routes";

export const REQUEST_PATHNAME_HEADER = "x-pathname";

export function intendedPathFromUrl(pathname: string, search: string): string {
  if (pathname.startsWith("/staff")) {
    return staffPathFromRequest(pathname, search);
  }
  if (pathname.startsWith("/admin")) {
    return adminPathFromRequest(pathname, search);
  }
  if (!search) {
    return pathname;
  }
  return `${pathname}${search.startsWith("?") ? search : `?${search}`}`;
}

export function readIntendedPathFromHeaders(
  headerValue: string | null | undefined,
  fallback: string,
): string {
  const trimmed = headerValue?.trim();
  return trimmed && trimmed.startsWith("/") ? trimmed : fallback;
}
