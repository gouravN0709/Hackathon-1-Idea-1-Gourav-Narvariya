import { connection } from "next/server";
import { NextResponse } from "next/server";
import { checkRateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";
import { lookupGuestReservation } from "@/lib/manage-booking/lookup-reservation";
import {
  validateGuestLookupInput,
  type GuestLookupInput,
} from "@/lib/manage-booking/validate-lookup";
import { createAdminClient, hasServiceRoleConfiguration } from "@/lib/supabase/admin";

const LOOKUP_LIMIT = 30;
const LOOKUP_WINDOW_MS = 15 * 60 * 1000;

const NOT_FOUND_BODY = {
  ok: false as const,
  error: {
    code: "not_found" as const,
    message:
      "We could not find a booking with those details. Check the reference and contact information, or call the farm.",
  },
};

export async function POST(request: Request) {
  await connection();

  const ip = clientIpFromRequest(request);
  const rate = await checkRateLimit(`manage-booking:lookup:${ip}`, LOOKUP_LIMIT, LOOKUP_WINDOW_MS);
  if (!rate.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "rate_limit",
          message: "Too many lookup attempts. Wait a few minutes and try again.",
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
    return NextResponse.json(NOT_FOUND_BODY, { status: 404 });
  }

  const raw = body as Partial<GuestLookupInput>;
  const parsed = validateGuestLookupInput({
    reference: String(raw.reference ?? ""),
    contact: String(raw.contact ?? ""),
  });

  if (!parsed.ok) {
    return NextResponse.json(NOT_FOUND_BODY, { status: 404 });
  }

  try {
    const supabase = createAdminClient();
    const result = await lookupGuestReservation(supabase, parsed.value);

    if (!result) {
      return NextResponse.json(NOT_FOUND_BODY, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      reservation: result.summary,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "server",
          message: "We could not look up your booking. Try again or call the farm.",
        },
      },
      { status: 500 },
    );
  }
}
