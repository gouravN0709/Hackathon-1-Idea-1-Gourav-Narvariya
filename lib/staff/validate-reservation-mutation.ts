import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

export const RESERVATION_NOTES_MAX_LENGTH = 800;
export const MIN_ACTION_NOTE_LENGTH = 3;

export const staffReservationMutationActions = [
  "confirm",
  "mark_seated",
  "mark_completed",
  "cancel",
  "mark_no_show",
  "edit_notes",
] as const;

export type StaffReservationMutationAction =
  (typeof staffReservationMutationActions)[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TransitionRule = {
  action: StaffReservationMutationAction;
  from: ReservationStatus[];
  to: ReservationStatus;
};

export const APPROVED_TRANSITION_RULES: TransitionRule[] = [
  { action: "confirm", from: ["pending"], to: "confirmed" },
  { action: "mark_seated", from: ["confirmed"], to: "seated" },
  { action: "mark_completed", from: ["seated"], to: "completed" },
  { action: "cancel", from: ["pending", "confirmed"], to: "cancelled" },
  { action: "mark_no_show", from: ["confirmed", "seated"], to: "no_show" },
];

export function parseReservationId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return UUID_PATTERN.test(trimmed) ? trimmed : null;
}

export function parseMutationAction(
  value: unknown,
): StaffReservationMutationAction | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return (staffReservationMutationActions as readonly string[]).includes(trimmed)
    ? (trimmed as StaffReservationMutationAction)
    : null;
}

export function isReservationStatus(value: string): value is ReservationStatus {
  return (reservationStatuses as readonly string[]).includes(value);
}

export function targetStatusForAction(
  action: StaffReservationMutationAction,
): ReservationStatus | null {
  if (action === "edit_notes") {
    return null;
  }
  const rule = APPROVED_TRANSITION_RULES.find((entry) => entry.action === action);
  return rule?.to ?? null;
}

export function isTransitionAllowed(
  currentStatus: ReservationStatus,
  action: StaffReservationMutationAction,
): boolean {
  if (action === "edit_notes") {
    return true;
  }
  return APPROVED_TRANSITION_RULES.some(
    (rule) => rule.action === action && rule.from.includes(currentStatus),
  );
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateActionNoteBody(body: unknown): ValidationResult {
  if (typeof body !== "string") {
    return { ok: false, error: "Enter a note for this action." };
  }
  const trimmed = body.trim();
  if (trimmed.length < MIN_ACTION_NOTE_LENGTH) {
    return {
      ok: false,
      error: `Enter at least ${MIN_ACTION_NOTE_LENGTH} characters explaining this action.`,
    };
  }
  return { ok: true };
}

export function validateReplacementNotes(notes: unknown): ValidationResult {
  if (typeof notes !== "string") {
    return { ok: false, error: "Notes must be text." };
  }
  if (notes.length > RESERVATION_NOTES_MAX_LENGTH) {
    return {
      ok: false,
      error: `Notes cannot exceed ${RESERVATION_NOTES_MAX_LENGTH} characters.`,
    };
  }
  return { ok: true };
}

export function formatActionNotePrefix(
  kind: "cancellation" | "no_show",
  businessDate: string,
): string {
  if (kind === "cancellation") {
    return `[Cancellation note — ${businessDate}] `;
  }
  return `[No-show note — ${businessDate}] `;
}

export function appendActionNote(
  existingNotes: string | null,
  prefix: string,
  body: string,
): { ok: true; notes: string } | { ok: false; error: string } {
  const trimmedBody = body.trim();
  const segment = `${prefix}${trimmedBody}`;
  const combined = existingNotes?.trim()
    ? `${existingNotes.trim()}\n\n${segment}`
    : segment;

  if (combined.length > RESERVATION_NOTES_MAX_LENGTH) {
    return {
      ok: false,
      error: `Combined notes would exceed ${RESERVATION_NOTES_MAX_LENGTH} characters. Shorten the note or edit existing notes first.`,
    };
  }

  return { ok: true, notes: combined };
}

export function businessDateInMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
