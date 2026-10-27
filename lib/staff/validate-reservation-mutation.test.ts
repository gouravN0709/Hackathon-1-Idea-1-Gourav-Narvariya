import { describe, expect, it } from "vitest";
import {
  appendActionNote,
  APPROVED_TRANSITION_RULES,
  formatActionNotePrefix,
  isTransitionAllowed,
  parseMutationAction,
  parseReservationId,
  RESERVATION_NOTES_MAX_LENGTH,
  validateActionNoteBody,
  validateReplacementNotes,
} from "@/lib/staff/validate-reservation-mutation";

const VALID_UUID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

describe("parseReservationId", () => {
  it("accepts lowercase UUIDs", () => {
    expect(parseReservationId(VALID_UUID)).toBe(VALID_UUID);
  });

  it("rejects sample demo ids", () => {
    expect(parseReservationId("sample-1")).toBeNull();
  });

  it("rejects malformed values", () => {
    expect(parseReservationId("not-a-uuid")).toBeNull();
    expect(parseReservationId(null)).toBeNull();
  });
});

describe("parseMutationAction", () => {
  it("accepts approved actions", () => {
    expect(parseMutationAction("confirm")).toBe("confirm");
    expect(parseMutationAction("edit_notes")).toBe("edit_notes");
  });

  it("rejects unknown actions", () => {
    expect(parseMutationAction("reinstate")).toBeNull();
    expect(parseMutationAction("")).toBeNull();
  });
});

describe("isTransitionAllowed", () => {
  it("allows every approved transition", () => {
    for (const rule of APPROVED_TRANSITION_RULES) {
      for (const from of rule.from) {
        expect(isTransitionAllowed(from, rule.action)).toBe(true);
      }
    }
  });

  it("blocks representative forbidden transitions", () => {
    expect(isTransitionAllowed("pending", "mark_seated")).toBe(false);
    expect(isTransitionAllowed("confirmed", "mark_completed")).toBe(false);
    expect(isTransitionAllowed("cancelled", "confirm")).toBe(false);
    expect(isTransitionAllowed("completed", "cancel")).toBe(false);
    expect(isTransitionAllowed("seated", "confirm")).toBe(false);
  });

  it("allows edit_notes regardless of status", () => {
    expect(isTransitionAllowed("cancelled", "edit_notes")).toBe(true);
  });
});

describe("validateActionNoteBody", () => {
  it("requires a meaningful note", () => {
    expect(validateActionNoteBody("  ab ").ok).toBe(false);
    expect(validateActionNoteBody("Guest called ahead").ok).toBe(true);
  });
});

describe("appendActionNote", () => {
  it("preserves existing notes and applies prefix", () => {
    const prefix = formatActionNotePrefix("cancellation", "2026-10-27");
    const result = appendActionNote("Existing line", prefix, "Party reduced");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.notes).toBe(
        `Existing line\n\n[Cancellation note — 2026-10-27] Party reduced`,
      );
    }
  });

  it("rejects combined notes over the limit without truncating", () => {
    const prefix = formatActionNotePrefix("no_show", "2026-10-27");
    const existing = "x".repeat(RESERVATION_NOTES_MAX_LENGTH - 10);
    const result = appendActionNote(existing, prefix, "Arrived late");
    expect(result.ok).toBe(false);
  });
});

describe("validateReplacementNotes", () => {
  it("allows empty replacement notes", () => {
    expect(validateReplacementNotes("").ok).toBe(true);
  });

  it("rejects notes over 800 characters", () => {
    expect(validateReplacementNotes("a".repeat(801)).ok).toBe(false);
    expect(validateReplacementNotes("a".repeat(800)).ok).toBe(true);
  });
});
