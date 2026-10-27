import { describe, expect, it } from "vitest";
import {
  createDistributedRateLimitStore,
  createInMemoryRateLimitStore,
  describeRateLimitBackend,
  getRateLimitStore,
  resetRateLimitStoreForTests,
} from "@/lib/api/rate-limit-store";

describe("createInMemoryRateLimitStore", () => {
  it("blocks after limit", async () => {
    const store = createInMemoryRateLimitStore();
    const key = `mem-${Math.random()}`;
    expect((await store.check(key, 1, 60_000, 1_000)).ok).toBe(true);
    expect((await store.check(key, 1, 60_000, 2_000)).ok).toBe(false);
  });
});

describe("createDistributedRateLimitStore", () => {
  it("returns null when distributed is requested without Upstash credentials", () => {
    const prevBackend = process.env.RATE_LIMIT_BACKEND;
    const prevUrl = process.env.UPSTASH_REDIS_REST_URL;
    const prevToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.RATE_LIMIT_BACKEND = "distributed";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(createDistributedRateLimitStore()).toBeNull();
    if (prevBackend === undefined) {
      delete process.env.RATE_LIMIT_BACKEND;
    } else {
      process.env.RATE_LIMIT_BACKEND = prevBackend;
    }
    if (prevUrl === undefined) {
      delete process.env.UPSTASH_REDIS_REST_URL;
    } else {
      process.env.UPSTASH_REDIS_REST_URL = prevUrl;
    }
    if (prevToken === undefined) {
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    } else {
      process.env.UPSTASH_REDIS_REST_TOKEN = prevToken;
    }
  });
});

describe("describeRateLimitBackend", () => {
  it("reports memory by default", () => {
    const prev = process.env.RATE_LIMIT_BACKEND;
    delete process.env.RATE_LIMIT_BACKEND;
    expect(describeRateLimitBackend()).toEqual({ mode: "memory" });
    if (prev === undefined) {
      delete process.env.RATE_LIMIT_BACKEND;
    } else {
      process.env.RATE_LIMIT_BACKEND = prev;
    }
  });

  it("reports fallback when distributed is requested", () => {
    const prev = process.env.RATE_LIMIT_BACKEND;
    process.env.RATE_LIMIT_BACKEND = "distributed";
    expect(describeRateLimitBackend()).toMatchObject({
      mode: "distributed_requested",
      effective: "memory",
    });
    if (prev === undefined) {
      delete process.env.RATE_LIMIT_BACKEND;
    } else {
      process.env.RATE_LIMIT_BACKEND = prev;
    }
  });
});

describe("getRateLimitStore", () => {
  it("falls back to in-memory when distributed is requested but unavailable", async () => {
    resetRateLimitStoreForTests();
    const prev = process.env.RATE_LIMIT_BACKEND;
    process.env.RATE_LIMIT_BACKEND = "distributed";
    const store = getRateLimitStore();
    const key = `singleton-${Math.random()}`;
    expect((await store.check(key, 2, 60_000, 1_000)).ok).toBe(true);
    if (prev === undefined) {
      delete process.env.RATE_LIMIT_BACKEND;
    } else {
      process.env.RATE_LIMIT_BACKEND = prev;
    }
    resetRateLimitStoreForTests();
  });
});
