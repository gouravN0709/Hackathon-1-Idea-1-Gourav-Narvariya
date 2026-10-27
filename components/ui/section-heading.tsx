import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: SectionHeadingProps) {
  const titleColor = tone === "dark" ? "text-surface" : "text-primary";
  const eyeColor =
    tone === "dark" ? "text-secondary-fixed-dim" : "text-secondary";
  const descColor =
    tone === "dark" ? "text-surface-container-high" : "text-on-surface-variant";

  return (
    <div
      className={cn(
        "flex flex-col gap-space-xs",
        align === "center" && "items-center text-center",
      )}
    >
      <span
        className={cn(
          "font-label-sm text-label-sm uppercase tracking-widest font-semibold",
          eyeColor,
        )}
      >
        {eyebrow}
      </span>
      <h2
        className={cn(
          "font-headline-lg text-headline-lg-mobile md:text-headline-lg font-normal leading-tight",
          titleColor,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("font-body-md text-body-md max-w-lg", descColor)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
