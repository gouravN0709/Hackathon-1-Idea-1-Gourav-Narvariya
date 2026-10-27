/** Stable key for catalog.jsx lookups (must match scripts/locale-messages/build-catalog.mjs). */
export function catalogSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
}
