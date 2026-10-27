import { connection } from "next/server";
import { NextResponse } from "next/server";
import { getPublicBookingReadiness } from "@/lib/booking/public-readiness";

export async function GET() {
  await connection();

  const readiness = await getPublicBookingReadiness();
  return NextResponse.json(readiness);
}
