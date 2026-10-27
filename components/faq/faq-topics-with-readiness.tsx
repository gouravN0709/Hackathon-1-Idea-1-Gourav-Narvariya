import { connection } from "next/server";
import { FaqTopics } from "@/components/faq/faq-topics";
import { getPublicBookingReadiness } from "@/lib/booking/public-readiness";

export async function FaqTopicsWithReadiness() {
  await connection();
  const readiness = await getPublicBookingReadiness();
  return <FaqTopics bookingLive={readiness.live} />;
}

export function FaqTopicsFallback() {
  return <FaqTopics bookingLive={false} />;
}
