#!/usr/bin/env node
/**
 * HTTP portions of docs/STAGING-E2E-TEST-PLAN.md.
 * Requires a running app (e.g. npm run dev) and optional live Supabase for full pass.
 *
 * Usage:
 *   STAGING_E2E_BASE_URL=http://127.0.0.1:3000 node scripts/run-staging-e2e-http.mjs
 */

const baseUrl = (process.env.STAGING_E2E_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

async function fetchJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

function log(step, ok, detail) {
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${step}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  let failed = 0;

  try {
    const health = await fetchJson("/api/health");
    const healthOk =
      health.response.ok && health.body?.status === "ok" && health.body?.notifications?.readyToSend === false;
    log("7.2 health notifications off", healthOk, healthOk ? "" : `status ${health.response.status}`);
    if (!healthOk) failed += 1;

    const status = await fetchJson("/api/bookings/status");
    const statusShape =
      status.response.ok &&
      typeof status.body?.live === "boolean" &&
      (status.body.live === false || status.body.reason === null);
    log("precondition bookings/status shape", statusShape, status.body?.live ? "live:true" : status.body?.reason ?? "");
    if (!statusShape) failed += 1;

    const serviceDate = process.env.STAGING_E2E_SERVICE_DATE?.trim();
    if (serviceDate) {
      const avail = await fetchJson(
        `/api/bookings/availability?date=${encodeURIComponent(serviceDate)}&arrival=13:30`,
      );
      log("1.1 availability lookup", avail.response.ok, JSON.stringify(avail.body)?.slice(0, 120));
      if (!avail.response.ok) failed += 1;
    } else {
      log("1.1 availability lookup", true, "skipped — set STAGING_E2E_SERVICE_DATE for live slot check");
    }

    const badBook = await fetchJson("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const badBookOk = badBook.response.status === 400 || badBook.response.status === 503;
    log("2.x invalid booking rejected", badBookOk, `HTTP ${badBook.response.status}`);
    if (!badBookOk) failed += 1;
  } catch (error) {
    console.error("Could not reach app at", baseUrl);
    console.error(error instanceof Error ? error.message : error);
    process.exit(2);
  }

  if (failed > 0) {
    console.error(`\n${failed} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll automated HTTP checks passed.");
}

main();
