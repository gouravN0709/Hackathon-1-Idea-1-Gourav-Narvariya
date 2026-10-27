/**
 * Writes messages/{en,es,eu}.json
 * Run: node scripts/build-messages.mjs
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  siteConfig,
  navItems,
  footerEstateLinks,
  orchardStages,
  menuCourses,
  childrenMenuItems,
  experiences,
  galleryItems,
  diningHours,
  txotxSeasonLabel,
  menuPrices,
} from "../lib/site-config.ts";
import { mergeDeep, countKeys } from "./locale-messages/_merge.mjs";
import { uiByLocale } from "./locale-messages/ui-bundle.mjs";
import { contentEs, contentEu } from "./locale-messages/content-translations.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
}

function extractTxStrings() {
  const out = new Set();
  const cmd = `rg -o '<Tx(?:Server)?>([^<]+)</Tx(?:Server)?>' -r '$1' --glob '*.tsx' ${root}`;
  const raw = execSync(cmd, { encoding: "utf8" });
  for (const line of raw.split("\n")) {
    const text = line.includes(":") ? line.slice(line.indexOf(":") + 1).trim() : line.trim();
    if (text) out.add(text);
  }
  return [...out].sort();
}

function loadCatalogI18n() {
  const dir = join(__dirname, "locale-messages");
  const map = {};
  for (const file of readdirSync(dir)) {
    if (!file.startsWith("catalog-i18n") || !file.endsWith(".json")) continue;
    const chunk = JSON.parse(readFileSync(join(dir, file), "utf8"));
    Object.assign(map, chunk);
  }
  return map;
}

function buildContent(locale) {
  const en = {
    siteConfig: { ...siteConfig },
    navItems: navItems.map((i) => ({ ...i })),
    footerEstateLinks: footerEstateLinks.map((i) => ({ ...i })),
    orchardStages: orchardStages.map((i) => ({ ...i })),
    menuCourses: menuCourses.map((i) => ({ ...i })),
    childrenMenuItems: [...childrenMenuItems],
    experiences: experiences.map((i) => ({ ...i })),
    galleryItems: galleryItems.map((i) => ({ ...i })),
    diningHours: { ...diningHours, openWeekdays: [...diningHours.openWeekdays] },
    txotxSeasonLabel,
    menuPrices: { ...menuPrices },
  };
  if (locale === "en") return en;
  if (locale === "es") return mergeDeep(en, contentEs);
  return mergeDeep(en, contentEu);
}

function buildCatalog(locale, txStrings, catalogI18n) {
  const jsx = {};
  const missing = [];
  for (const text of txStrings) {
    const key = slug(text);
    if (locale === "en") {
      jsx[key] = text;
      continue;
    }
    const entry = catalogI18n[text];
    if (!entry?.[locale]) {
      missing.push(text);
      continue;
    }
    jsx[key] = entry[locale];
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing ${locale} catalog translations (${missing.length}). First: ${missing[0]}`,
    );
  }
  return { jsx };
}

const txStrings = extractTxStrings();
const catalogI18n = loadCatalogI18n();

mkdirSync(messagesDir, { recursive: true });

for (const locale of ["en", "es", "eu"]) {
  const messages = mergeDeep(uiByLocale[locale], {
    content: buildContent(locale),
    catalog: buildCatalog(locale, txStrings, catalogI18n),
  });
  writeFileSync(join(messagesDir, `${locale}.json`), `${JSON.stringify(messages, null, 2)}\n`);
  console.log(`Wrote messages/${locale}.json (${countKeys(messages)} keys, catalog ${Object.keys(messages.catalog.jsx).length})`);
}
