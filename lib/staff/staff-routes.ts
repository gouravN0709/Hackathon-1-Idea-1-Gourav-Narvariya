export const STAFF_LOGIN_PATH = "/staff/login";
export const STAFF_RESERVATIONS_PATH = "/staff/reservations";
export const STAFF_OPERATIONS_PATH = "/staff/operations";
export const STAFF_FLOOR_PATH = "/staff/floor";
export const STAFF_DEMO_RESERVATIONS_PATH = "/staff/demo/reservations";

/** Server-only. Enables the labelled demo route with fictional reservations. */
export function isStaffDemoReservationsEnabled(): boolean {
  return process.env.STAFF_DEMO_RESERVATIONS?.trim().toLowerCase() === "true";
}

export function isStaffLoginPath(pathname: string): boolean {
  return (
    pathname === STAFF_LOGIN_PATH || pathname.startsWith(`${STAFF_LOGIN_PATH}/`)
  );
}

export function isStaffDemoPath(pathname: string): boolean {
  return (
    pathname === STAFF_DEMO_RESERVATIONS_PATH ||
    pathname.startsWith("/staff/demo/")
  );
}

/** Staff paths that require a Supabase Auth session (staff profile checked on the server). */
export function isStaffPathRequiringAuthSession(pathname: string): boolean {
  if (!pathname.startsWith("/staff")) {
    return false;
  }
  if (pathname === "/staff" || pathname === "/staff/") {
    return true;
  }
  if (isStaffLoginPath(pathname)) {
    return false;
  }
  if (isStaffDemoPath(pathname) && isStaffDemoReservationsEnabled()) {
    return false;
  }
  return pathname.startsWith("/staff/");
}

export function staffPathFromRequest(pathname: string, search: string): string {
  if (!search) {
    return pathname;
  }
  return `${pathname}${search.startsWith("?") ? search : `?${search}`}`;
}

export function sanitizeStaffNextPath(raw: string | null | undefined): string {
  if (!raw) {
    return STAFF_RESERVATIONS_PATH;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/staff")) {
    return STAFF_RESERVATIONS_PATH;
  }

  const questionIndex = trimmed.indexOf("?");
  const pathname =
    questionIndex === -1 ? trimmed : trimmed.slice(0, questionIndex);
  const query = questionIndex === -1 ? "" : trimmed.slice(questionIndex);

  if (
    !pathname.startsWith("/staff/") ||
    pathname.includes("//") ||
    pathname.includes("\\") ||
    isStaffLoginPath(pathname)
  ) {
    return STAFF_RESERVATIONS_PATH;
  }

  if (isStaffDemoPath(pathname) && !isStaffDemoReservationsEnabled()) {
    return STAFF_RESERVATIONS_PATH;
  }

  return `${pathname}${query}`;
}

export function buildStaffLoginUrl(intendedPath?: string): string {
  if (!intendedPath) {
    return STAFF_LOGIN_PATH;
  }
  const next = sanitizeStaffNextPath(intendedPath);
  const params = new URLSearchParams({ next });
  return `${STAFF_LOGIN_PATH}?${params.toString()}`;
}
