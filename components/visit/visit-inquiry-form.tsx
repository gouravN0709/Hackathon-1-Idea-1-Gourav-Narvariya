"use client";
import { Tx } from "@/components/i18n/tx";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { buildValidationMessages } from "@/lib/validation-messages";
import { adultMin, adultMax, childMin, childMax } from "@/lib/booking/constants";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import {
  formatServiceDate,
  parseDateInput,
  serviceDateError,
} from "@/lib/service-calendar";

const guestOptions = [
  { value: "2", label: "2 diners" },
  { value: "4", label: "4 diners" },
  { value: "6", label: "6 diners" },
  { value: "8", label: "8 or more" },
] as const;

const serviceOptions = [
  { value: "menu", label: "Traditional sagardotegi menu" },
  { value: "tasting", label: "Cellar tasting and txotx" },
  { value: "vegetarian", label: "Vegetarian preferences" },
  { value: "gathering", label: "Family farm gathering" },
] as const;

type Feedback = {
  guests: string;
  service: string;
  date: string;
};

const fieldClass =
  "w-full min-h-11 appearance-none rounded-lg bg-surface-container-low px-space-md py-space-md pr-10 font-body-md text-body-md text-on-surface outline-none focus:bg-surface focus:ring-1 focus:ring-primary";

export function VisitInquiryForm() {
  const dateMessages = useMemo(
    () =>
      buildValidationMessages({
        adultMin,
        adultMax,
        childMin,
        childMax,
      }),
    [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const feedbackId = useId();

  useEffect(() => {
    if (feedback) {
      statusRef.current?.focus();
    }
  }, [feedback]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const guests = String(data.get("guests") ?? "");
    const service = String(data.get("service") ?? "");
    const dateValue = String(data.get("date") ?? "");
    const nextErrors: Record<string, string> = {};

    if (!guestOptions.some((option) => option.value === guests)) {
      nextErrors.guests = "Choose a party size.";
    }
    if (!serviceOptions.some((option) => option.value === service)) {
      nextErrors.service = "Choose what you would like to ask about.";
    }

    const dateMessage = serviceDateError(dateValue, {
      chooseArrivalDate: dateMessages.chooseArrivalDate,
      datePast: dateMessages.datePast,
      closedWeekdays: dateMessages.closedWeekdays,
    });
    if (dateMessage) {
      nextErrors.date = dateMessage;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback(null);
      const firstInvalid = ["guests", "service", "date"].find((field) => nextErrors[field]);
      if (firstInvalid) {
        document.getElementById(`visit-${firstInvalid}`)?.focus();
      }
      return;
    }

    const date = parseDateInput(dateValue);
    if (!date) {
      return;
    }

    setFeedback({
      guests: guestOptions.find((option) => option.value === guests)?.label ?? guests,
      service: serviceOptions.find((option) => option.value === service)?.label ?? service,
      date: formatServiceDate(date),
    });
  }

  return (
    <div className="space-y-space-lg rounded-xl bg-surface p-space-lg shadow-md md:p-space-xl">
      <div className="flex flex-col justify-between gap-space-md border-b border-outline-variant/40 pb-space-md md:flex-row md:items-center">
        <div className="space-y-1">
          <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            <Tx>Immediate dining enquiry</Tx>
          </p>
          <h3 className="font-headline-md text-headline-md text-primary">
            <Tx>Check a midday date</Tx>
          </h3>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          <Tx>Does not reserve a table</Tx>
        </p>
      </div>

      <form className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4" noValidate onSubmit={onSubmit}>
        <div className="space-y-1">
          <label
            className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase"
            htmlFor="visit-guests"
          >
            Guests
          </label>
          <div className="relative">
            <select
              id="visit-guests"
              name="guests"
              defaultValue=""
              aria-invalid={Boolean(errors.guests)}
              aria-describedby={errors.guests ? "visit-guests-error" : undefined}
              className={cn(fieldClass, errors.guests && "ring-1 ring-error")}
            >
              <option value="" disabled>
                <Tx>Choose party size</Tx>
              </option>
              {guestOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="users"
              className="pointer-events-none absolute top-3.5 right-3 h-[18px] w-[18px] text-outline"
            />
          </div>
          {errors.guests ? (
            <p id="visit-guests-error" className="font-body-sm text-body-sm text-error">
              {errors.guests}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase"
            htmlFor="visit-service"
          >
            <Tx>Preference</Tx>
          </label>
          <div className="relative">
            <select
              id="visit-service"
              name="service"
              defaultValue=""
              aria-invalid={Boolean(errors.service)}
              aria-describedby={errors.service ? "visit-service-error" : undefined}
              className={cn(fieldClass, errors.service && "ring-1 ring-error")}
            >
              <option value="" disabled>
                <Tx>Choose a preference</Tx>
              </option>
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="restaurant"
              className="pointer-events-none absolute top-3.5 right-3 h-[18px] w-[18px] text-outline"
            />
          </div>
          {errors.service ? (
            <p id="visit-service-error" className="font-body-sm text-body-sm text-error">
              {errors.service}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase"
            htmlFor="visit-date"
          >
            <Tx>Arrival date</Tx>
          </label>
          <input
            id="visit-date"
            name="date"
            type="date"
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "visit-date-error" : "visit-date-hint"}
            className={cn(fieldClass, "pr-space-md", errors.date && "ring-1 ring-error")}
          />
          <p id="visit-date-hint" className="font-body-sm text-body-sm text-on-surface-variant">
            <Tx>Thursday to Sunday only.</Tx>
          </p>
          {errors.date ? (
            <p id="visit-date-error" className="font-body-sm text-body-sm text-error">
              {errors.date}
            </p>
          ) : null}
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-space-md py-space-md font-label-lg text-label-lg tracking-wider text-on-primary uppercase shadow-sm transition-colors hover:bg-primary-container"
          >
            <Tx>Check date</Tx>
          </button>
        </div>
      </form>

      {feedback ? (
        <div
          ref={statusRef}
          id={feedbackId}
          tabIndex={-1}
          role="status"
          className="flex flex-col justify-between gap-space-md rounded-lg bg-surface-container-high p-space-md text-primary sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-2">
            <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-surface-tint" />
            <p className="font-body-md text-body-md">
              {feedback.date} · {feedback.guests} · {feedback.service}. This check
              stayed in your browser. No table was requested or reserved.{" "}
              <Link href="/book" className="underline underline-offset-4">
                <Tx>Continue to the booking form</Tx>
              </Link>
              , which also does not send a reservation.
            </p>
          </div>
          <button
            type="button"
            className="min-h-11 shrink-0 font-label-sm text-label-sm text-secondary uppercase"
            onClick={() => setFeedback(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
