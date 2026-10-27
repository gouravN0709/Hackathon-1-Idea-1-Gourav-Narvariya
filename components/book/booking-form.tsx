"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import {
  adultMax,
  adultMin,
  arrivalTimes,
  childMax,
  childMin,
} from "@/lib/booking/constants";
import { validateBookingRequest } from "@/lib/booking/validate-request";
import { formatServiceDate, parseDateInput } from "@/lib/service-calendar";
import { contact, menuPrices } from "@/lib/site-config";

type Preview = {
  date: string;
  dateValue: string;
  arrival: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; reference: string }
  | { status: "error"; message: string };

const inputClass =
  "w-full min-h-11 rounded-lg bg-surface-container-low px-4 py-3 font-body-md text-body-md text-on-surface shadow-inner outline-none placeholder:text-outline focus:bg-surface focus:ring-1 focus:ring-primary";

export function BookingForm() {
  const [view, setView] = useState<"form" | "preview">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [arrival, setArrival] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [liveBooking, setLiveBooking] = useState(false);
  const [liveReason, setLiveReason] = useState<string | null>(null);
  const [slotMessage, setSlotMessage] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const statusRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryId = useId();

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/bookings/status");
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { live?: boolean; reason?: string | null };
        if (!cancelled) {
          setLiveBooking(Boolean(payload.live));
          setLiveReason(payload.reason ?? null);
        }
      } catch {
        // Keep prototype mode when status cannot be loaded.
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!liveBooking || !serviceDate || !arrival) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function checkSlot() {
      try {
        const params = new URLSearchParams({ date: serviceDate, arrival });
        const response = await fetch(`/api/bookings/availability?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok || cancelled) {
          return;
        }
        const payload = (await response.json()) as {
          bookable?: boolean;
          message?: string | null;
        };
        if (cancelled) {
          return;
        }
        if (payload.bookable === false && payload.message) {
          setSlotMessage(payload.message);
        } else if (payload.bookable === true) {
          setSlotMessage(null);
        }
      } catch {
        // Ignore abort and network errors; server validates on submit.
      }
    }

    const timer = window.setTimeout(() => {
      void checkSlot();
    }, 400);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [liveBooking, serviceDate, arrival]);

  useEffect(() => {
    if (view === "preview") {
      statusRef.current?.focus();
    }
  }, [view]);

  function validate(form: HTMLFormElement) {
    const data = new FormData(form);
    const dateValue = String(data.get("date") ?? "");
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const phone = String(data.get("phone") ?? "");
    const notes = String(data.get("notes") ?? "");
    const consent = data.get("consent") === "yes";

    const parsed = validateBookingRequest({
      date: dateValue,
      arrival,
      adults,
      children,
      name,
      email,
      phone,
      notes,
    });

    const nextErrors = parsed.ok ? {} : { ...parsed.errors };
    if (!consent) {
      nextErrors.consent = liveBooking
        ? "Confirm that you agree to submit this reservation request."
        : "Confirm that you understand this form does not send a reservation.";
    }

    return {
      nextErrors,
      dateValue,
      name: parsed.ok ? parsed.value.name : name.trim(),
      email: parsed.ok ? parsed.value.email : email.trim(),
      phone: parsed.ok ? parsed.value.phone : phone.trim(),
      notes: parsed.ok ? parsed.value.notes : notes.trim(),
    };
  }

  function showPreview(form: HTMLFormElement) {
    const { nextErrors, dateValue, name, email, phone, notes } = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setView("form");
      const first = ["date", "arrival", "adults", "name", "email", "phone", "notes", "consent"].find(
        (field) => nextErrors[field],
      );
      if (first) {
        document.getElementById(`book-${first}`)?.focus();
      }
      return;
    }

    const date = parseDateInput(dateValue);
    if (!date) {
      return;
    }

    setSubmitState({ status: "idle" });
    setPreview({
      date: formatServiceDate(date),
      dateValue,
      arrival,
      adults,
      children,
      name,
      email,
      phone,
      notes,
    });
    setView("preview");
  }

  async function confirmReservation() {
    if (!preview || !liveBooking || submitState.status === "loading") {
      return;
    }

    setSubmitState({ status: "loading" });

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: preview.dateValue,
          arrival: preview.arrival,
          adults: preview.adults,
          children: preview.children,
          name: preview.name,
          email: preview.email,
          phone: preview.phone,
          notes: preview.notes,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        reference?: string;
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok || !payload.reference) {
        setSubmitState({
          status: "error",
          message:
            payload.error?.message ??
            "We could not save your request. Try again or call the farm.",
        });
        return;
      }

      setSubmitState({ status: "success", reference: payload.reference });
    } catch {
      setSubmitState({
        status: "error",
        message: "We could not save your request. Try again or call the farm.",
      });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    showPreview(event.currentTarget);
  }

  const adultTotal = (preview?.adults ?? adults) * menuPrices.adult;
  const childTotal = (preview?.children ?? children) * menuPrices.child;

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface p-space-lg shadow-sm md:p-space-xl">
      <div className="mb-space-lg flex flex-col gap-space-md border-b border-outline-variant/30 pb-space-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            Cellar table booking
          </p>
          <h2 className="font-headline-sm text-headline-sm text-primary">Table request form</h2>
        </div>
        <div className="flex items-center rounded-lg bg-surface-container p-1 font-label-sm text-label-sm" role="tablist" aria-label="Form and feedback">
          <button
            type="button"
            role="tab"
            aria-selected={view === "form"}
            className={cn(
              "min-h-11 rounded px-3 py-1.5",
              view === "form"
                ? "bg-surface font-semibold text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            )}
            onClick={() => setView("form")}
          >
            Form
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "preview"}
            className={cn(
              "min-h-11 rounded px-3 py-1.5",
              view === "preview"
                ? "bg-surface font-semibold text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            )}
            onClick={() => {
              const form = document.getElementById("reservation-form");
              if (form instanceof HTMLFormElement) {
                showPreview(form);
              }
            }}
          >
            {liveBooking ? "Review" : "Feedback preview"}
          </button>
        </div>
      </div>

        <form
          id="reservation-form"
          className={cn("flex flex-col gap-space-lg", view === "preview" && "hidden")}
          noValidate
          onSubmit={onSubmit}
          aria-hidden={view === "preview"}
        >
          <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
            {liveBooking
              ? "Use this form to request a cellar table. When you confirm on the next step, your request is saved securely on the farm’s reservation system."
              : "Use this form to assemble a visit request. Live submission stays off until the reservation database, shifts, tables, and server credentials are verified."}
            {!liveBooking && liveReason ? (
              <span className="mt-2 block text-body-sm">{liveReason}</span>
            ) : null}
          </p>

          {Object.keys(errors).length > 0 ? (
            <div id={errorSummaryId} role="alert" className="rounded-lg bg-error-container p-space-md text-on-error-container">
              <p className="font-label-sm text-label-sm uppercase">Please correct the form</p>
              <ul className="mt-space-xs list-disc pl-5 font-body-sm text-body-sm">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between font-label-lg text-label-lg tracking-wider text-primary uppercase" htmlFor="book-date">
                Date of visit
                <span className="font-normal text-secondary normal-case">Thu–Sun</span>
              </label>
              <input
                id="book-date"
                name="date"
                type="date"
                value={serviceDate}
                onChange={(event) => {
                  setServiceDate(event.target.value);
                  setSlotMessage(null);
                }}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={
                  errors.date || slotMessage ? "book-date-error" : "book-date-hint"
                }
                className={cn(
                  inputClass,
                  (errors.date || slotMessage) && "ring-1 ring-error",
                )}
              />
              <p id="book-date-hint" className="font-body-sm text-body-sm text-on-surface-variant">
                Cellar doors follow Thursday through Sunday service.
              </p>
              {errors.date || slotMessage ? (
                <p id="book-date-error" className="font-body-sm text-body-sm text-error">
                  {errors.date ?? slotMessage}
                </p>
              ) : null}
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="font-label-lg text-label-lg tracking-wider text-primary uppercase">
                Arrival window
              </legend>
              <div className="grid grid-cols-3 gap-2" id="book-arrival">
                {arrivalTimes.map((time) => (
                  <label key={time} className="cursor-pointer">
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="arrival"
                      value={time}
                      checked={arrival === time}
                      onChange={() => {
                        setArrival(time);
                        setSlotMessage(null);
                      }}
                    />
                    <span className="flex min-h-11 items-center justify-center rounded-lg bg-surface-container-low px-2 py-3 text-center font-label-lg text-label-lg peer-checked:bg-primary-container peer-checked:text-surface peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                      {time}
                    </span>
                  </label>
                ))}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Service runs {`13:00–16:00`}.
              </p>
              {errors.arrival ? (
                <p className="font-body-sm text-body-sm text-error">{errors.arrival}</p>
              ) : null}
            </fieldset>
          </div>

          <div className="grid grid-cols-1 gap-space-md rounded-xl bg-surface-container-low p-space-md sm:grid-cols-2">
            <Counter
              id="book-adults"
              label="Adults"
              price={`€${menuPrices.adult} / guest`}
              hint="Includes the published txotx menu."
              value={adults}
              min={adultMin}
              max={adultMax}
              error={errors.adults}
              onChange={setAdults}
            />
            <Counter
              id="book-children"
              label={`Children (${menuPrices.childAges})`}
              price={`€${menuPrices.child} / guest`}
              hint="Children’s farm menu."
              value={children}
              min={childMin}
              max={childMax}
              error={errors.children}
              onChange={setChildren}
            />
          </div>

          <div className="flex flex-col gap-space-md">
            <Field
              id="book-name"
              name="name"
              label="Full name"
              required
              autoComplete="name"
              placeholder="Your name"
              error={errors.name}
            />
            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
              <Field
                id="book-email"
                name="email"
                type="email"
                label="Email address"
                required
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email}
              />
              <Field
                id="book-phone"
                name="phone"
                type="tel"
                label="Telephone"
                required
                autoComplete="tel"
                placeholder="+34 …"
                error={errors.phone}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between font-label-lg text-label-lg tracking-wider text-primary uppercase" htmlFor="book-notes">
              Dietary notes
              <span className="font-normal text-outline normal-case">optional</span>
            </label>
            <textarea
              id="book-notes"
              name="notes"
              rows={3}
              maxLength={800}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? "book-notes-error" : undefined}
              placeholder="Allergies, high chairs, or access notes."
              className={cn(inputClass, "resize-y", errors.notes && "ring-1 ring-error")}
            />
            {errors.notes ? (
              <p id="book-notes-error" className="font-body-sm text-body-sm text-error">
                {errors.notes}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-3">
            <input
              id="book-consent"
              name="consent"
              type="checkbox"
              value="yes"
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? "book-consent-error" : undefined}
              className="mt-1 h-5 w-5 accent-primary"
            />
            <label className="font-body-sm text-body-sm leading-snug text-on-surface-variant" htmlFor="book-consent">
              {liveBooking ? (
                <>
                  I agree to submit this reservation request with the details above. The{" "}
                  <Link href="/legal" className="text-primary underline underline-offset-4">
                    privacy and hospitality notes
                  </Link>{" "}
                  on this site are still placeholders.
                </>
              ) : (
                <>
                  I understand this form stays in my browser and does not create a
                  reservation. The{" "}
                  <Link href="/legal" className="text-primary underline underline-offset-4">
                    privacy and hospitality notes
                  </Link>{" "}
                  on this site are still placeholders.
                </>
              )}
            </label>
          </div>
          {errors.consent ? (
            <p id="book-consent-error" className="font-body-sm text-body-sm text-error">
              {errors.consent}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-lg bg-primary-container px-space-lg py-4 font-label-lg text-label-lg tracking-wider text-surface uppercase shadow-md transition-colors hover:bg-primary"
            >
              <Icon name="wine" className="h-5 w-5" />
              Review midday request
            </button>
            <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
              Reviewing the form does not reserve a table. Contact{" "}
              <a href={contact.phoneHref} className="text-primary underline underline-offset-4">
                {contact.phoneDisplay}
              </a>{" "}
              or{" "}
              <a href={`mailto:${contact.email}`} className="text-primary underline underline-offset-4">
                {contact.email}
              </a>{" "}
              for a real enquiry.
            </p>
          </div>
        </form>
        {preview ? (
        <div className={cn("flex flex-col gap-space-lg", view === "form" && "hidden")} role="tabpanel">
          <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-lg">
            <p className="inline-flex w-fit items-center gap-2 rounded-lg bg-surface px-3 py-1 font-label-sm text-label-sm font-semibold tracking-wider text-secondary uppercase">
              <Icon name="clock" className="h-4 w-4" />
              {submitState.status === "success"
                ? "Request received"
                : liveBooking
                  ? "Review before sending"
                  : "Prototype preview · not received"}
            </p>
            <h3
              ref={statusRef}
              tabIndex={-1}
              className="font-headline-md text-headline-md text-primary outline-none"
            >
              {submitState.status === "success"
                ? "Your reservation request was saved."
                : liveBooking
                  ? "Check your details, then confirm."
                  : "These details were not sent."}
            </h3>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              {submitState.status === "success" ? (
                <>
                  Reference <span className="font-semibold text-primary">{submitState.reference}</span>.
                  Keep it for your records. This site does not email confirmations yet.
                </>
              ) : liveBooking ? (
                "Confirming sends your request to the farm’s reservation system. Capacity and table layout are checked on the server."
              ) : (
                "Iturrieta has not received a booking request, and no reference number was issued. The summary below only repeats what you entered."
              )}
            </p>
            {submitState.status === "error" ? (
              <p className="rounded-lg bg-error-container p-space-md font-body-sm text-body-sm text-on-error-container" role="alert">
                {submitState.message}
              </p>
            ) : null}
            <div className="flex flex-col gap-space-md rounded-lg bg-surface p-space-md text-on-surface">
              <div className="flex items-center justify-between gap-space-md">
                <span className="font-label-lg text-label-lg tracking-wider text-primary uppercase">
                  Request summary
                </span>
                <span className="font-body-sm text-body-sm font-semibold text-secondary">
                  Not a confirmation
                </span>
              </div>
              <dl className="grid grid-cols-1 gap-y-3 font-body-sm text-body-sm text-on-surface-variant sm:grid-cols-2">
                <div>
                  <dt className="uppercase tracking-wider text-outline">Date</dt>
                  <dd className="font-semibold text-on-surface">{preview.date}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-outline">Arrival</dt>
                  <dd className="font-semibold text-on-surface">{preview.arrival}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-outline">Party</dt>
                  <dd className="font-semibold text-on-surface">
                    {preview.adults} adults (€{adultTotal})
                    {preview.children > 0
                      ? ` + ${preview.children} ${preview.children === 1 ? "child" : "children"} (€${childTotal})`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-outline">Contact</dt>
                  <dd className="font-semibold text-on-surface">
                    {preview.name}
                    <span className="block font-normal">{preview.email}</span>
                    <span className="block font-normal">{preview.phone}</span>
                  </dd>
                </div>
              </dl>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                <span className="font-semibold text-primary">Notes: </span>
                {preview.notes || "None entered."}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Menu price estimate €{adultTotal + childTotal}. This is arithmetic
                from the published menu, not a bill and not a hold.
              </p>
            </div>
            <div className="flex flex-col gap-3 font-body-sm text-body-sm text-on-surface-variant">
              <p className="font-label-lg text-label-lg tracking-wider text-primary uppercase">
                {liveBooking ? "After you confirm" : "What this preview does not do"}
              </p>
              <p>
                {liveBooking
                  ? "This site does not email confirmations yet. Keep your reference and use manage booking to cancel eligible requests."
                  : "It does not email a voucher, assign a barrel, or apply a cancellation rule."}
              </p>
              <p>
                {liveBooking ? (
                  <>
                    Look up or cancel with your reference on{" "}
                    <Link href="/manage-booking" className="text-primary underline underline-offset-4">
                      manage your booking
                    </Link>
                    . Date or party-size changes still require a call to the farm.
                  </>
                ) : (
                  <>
                    To ask the farm about a change later, use{" "}
                    <Link href="/manage-booking" className="text-primary underline underline-offset-4">
                      manage your booking
                    </Link>
                    . That page needs server credentials and a seeded database before it can load real bookings.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {submitState.status !== "success" ? (
                <button
                  type="button"
                  className="min-h-11 rounded-lg bg-surface px-5 py-2.5 font-label-lg text-label-lg tracking-wide text-primary hover:bg-surface-container"
                  onClick={() => setView("form")}
                >
                  Edit details
                </button>
              ) : null}
              {liveBooking && submitState.status !== "success" ? (
                <button
                  type="button"
                  disabled={submitState.status === "loading"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 font-label-lg text-label-lg tracking-wide text-surface hover:bg-primary disabled:opacity-60"
                  onClick={() => void confirmReservation()}
                >
                  {submitState.status === "loading" ? "Saving request…" : "Confirm reservation request"}
                </button>
              ) : null}
              <a
                href={contact.phoneHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-surface-container px-5 py-2.5 font-label-lg text-label-lg tracking-wide text-on-surface hover:bg-surface-container-high"
              >
                <Icon name="phone" className="h-[18px] w-[18px]" />
                Call {contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  id,
  name,
  label,
  error,
  required = false,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-label-lg text-label-lg tracking-wider text-primary uppercase" htmlFor={id}>
        {label}
        {required ? <span className="text-secondary"> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClass, error && "ring-1 ring-error")}
      />
      {error ? (
        <p id={`${id}-error`} className="font-body-sm text-body-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Counter({
  id,
  label,
  price,
  hint,
  value,
  min,
  max,
  error,
  onChange,
}: {
  id: string;
  label: string;
  price: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="font-label-lg text-label-lg tracking-wider text-primary uppercase" htmlFor={id}>
          {label}
        </label>
        <span className="font-label-sm text-label-sm font-semibold text-secondary">{price}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface text-lg font-bold text-primary hover:bg-surface-container disabled:opacity-40"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <input
          id={id}
          readOnly
          value={value}
          aria-invalid={Boolean(error)}
          className="w-14 bg-transparent text-center font-headline-sm text-headline-sm text-primary outline-none"
        />
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface text-lg font-bold text-primary hover:bg-surface-container disabled:opacity-40"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
      {error ? <p className="font-body-sm text-body-sm text-error">{error}</p> : null}
    </div>
  );
}
