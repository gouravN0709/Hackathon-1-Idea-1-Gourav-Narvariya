import { describe, expect, it } from "vitest";
import { adultMax, childMax } from "@/lib/booking/constants";
import { validateBookingRequest } from "@/lib/booking/validate-request";

const validBase = {
  date: "2026-10-29",
  arrival: "13:30",
  adults: 2,
  children: 0,
  name: "Ane Iturrieta",
  email: "guest@example.com",
  phone: "+34 945 445 102",
  notes: "",
};

describe("validateBookingRequest", () => {
  it("rejects closed weekdays", () => {
    const result = validateBookingRequest({
      ...validBase,
      date: "2026-11-02",
      arrival: "13:00",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.date).toContain("Thursday to Sunday");
    }
  });

  it("rejects dates that have already passed", () => {
    const result = validateBookingRequest({
      ...validBase,
      date: "2020-01-02",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.date).toContain("passed");
    }
  });

  it("rejects an arrival time outside the published window", () => {
    const result = validateBookingRequest({
      ...validBase,
      arrival: "12:30",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.arrival).toBeTruthy();
    }
  });

  it("rejects adult and child counts outside allowed bounds", () => {
    const tooFewAdults = validateBookingRequest({ ...validBase, adults: 0 });
    expect(tooFewAdults.ok).toBe(false);
    if (!tooFewAdults.ok) {
      expect(tooFewAdults.errors.adults).toBeTruthy();
    }

    const tooManyAdults = validateBookingRequest({ ...validBase, adults: adultMax + 1 });
    expect(tooManyAdults.ok).toBe(false);
    if (!tooManyAdults.ok) {
      expect(tooManyAdults.errors.adults).toBeTruthy();
    }

    const tooManyChildren = validateBookingRequest({ ...validBase, children: childMax + 1 });
    expect(tooManyChildren.ok).toBe(false);
    if (!tooManyChildren.ok) {
      expect(tooManyChildren.errors.children).toBeTruthy();
    }
  });

  it("rejects invalid guest contact details", () => {
    const badName = validateBookingRequest({ ...validBase, name: "  " });
    expect(badName.ok).toBe(false);
    if (!badName.ok) {
      expect(badName.errors.name).toBeTruthy();
    }

    const badEmail = validateBookingRequest({ ...validBase, email: "not-an-email" });
    expect(badEmail.ok).toBe(false);
    if (!badEmail.ok) {
      expect(badEmail.errors.email).toBeTruthy();
    }

    const badPhone = validateBookingRequest({ ...validBase, phone: "123" });
    expect(badPhone.ok).toBe(false);
    if (!badPhone.ok) {
      expect(badPhone.errors.phone).toBeTruthy();
    }
  });

  it("rejects notes longer than 800 characters", () => {
    const result = validateBookingRequest({
      ...validBase,
      notes: "a".repeat(801),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.notes).toBeTruthy();
    }
  });

  it("accepts a valid Thursday request", () => {
    const result = validateBookingRequest({
      ...validBase,
      children: 1,
      notes: "High chair",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.partySize).toBe(3);
      expect(result.value.name).toBe("Ane Iturrieta");
    }
  });
});
