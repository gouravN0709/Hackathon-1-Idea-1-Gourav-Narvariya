import { connection } from "next/server";
import { NextResponse } from "next/server";
import { checkRateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";
import { cancelGuestReservation } from "@/lib/manage-booking/guest-cancel";
import {
  validateGuestLookupInput,
  type GuestLookupInput,
} from "@/lib/manage-booking/validate-lookup";
import { dispatchGuestCancellationNotice } from "@/lib/notifications/dispatch";
import { createAdminClient, hasServiceRoleConfiguration } from "@/lib/supabase/admin";

const CANCEL_LIMIT = 15;
const CANCEL_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  await connection();

  const ip = clientIpFromRequest(request);
  const rate = checkRateLimit(`manage-booking:cancel:${ip}`, CANCEL_LIMIT, CANCEL_WINDOW_MS);
  if (!rate.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "rate_limit",
          message: "Too many cancellation attempts. Wait a few minutes and try again.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  if (!hasServiceRoleConfiguration()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "configuration",
          message: "Online booking management is not available yet.",
        },
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "validation", message: "Invalid request body." },
      },
      { status: 400 },
    );
  }

  const raw = body as Partial<
    GuestLookupInput & { updatedAt?: string; reason?: string; message?: string }
  >;

  const lookupParsed = validateGuestLookupInput({
    reference: String(raw.reference ?? ""),
    contact: String(raw.contact ?? ""),
  });

  if (!lookupParsed.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "validation",
          message: "Check the reference and contact details.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const result = await cancelGuestReservation(supabase, {
      ...lookupParsed.value,
      updatedAt: String(raw.updatedAt ?? ""),
      reason: raw.reason != null ? String(raw.reason) : undefined,
      message: raw.message != null ? String(raw.message) : undefined,
    });

    if (!result.ok) {
      const status =
        result.code === "not_found"
          ? 404
          : result.code === "validation"
            ? 400
            : result.code === "ineligible"
              ? 409
              : result.code === "conflict"
                ? 409
                : 500;
      return NextResponse.json(
        { ok: false, error: { code: result.code, message: result.message } },
        { status },
      );
    }

    void dispatchGuestCancellationNotice({
      reference: lookupParsed.value.reference,
      guestContact: lookupParsed.value.contact,
    });

    return NextResponse.json({
      ok: true,
      idempotent: result.idempotent,
      reservation: result.reservation,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "server",
          message: "We could not cancel this booking. Try again or call the farm.",
        },
      },
      { status: 500 },
    );
  }
}
