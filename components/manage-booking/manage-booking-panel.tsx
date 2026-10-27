"use client";
import { Tx } from "@/components/i18n/tx";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { cn } from "@/lib/cn";
import { guestCancelReasons } from "@/lib/manage-booking/guest-cancel";
import type { GuestReservationSummary } from "@/lib/manage-booking/types";
import { guestLookupFieldErrors } from "@/lib/manage-booking/validate-lookup";
import { statusLabels } from "@/lib/staff/reservation-status";
import { contact, menuPrices } from "@/lib/site-config";

type Screen =
  | "search"
  | "loading"
  | "found"
  | "change-info"
  | "cancel"
  | "cancelling"
  | "cancelled"
  | "error"
  | "server-error";

type LookupCredentials = {
  reference: string;
  contact: string;
};

const inputClass =
  "w-full min-h-11 rounded-lg bg-surface px-4 py-3.5 font-body-md text-body-md text-on-surface outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(19,47,29,0.8)]";

export function ManageBookingPanel() {
  const [screen, setScreen] = useState<Screen>("search");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reservation, setReservation] = useState<GuestReservationSummary | null>(null);
  const [credentials, setCredentials] = useState<LookupCredentials>({
    reference: "",
    contact: "",
  });
  const [serverMessage, setServerMessage] = useState("");
  const panelRef = useRef<HTMLHeadingElement>(null);
  const skipInitialFocus = useRef(true);

  useEffect(() => {
    if (skipInitialFocus.current) {
      skipInitialFocus.current = false;
      return;
    }
    panelRef.current?.focus();
  }, [screen]);

  function open(next: Screen) {
    setErrors({});
    setScreen(next);
  }

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reference = String(data.get("reference") ?? "").trim();
    const contactValue = String(data.get("contact") ?? "").trim();
    const nextErrors = guestLookupFieldErrors({ reference, contact: contactValue });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(nextErrors.reference ? "manage-reference" : "manage-contact")?.focus();
      return;
    }

    setCredentials({ reference, contact: contactValue });
    setServerMessage("");
    setScreen("loading");

    try {
      const response = await fetch("/api/manage-booking/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, contact: contactValue }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        reservation?: GuestReservationSummary;
        error?: { message?: string; code?: string };
      };

      if (response.status === 503) {
        setServerMessage(
          payload.error?.message ?? "Online booking management is not available yet.",
        );
        open("server-error");
        return;
      }

      if (!response.ok || !payload.ok || !payload.reservation) {
        open("error");
        return;
      }

      setReservation(payload.reservation);
      open("found");
    } catch {
      setServerMessage("We could not reach the server. Check your connection and try again.");
      open("server-error");
    }
  }

  async function onCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reservation) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const reason = String(data.get("reason") ?? "");
    const message = String(data.get("message") ?? "").trim();

    if (!guestCancelReasons.some((item) => item.value === reason)) {
      setErrors({ reason: "Choose a reason for cancellation." });
      document.getElementById("manage-reason")?.focus();
      return;
    }
    if (message.length > 800) {
      setErrors({ message: "Keep the message to 800 characters." });
      return;
    }

    setErrors({});
    setScreen("cancelling");

    try {
      const response = await fetch("/api/manage-booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: credentials.reference,
          contact: credentials.contact,
          updatedAt: reservation.updatedAt,
          reason,
          message,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        reservation?: GuestReservationSummary;
        error?: { message?: string; code?: string };
      };

      if (response.status === 503) {
        setServerMessage(
          payload.error?.message ?? "Online booking management is not available yet.",
        );
        open("server-error");
        return;
      }

      if (!response.ok || !payload.ok) {
        setServerMessage(
          payload.error?.message ??
            "We could not cancel this booking. Try again or call the farm.",
        );
        if (payload.error?.code === "ineligible") {
          open("found");
          if (payload.error.message) {
            setErrors({ form: payload.error.message });
          }
          return;
        }
        open("server-error");
        return;
      }

      if (payload.reservation) {
        setReservation(payload.reservation);
      }
      open("cancelled");
    } catch {
      setServerMessage("We could not reach the server. Check your connection and try again.");
      open("server-error");
    }
  }

  return (
    <>
      <section className="w-full bg-surface py-space-xl lg:py-space-2xl">
        <SiteContainer className="flex flex-col gap-space-lg">
          <div className="flex flex-col justify-between gap-space-lg lg:flex-row lg:items-end">
            <div className="flex max-w-2xl flex-col gap-space-sm">
              <p className="font-label-lg text-label-lg font-semibold tracking-widest text-secondary uppercase">
                <Tx>Your visit, your way</Tx>
              </p>
              <h1 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
                Manage Your Booking.
              </h1>
              <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                Look up a reservation with your booking reference and the email or
                telephone used when you booked. You can cancel eligible visits here;
                to change a date or party size, contact the farm.
              </p>
            </div>
            <aside className="flex max-w-md flex-col gap-2 rounded-xl bg-surface-container p-space-md">
              <p className="flex items-center gap-2 font-label-sm text-label-sm font-semibold tracking-wider text-primary uppercase">
                <Icon name="help" className="h-[18px] w-[18px]" />
                <Tx>Need a change?</Tx>
              </p>
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                Date and party-size changes are not available online yet. Call{" "}
                {contact.phoneDisplay} or email {contact.email}, or cancel below and
                submit a new booking when online booking is open.
              </p>
            </aside>
          </div>
        </SiteContainer>
      </section>

      <section className="w-full bg-surface-bright py-space-xl lg:py-space-2xl">
        <SiteContainer>
          {screen === "search" ? (
            <SearchScreen errors={errors} headingRef={panelRef} onSubmit={onSearch} />
          ) : null}
          {screen === "loading" ? <LoadingScreen headingRef={panelRef} /> : null}
          {screen === "found" && reservation ? (
            <FoundScreen
              reservation={reservation}
              formError={errors.form}
              headingRef={panelRef}
              onChange={() => open("change-info")}
              onCancel={() => open("cancel")}
              onSearchAgain={() => {
                setReservation(null);
                open("search");
              }}
            />
          ) : null}
          {screen === "change-info" && reservation ? (
            <ChangeInfoScreen
              reservation={reservation}
              headingRef={panelRef}
              onBack={() => open("found")}
            />
          ) : null}
          {screen === "cancel" && reservation ? (
            <CancelScreen
              errors={errors}
              reservation={reservation}
              headingRef={panelRef}
              onBack={() => open("found")}
              onSubmit={onCancel}
            />
          ) : null}
          {screen === "cancelling" ? <CancellingScreen headingRef={panelRef} /> : null}
          {screen === "cancelled" && reservation ? (
            <CancelledScreen reservation={reservation} headingRef={panelRef} onDone={() => open("search")} />
          ) : null}
          {screen === "error" ? (
            <ErrorScreen headingRef={panelRef} onRetry={() => open("search")} />
          ) : null}
          {screen === "server-error" ? (
            <ServerErrorScreen
              headingRef={panelRef}
              message={serverMessage}
              onRetry={() => open(reservation ? "found" : "search")}
            />
          ) : null}
        </SiteContainer>
      </section>
    </>
  );
}

function SearchScreen({
  errors,
  headingRef,
  onSubmit,
}: {
  errors: Record<string, string>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-xl">
      <div className="flex flex-col gap-space-sm text-center">
        <p className="font-label-lg text-label-lg tracking-wider text-secondary uppercase">
          <Tx>Caserío Goikola ledger</Tx>
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-headline-lg text-headline-lg-mobile text-primary outline-none md:text-headline-lg"
        >
          <Tx>Look Up Your Table Request</Tx>
        </h2>
        <p className="mx-auto max-w-xl font-body-md text-body-md text-on-surface-variant">
          Enter the reference from your confirmation (ITU- and 10 characters) together
          with the same email or telephone you used when booking.
        </p>
      </div>
      <div className="flex flex-col gap-space-lg rounded-xl bg-surface-container-low p-space-lg shadow-sm md:p-space-xl">
        <form className="flex flex-col gap-space-md" noValidate onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <label
              className="flex flex-col gap-1 font-label-lg text-label-lg tracking-wider text-primary uppercase sm:flex-row sm:items-center sm:justify-between"
              htmlFor="manage-reference"
            >
              <Tx>Booking reference</Tx>
              <span className="font-normal text-outline normal-case"><Tx>ITU- and 10 characters</Tx></span>
            </label>
            <div className="relative">
              <input
                id="manage-reference"
                name="reference"
                placeholder="ITU-A1B2C3D4E5"
                autoComplete="off"
                aria-invalid={Boolean(errors.reference)}
                aria-describedby={errors.reference ? "manage-reference-error" : undefined}
                className={cn(
                  inputClass,
                  "pr-12 font-mono text-lg tracking-widest uppercase",
                  errors.reference && "ring-1 ring-error",
                )}
              />
              <Icon name="pin" className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-outline" />
            </div>
            {errors.reference ? (
              <p id="manage-reference-error" className="font-body-sm text-body-sm text-error">
                {errors.reference}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-label-lg tracking-wider text-primary uppercase" htmlFor="manage-contact">
              <Tx>Email address or telephone</Tx>
            </label>
            <div className="relative">
              <input
                id="manage-contact"
                name="contact"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.contact)}
                aria-describedby={errors.contact ? "manage-contact-error" : undefined}
                className={cn(inputClass, "pr-12", errors.contact && "ring-1 ring-error")}
              />
              <Icon name="mail" className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-outline" />
            </div>
            {errors.contact ? (
              <p id="manage-contact-error" className="font-body-sm text-body-sm text-error">
                {errors.contact}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-primary-container px-space-lg py-3.5 font-label-lg text-label-lg tracking-wider text-surface uppercase hover:bg-primary"
          >
            <Tx>Find my booking</Tx>
            <Icon name="arrow-right" className="h-[18px] w-[18px]" />
          </button>
        </form>
        <p className="flex flex-col justify-between gap-space-sm border-t border-outline-variant/40 pt-space-md font-body-sm text-body-sm text-on-surface-variant sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="help" className="h-[18px] w-[18px] text-secondary" />
            <Tx>We cannot look up a booking without both fields.</Tx>
          </span>
          <a href={contact.phoneHref} className="font-medium text-primary hover:text-secondary">
            Call the farm ({contact.phoneDisplay})
          </a>
        </p>
      </div>
    </div>
  );
}

function LoadingScreen({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-headline-md text-headline-md text-primary outline-none"
      >
        Looking up your booking…
      </h2>
      <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
        <Tx>Verifying your reference and contact details.</Tx>
      </p>
    </div>
  );
}

function CancellingScreen({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-headline-md text-headline-md text-primary outline-none"
      >
        Cancelling your reservation…
      </h2>
      <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
        <Tx>This may take a moment while tables and capacity are updated.</Tx>
      </p>
    </div>
  );
}

function FoundScreen({
  reservation,
  formError,
  headingRef,
  onChange,
  onCancel,
  onSearchAgain,
}: {
  reservation: GuestReservationSummary;
  formError?: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: () => void;
  onCancel: () => void;
  onSearchAgain: () => void;
}) {
  const adultTotal = reservation.adultCount * menuPrices.adult;
  const childTotal = reservation.childCount * menuPrices.child;
  const settingLabel =
    reservation.tableLabels.length > 0
      ? reservation.tableLabels.join(", ")
      : "Table to be confirmed";

  return (
    <div className="flex flex-col gap-space-xl">
      <div className="flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-surface-container p-space-md">
        <div className="flex flex-wrap items-center gap-space-sm">
          <span className="rounded bg-secondary px-2.5 py-1 font-label-sm text-label-sm font-semibold tracking-wider text-surface uppercase">
            {statusLabels[reservation.status]}
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Reference:{" "}
            <strong className="font-mono tracking-wider text-primary">{reservation.reference}</strong>
          </p>
        </div>
        <button
          type="button"
          className="min-h-11 font-label-sm text-label-sm tracking-wider text-secondary uppercase hover:text-primary"
          onClick={onSearchAgain}
        >
          <Tx>Look up another</Tx>
        </button>
      </div>
      {formError ? (
        <p role="alert" className="rounded-lg bg-error-container px-space-md py-space-sm font-body-sm text-body-sm text-on-error-container">
          {formError}
        </p>
      ) : null}
      <div className="grid grid-cols-1 items-start gap-gutter lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-8">
          <article className="flex flex-col gap-space-lg rounded-xl bg-surface-container-low p-space-lg shadow-sm md:p-space-xl">
            <div className="flex flex-col justify-between gap-space-md sm:flex-row">
              <div>
                <p className="font-label-sm text-label-sm tracking-wider text-secondary uppercase"><Tx>Host name</Tx></p>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-headline-md text-headline-md font-medium text-primary outline-none"
                >
                  {reservation.guestDisplayName}
                </h2>
              </div>
              <div className="sm:text-right">
                <p className="font-label-sm text-label-sm tracking-wider text-outline uppercase">Service</p>
                <p className="font-title-editorial text-title-editorial font-medium text-primary italic">
                  {reservation.shiftName ?? "Sagardotegi service"}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-1 gap-space-md md:grid-cols-3">
              <Metric
                icon="calendar"
                label="Date & arrival"
                value={reservation.serviceDateLabel}
                detail={`${reservation.arrivalTime} arrival`}
              />
              <Metric
                icon="users"
                label="Table party"
                value={`${reservation.partySize} guests total`}
                detail={`${reservation.adultCount} adults · ${reservation.childCount} child`}
              />
              <Metric icon="restaurant" label="Setting" value={settingLabel} detail="Assigned tables" />
            </dl>
            <div className="flex flex-col gap-space-sm">
              <h3 className="font-label-lg text-label-lg tracking-wider text-primary uppercase">
                <Tx>Menu estimate</Tx>
              </h3>
              <div className="flex flex-col gap-3 rounded-lg bg-surface p-space-md">
                <PriceRow
                  name="Traditional sagardotegi menu"
                  quantity={reservation.adultCount}
                  amount={adultTotal}
                  detail="Published menu prices — final bill at the farm."
                />
                {reservation.childCount > 0 ? (
                  <PriceRow
                    name="Children’s farm menu"
                    quantity={reservation.childCount}
                    amount={childTotal}
                    detail={`Ages ${menuPrices.childAges}.`}
                  />
                ) : null}
                <p className="flex items-center justify-between gap-space-md border-t border-outline-variant/40 pt-space-md font-semibold text-primary">
                  <span className="font-label-lg text-label-lg tracking-wider uppercase"><Tx>Estimate</Tx></span>
                  <span className="font-headline-sm text-headline-sm">€{adultTotal + childTotal}</span>
                </p>
              </div>
            </div>
            {!reservation.canCancel && reservation.cancelBlockedReason ? (
              <p className="rounded-lg bg-surface-container p-space-md font-body-sm text-body-sm text-on-surface-variant">
                {reservation.cancelBlockedReason}
              </p>
            ) : null}
            <div className="flex flex-col gap-space-sm sm:flex-row">
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-secondary px-space-lg py-3 font-label-lg text-label-lg tracking-wider text-surface uppercase hover:bg-on-secondary-container"
                onClick={onChange}
              >
                <Icon name="edit" className="h-[18px] w-[18px]" />
                <Tx>Change date or party</Tx>
              </button>
              <button
                type="button"
                disabled={!reservation.canCancel}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-surface-container px-space-md py-3 font-label-lg text-label-lg tracking-wider text-error uppercase hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-50"
                onClick={onCancel}
              >
                <Icon name="close" className="h-[18px] w-[18px]" />
                <Tx>Cancel reservation</Tx>
              </button>
            </div>
          </article>
        </div>
        <aside className="flex flex-col gap-space-md lg:col-span-4">
          <article className="overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
            <div className="relative h-56">
              <ResponsiveImage
                src="/images/manage/cellar.jpg"
                alt="Lantern-lit chestnut cider barrels and a long table in the Caserío Goikola cellar."
                sizes="(min-width: 1024px) 30vw, 100vw"
              />
            </div>
            <div className="flex flex-col gap-space-sm p-space-lg">
              <p className="font-label-sm text-label-sm tracking-wider text-secondary uppercase"><Tx>Cellar etiquette</Tx></p>
              <h3 className="font-headline-sm text-headline-sm text-primary"><Tx>The kupela ritual</Tx></h3>
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                During service the call is “Txotx!”. Guests step to the barrels for cider from the tap.
              </p>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}

function ChangeInfoScreen({
  reservation,
  headingRef,
  onBack,
}: {
  reservation: GuestReservationSummary;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-lg">
      <button
        type="button"
        className="inline-flex min-h-11 w-fit items-center gap-1.5 font-label-sm text-label-sm tracking-wider text-secondary uppercase hover:text-primary"
        onClick={onBack}
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        <Tx>Back to booking</Tx>
      </button>
      <article className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-sm md:p-space-xl">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-headline-lg text-headline-lg-mobile text-primary outline-none md:text-headline-lg"
        >
          <Tx>Changing Your Visit</Tx>
        </h2>
        <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
          Online changes to date or party size for reference{" "}
          <span className="font-mono font-semibold text-primary">{reservation.reference}</span> are
          not available yet. That keeps cellar capacity and table assignments accurate.
        </p>
        <ul className="list-disc space-y-2 pl-5 font-body-sm text-body-sm text-on-surface-variant">
          <li>
            Call{" "}
            <a href={contact.phoneHref} className="font-semibold text-primary underline">
              {contact.phoneDisplay}
            </a>{" "}
            during service hours.
          </li>
          <li>
            Email{" "}
            <a href={`mailto:${contact.email}`} className="font-semibold text-primary underline">
              {contact.email}
            </a>
            .
          </li>
          <li>
            If your plans changed entirely, you may{" "}
            {reservation.canCancel ? "cancel this booking below" : "ask the farm to cancel"} and
            submit a new request when booking is open.
          </li>
        </ul>
      </article>
    </div>
  );
}

function CancelScreen({
  reservation,
  errors,
  headingRef,
  onBack,
  onSubmit,
}: {
  reservation: GuestReservationSummary;
  errors: Record<string, string>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-lg">
      <button
        type="button"
        className="inline-flex min-h-11 w-fit items-center gap-1.5 font-label-sm text-label-sm tracking-wider text-secondary uppercase hover:text-primary"
        onClick={onBack}
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        <Tx>Back to booking</Tx>
      </button>
      <form
        className="flex flex-col gap-space-lg rounded-xl bg-surface-container-low p-space-lg shadow-sm md:p-space-xl"
        noValidate
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-space-sm">
          <p className="font-label-sm text-label-sm font-semibold tracking-wider text-error uppercase">
            <Tx>Confirm cancellation</Tx>
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-headline-lg text-headline-lg-mobile text-primary outline-none md:text-headline-lg"
          >
            <Tx>Cancel This Reservation</Tx>
          </h2>
          <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
            {reservation.serviceDateLabel} at {reservation.arrivalTime} · {reservation.partySize}{" "}
            guests · {reservation.reference}. This releases your table and cannot be undone online.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label-lg text-label-lg tracking-wider text-primary uppercase" htmlFor="manage-reason">
            Reason
          </label>
          <select
            id="manage-reason"
            name="reason"
            defaultValue=""
            aria-invalid={Boolean(errors.reason)}
            className={cn(inputClass, "appearance-none", errors.reason && "ring-1 ring-error")}
          >
            <option value="" disabled>
              Choose a reason…
            </option>
            {guestCancelReasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
          {errors.reason ? <p className="font-body-sm text-body-sm text-error">{errors.reason}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label-lg text-label-lg tracking-wider text-primary uppercase" htmlFor="manage-message">
            <Tx>Optional message</Tx>
          </label>
          <textarea
            id="manage-message"
            name="message"
            rows={3}
            maxLength={800}
            placeholder="Anything else the farm should know."
            aria-invalid={Boolean(errors.message)}
            className={inputClass}
          />
          {errors.message ? <p className="font-body-sm text-body-sm text-error">{errors.message}</p> : null}
        </div>
        <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-error px-space-lg py-3.5 font-label-lg text-label-lg tracking-wider text-on-error uppercase hover:opacity-90"
          >
            <Icon name="check" className="h-[18px] w-[18px]" />
            <Tx>Confirm cancellation</Tx>
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg bg-surface px-space-lg py-3.5 font-label-lg text-label-lg tracking-wider text-primary uppercase hover:bg-surface-container"
            onClick={onBack}
          >
            <Tx>Keep reservation</Tx>
          </button>
        </div>
      </form>
    </div>
  );
}

function CancelledScreen({
  reservation,
  headingRef,
  onDone,
}: {
  reservation: GuestReservationSummary;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onDone: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="flex flex-col items-center gap-space-md rounded-xl bg-surface-container-low p-space-xl shadow-sm md:p-space-2xl">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <Icon name="check" className="h-9 w-9" />
        </span>
        <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
          <Tx>Cancellation recorded</Tx>
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-headline-lg text-headline-lg-mobile text-primary outline-none md:text-headline-lg"
        >
          <Tx>Your table has been released</Tx>
        </h2>
        <p className="font-mono text-lg font-bold tracking-widest text-on-surface-variant">
          {reservation.reference}
        </p>
        <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
          {reservation.serviceDateLabel} · status {statusLabels[reservation.status]}. If you still
          plan to visit, call the farm or submit a new booking when available.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-sm">
          <button
            type="button"
            className="min-h-11 rounded-lg bg-primary px-space-lg py-3.5 font-label-lg text-label-lg tracking-wider text-on-primary uppercase hover:bg-primary-container"
            onClick={onDone}
          >
            <Tx>Look up another booking</Tx>
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg bg-surface px-space-lg py-3.5 font-label-lg text-label-lg tracking-wider text-on-surface uppercase hover:bg-surface-container"
          >
            <Tx>Estate home</Tx>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({
  headingRef,
  onRetry,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-sm md:p-space-xl">
        <div className="flex items-start gap-space-md">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
            <Icon name="search" className="h-6 w-6" />
          </span>
          <div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="font-headline-md text-headline-md text-primary outline-none"
            >
              <Tx>No matching booking found</Tx>
            </h2>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              Check the reference and the email or telephone from your confirmation. If details are
              correct, call the farm — we cannot tell you which field did not match.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-space-md">
          <button
            type="button"
            className="min-h-11 rounded-lg bg-primary px-space-lg py-3 font-label-lg text-label-lg tracking-wider text-on-primary uppercase hover:bg-primary-container"
            onClick={onRetry}
          >
            <Tx>Try again</Tx>
          </button>
          <a
            href={contact.phoneHref}
            className="inline-flex min-h-11 items-center rounded-lg bg-surface-container px-space-md py-3 font-label-lg text-label-lg tracking-wider text-primary uppercase hover:bg-surface-container-high"
          >
            <Tx>Contact the farm</Tx>
          </a>
        </div>
      </div>
    </div>
  );
}

function ServerErrorScreen({
  message,
  headingRef,
  onRetry,
}: {
  message: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-sm md:p-space-xl">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-headline-md text-headline-md text-primary outline-none"
        >
          <Tx>Something went wrong</Tx>
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
        <button
          type="button"
          className="min-h-11 w-fit rounded-lg bg-primary px-space-lg py-3 font-label-lg text-label-lg tracking-wider text-on-primary uppercase"
          onClick={onRetry}
        >
          <Tx>Try again</Tx>
        </button>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: "calendar" | "users" | "restaurant";
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface p-space-md">
      <dt className="flex items-center gap-1.5 font-label-sm text-label-sm tracking-wider text-outline uppercase">
        <Icon name={icon} className="h-4 w-4 text-secondary" />
        {label}
      </dt>
      <dd className="font-headline-sm text-headline-sm text-primary">{value}</dd>
      <dd className="font-body-sm text-body-sm text-on-surface-variant">{detail}</dd>
    </div>
  );
}

function PriceRow({
  name,
  quantity,
  amount,
  detail,
}: {
  name: string;
  quantity: number;
  amount: number;
  detail: string;
}) {
  return (
    <div>
      <p className="flex items-center justify-between gap-space-md font-body-md text-body-md text-on-surface">
        <span>
          <span className="font-title-editorial text-title-editorial text-primary italic">{name}</span>{" "}
          <span className="font-mono text-outline">× {quantity}</span>
        </span>
        <span className="font-mono font-medium">€{amount}</span>
      </p>
      <p className="pl-1 font-body-sm text-body-sm text-on-surface-variant">{detail}</p>
    </div>
  );
}
