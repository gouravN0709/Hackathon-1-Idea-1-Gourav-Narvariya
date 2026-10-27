import { describe, expect, it } from "vitest";
import { catalogSlug } from "@/lib/i18n/slug";

describe("catalogSlug", () => {
  it("stabilizes keys for catalog lookups", () => {
    expect(catalogSlug("Book a Visit")).toBe("book_a_visit");
    expect(catalogSlug("Book a Visit")).toBe(catalogSlug("Book a Visit"));
  });

  it("truncates long strings", () => {
    const long = "A".repeat(120);
    expect(catalogSlug(long).length).toBeLessThanOrEqual(80);
  });
});
