export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_RESERVATIONS_PATH = "/admin/reservations";
export const ADMIN_CUSTOMERS_PATH = "/admin/customers";
export const ADMIN_AVAILABILITY_PATH = "/admin/availability";
export const ADMIN_OPERATIONS_PATH = "/admin/operations";
export const ADMIN_SETTINGS_PATH = "/admin/settings";
export const ADMIN_STAFF_PATH = "/admin/staff";

export const ADMIN_PANEL_PATHS = [
  ADMIN_HOME_PATH,
  ADMIN_RESERVATIONS_PATH,
  ADMIN_CUSTOMERS_PATH,
  ADMIN_AVAILABILITY_PATH,
  ADMIN_OPERATIONS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_STAFF_PATH,
] as const;

export function isAdminLoginPath(pathname: string): boolean {
  return (
    pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  );
}

/** Admin paths that require a Supabase Auth session (admin profile checked on the server). */
export function isAdminPathRequiringAuthSession(pathname: string): boolean {
  if (!pathname.startsWith("/admin")) {
    return false;
  }
  if (pathname === "/admin" || pathname === "/admin/") {
    return true;
  }
  if (isAdminLoginPath(pathname)) {
    return false;
  }
  return pathname.startsWith("/admin/");
}

export function adminPathFromRequest(pathname: string, search: string): string {
  if (!search) {
    return pathname;
  }
  return `${pathname}${search.startsWith("?") ? search : `?${search}`}`;
}

export function sanitizeAdminNextPath(raw: string | null | undefined): string {
  if (!raw) {
    return ADMIN_HOME_PATH;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/admin")) {
    return ADMIN_HOME_PATH;
  }

  const questionIndex = trimmed.indexOf("?");
  const pathname =
    questionIndex === -1 ? trimmed : trimmed.slice(0, questionIndex);
  const query = questionIndex === -1 ? "" : trimmed.slice(questionIndex);

  if (
    pathname === "/admin" ||
    !pathname.startsWith("/admin/") ||
    pathname.includes("//") ||
    pathname.includes("\\") ||
    isAdminLoginPath(pathname)
  ) {
    return ADMIN_HOME_PATH;
  }

  return `${pathname}${query}`;
}

export function buildAdminLoginUrl(intendedPath?: string): string {
  if (!intendedPath) {
    return ADMIN_LOGIN_PATH;
  }
  const next = sanitizeAdminNextPath(intendedPath);
  const params = new URLSearchParams({ next });
  return `${ADMIN_LOGIN_PATH}?${params.toString()}`;
}

export function revalidateAdminPanelPaths() {
  return [...ADMIN_PANEL_PATHS];
}
