import { cn } from "@/lib/cn";

type StaffContextBannerProps = {
  mode: "demo" | "staging" | "info" | "live" | "denied";
  message: string;
  role?: string;
  staffName?: string;
};

export function StaffContextBanner({
  mode,
  message,
  role,
  staffName,
}: StaffContextBannerProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-space-md py-space-sm font-body-md text-body-md",
        mode === "live" &&
          "border-primary/20 bg-primary-fixed/40 text-on-primary-fixed-variant",
        mode === "demo" &&
          "border-secondary/30 bg-secondary-fixed/50 text-on-secondary-fixed-variant",
        mode === "staging" &&
          "border-tertiary/40 bg-tertiary-container/50 text-on-surface",
        mode === "info" &&
          "border-outline-variant/40 bg-surface-container-low text-on-surface-variant",
        mode === "denied" &&
          "border-error/30 bg-error-container/60 text-on-error-container",
      )}
      role="status"
    >
      <p className="font-semibold">
        {mode === "live"
          ? "Staff session · live reservation data"
          : mode === "demo"
            ? "Development demo · fictional sample data only"
            : mode === "staging"
              ? "DEMO / STAGING · fictitious floor plan and cover limits"
              : mode === "info"
              ? "Staff sign in"
              : "Staff access required"}
      </p>
      <p className="mt-1 text-pretty">{message}</p>
      {mode === "live" && staffName ? (
        <p className="mt-2 font-label-sm text-label-sm uppercase tracking-wide">
          Signed in as {staffName}
          {role ? ` · ${role}` : ""}
        </p>
      ) : null}
    </div>
  );
}
