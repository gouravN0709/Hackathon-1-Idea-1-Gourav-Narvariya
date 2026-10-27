import { describe, expect, it } from "vitest";
import { localeLabels, locales, routing } from "@/i18n/routing";

describe("i18n routing", () => {
  it("defaults to English", () => {
    expect(routing.defaultLocale).toBe("en");
  });

  it("exposes three public locales with readable labels", () => {
    expect(locales).toEqual(["en", "es", "eu"]);
    expect(localeLabels.en).toBe("English");
    expect(localeLabels.es).toBe("Español");
    expect(localeLabels.eu).toBe("Euskara");
  });
});
