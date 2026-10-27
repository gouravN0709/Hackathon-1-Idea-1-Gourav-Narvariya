import Link from "next/link";
import { contact } from "@/lib/site-config";

export function FaqHowToBookAnswer({ live }: { live: boolean }) {
  if (live) {
    return (
      <p>
        Tables are limited, so booking ahead is strongly recommended. The{" "}
        <Link href="/book" className="font-medium text-primary underline underline-offset-4">
          Book a Visit
        </Link>{" "}
        form saves a reservation request when you confirm on the review step. You
        receive a reference (ITU-…) to keep. This site does not email confirmations
        yet. For urgent enquiries, call {contact.phoneDisplay} or email{" "}
        <a href={`mailto:${contact.email}`} className="font-medium text-primary underline underline-offset-4">
          {contact.email}
        </a>
        .
      </p>
    );
  }

  return (
    <p>
      Tables are limited, so contacting the farm ahead of a visit is strongly
      recommended. The{" "}
      <Link href="/book" className="font-medium text-primary underline underline-offset-4">
        Book a Visit
      </Link>{" "}
      form checks a request in your browser. Live submission stays off until the
      reservation database and server credentials are ready. Call {contact.phoneDisplay}{" "}
      or email{" "}
      <a href={`mailto:${contact.email}`} className="font-medium text-primary underline underline-offset-4">
        {contact.email}
      </a>{" "}
      to enquire with the farm.
    </p>
  );
}

export function FaqManageBookingAnswer({ live }: { live: boolean }) {
  if (live) {
    return (
      <p>
        <Link
          href="/manage-booking"
          className="font-medium text-primary underline underline-offset-4"
        >
          Manage your booking
        </Link>{" "}
        looks up real reservations when you enter your ITU- reference and the email
        or phone used at booking. You can cancel eligible pending or confirmed
        requests online. Changing date or party size is not available online; call{" "}
        {contact.phoneDisplay} during service hours.
      </p>
    );
  }

  return (
    <p>
      <Link
        href="/manage-booking"
        className="font-medium text-primary underline underline-offset-4"
      >
        Manage your booking
      </Link>{" "}
      needs server credentials and applied database migrations before it can load
      real reservations. Until online booking is live, contact the farm directly
      about any booking they already hold.
    </p>
  );
}

export function FaqChangeOrCancelAnswer({ live }: { live: boolean }) {
  if (live) {
    return (
      <p>
        Use{" "}
        <Link
          href="/manage-booking"
          className="font-medium text-primary underline underline-offset-4"
        >
          manage your booking
        </Link>{" "}
        to cancel eligible reservations online with your reference and contact
        details. For date or party-size changes, call {contact.phoneDisplay} or
        email {contact.email}. This site does not publish a detailed cancellation
        policy; the farm confirms rules when they accept your request.
      </p>
    );
  }

  return (
    <p>
      Online cancellation is unavailable until booking management is connected to
      the database. Contact the farm about any booking they already hold. This site
      does not publish a cancellation policy.
    </p>
  );
}

export function homeBookingCtaNote(live: boolean): string | null {
  if (live) {
    return "Online table requests are open when the form shows live submission on the review step.";
  }
  return "The booking form is preview-only until the farm enables the reservation database.";
}
