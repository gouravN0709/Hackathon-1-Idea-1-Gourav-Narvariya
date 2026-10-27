import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { catalogSlug } from "@/lib/i18n/slug";
import { locales } from "@/i18n/routing";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function loadLocale(locale: string) {
  return JSON.parse(readFileSync(join(root, "messages", `${locale}.json`), "utf8"));
}

describe("locale messages", () => {
  it("includes all configured locales", () => {
    for (const locale of locales) {
      expect(() => loadLocale(locale)).not.toThrow();
    }
  });

  it("keeps catalog keys aligned across locales", () => {
    const en = loadLocale("en");
    const es = loadLocale("es");
    const eu = loadLocale("eu");
    const enKeys = Object.keys(en.catalog.jsx).sort();
    expect(Object.keys(es.catalog.jsx).sort()).toEqual(enKeys);
    expect(Object.keys(eu.catalog.jsx).sort()).toEqual(enKeys);
  });

  it("does not leave Spanish catalog values identical to English", () => {
    const en = loadLocale("en");
    const es = loadLocale("es");
    const sampleKey = catalogSlug("Book a Visit");
    expect(es.catalog.jsx[sampleKey]).not.toBe(en.catalog.jsx[sampleKey]);
  });
});
