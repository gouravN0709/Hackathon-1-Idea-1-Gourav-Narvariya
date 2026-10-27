import { Tx } from "@/components/i18n/tx";
import type {
  ReadinessCheckItem,
  ReadinessCheckStatus,
} from "@/lib/booking/operations-readiness-checklist";
import { cn } from "@/lib/cn";

const statusLabel: Record<ReadinessCheckStatus, string> = {
  pass: "Ready",
  warn: "Review",
  fail: "Blocked",
  info: "Status",
};

const statusClass: Record<ReadinessCheckStatus, string> = {
  pass: "bg-primary-container/30 text-primary",
  warn: "bg-tertiary-container/40 text-on-surface",
  fail: "bg-error-container text-on-error-container",
  info: "bg-surface-container-high text-on-surface-variant",
};

type StaffBookingReadinessSectionProps = {
  items: ReadinessCheckItem[];
  bookingLive: boolean;
};

export function StaffBookingReadinessSection({
  items,
  bookingLive,
}: StaffBookingReadinessSectionProps) {
  return (
    <section
      className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-lg"
      aria-labelledby="booking-readiness-heading"
    >
      <div className="flex flex-col gap-space-xs sm:flex-row sm:items-baseline sm:justify-between">
        <h2
          id="booking-readiness-heading"
          className="font-display text-display-sm text-on-surface"
        >
          <Tx>Online booking readiness</Tx>
        </h2>
        <p
          className={cn(
            "inline-flex w-fit rounded-full px-space-sm py-1 font-body-sm text-body-sm font-medium",
            bookingLive ? statusClass.pass : statusClass.info,
          )}
        >
          {bookingLive ? "Live on /book" : "Preview only"}
        </p>
      </div>
      <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
        These checks mirror{" "}
        <code className="rounded bg-surface-container-high px-1 py-0.5 font-mono text-body-sm">
          <Tx>GET /api/bookings/status</Tx>
        </code>
        . On DEMO / STAGING projects, inventory and shifts may be pre-set for demos; production
        still requires farm-confirmed tables, cover limits, and deliberate shift activation.
      </p>

      <ul className="mt-space-lg flex flex-col gap-space-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid gap-space-xs rounded-lg bg-surface p-space-md sm:grid-cols-[auto_1fr]"
          >
            <span
              className={cn(
                "h-fit w-fit rounded-md px-space-sm py-0.5 font-body-sm text-body-sm font-medium",
                statusClass[item.status],
              )}
            >
              {statusLabel[item.status]}
            </span>
            <div>
              <p className="font-body-md text-body-md font-medium text-on-surface">{item.label}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
