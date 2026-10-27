import { describe, expect, it } from "vitest";
import {
  guestCanCancelStatus,
  guestCancelBlockedReason,
} from "@/lib/manage-booking/guest-cancel-eligibility";

describe("guestCanCancelStatus", () => {
  it("allows pending and confirmed", () => {
    expect(guestCanCancelStatus("pending")).toBe(true);
    expect(guestCanCancelStatus("confirmed")).toBe(true);
  });

  it("blocks terminal and in-service states", () => {
    expect(guestCanCancelStatus("cancelled")).toBe(false);
    expect(guestCanCancelStatus("seated")).toBe(false);
    expect(guestCanCancelStatus("completed")).toBe(false);
    expect(guestCanCancelStatus("no_show")).toBe(false);
  });
});

describe("guestCancelBlockedReason", () => {
  it("explains seated reservations", () => {
    expect(guestCancelBlockedReason("seated")).toMatch(/seated/i);
  });
});
