import { normalizeReferenceQuery } from "@/lib/staff/reference-match";
import { GUEST_REFERENCE_PATTERN } from "@/lib/manage-booking/validate-lookup";

/**
 * Builds a Postgres UUID text prefix for ilike lookup from a validated ITU- reference.
 * The first 10 hex characters of the compact id map to the first two UUID groups.
 */
export function referenceToUuidIlikePrefix(reference: string): string | null {
  const normalized = normalizeReferenceQuery(reference);
  if (!GUEST_REFERENCE_PATTERN.test(normalized)) {
    return null;
  }

  const suffix = normalized.slice(4).toLowerCase();
  return `${suffix.slice(0, 8)}-${suffix.slice(8, 10)}`;
}
