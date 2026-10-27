import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  hero: "inline-flex items-center justify-center bg-secondary text-surface font-label-lg text-label-lg uppercase tracking-wider px-space-xl py-space-md rounded shadow-md transition-all duration-200 hover:bg-on-secondary-container motion-safe:hover:-translate-y-0.5",
  glass:
    "inline-flex items-center justify-center gap-space-xs bg-surface/10 text-surface font-label-lg text-label-lg uppercase tracking-wider px-space-lg py-space-md rounded backdrop-blur-md transition-colors hover:bg-surface/20",
  solid:
    "inline-flex items-center justify-center bg-primary text-on-primary font-label-lg text-label-lg uppercase tracking-wider px-space-lg py-space-sm rounded transition-colors hover:bg-primary-container",
  primary:
    "inline-flex items-center justify-center bg-primary-container text-surface font-label-lg text-label-lg uppercase tracking-wider px-space-lg py-space-sm rounded-lg transition-colors shadow-[0_4px_12px_-2px_rgba(41,70,50,0.18)] hover:bg-primary",
  amber:
    "inline-flex items-center justify-center bg-secondary-fixed-dim text-on-secondary-fixed font-label-lg text-label-lg uppercase tracking-wider px-space-lg py-space-sm rounded transition-colors shadow-sm hover:bg-surface",
  soft: "inline-flex items-center justify-center bg-surface-container-high text-primary font-label-lg text-label-lg uppercase tracking-wider py-space-sm rounded transition-colors hover:bg-surface-container-highest",
  ghost:
    "group inline-flex items-center gap-space-xs text-surface-container-high font-label-lg text-label-lg uppercase tracking-wider px-space-lg py-space-md transition-colors hover:text-surface",
  text: "inline-flex items-center gap-space-xs font-label-lg text-label-lg text-primary transition-colors hover:text-secondary",
  underline:
    "inline-flex items-center gap-space-xs font-label-lg text-label-lg uppercase tracking-wider text-secondary underline decoration-secondary underline-offset-4 transition-colors hover:text-primary",
  editorial:
    "inline-flex items-center gap-space-sm font-label-lg text-label-lg uppercase tracking-wider text-primary underline decoration-secondary underline-offset-8 transition-colors hover:text-secondary",
} as const;

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant: keyof typeof variants;
  className?: string;
  external?: boolean;
};

export function ButtonLink({
  href,
  children,
  variant,
  className,
  external = false,
}: ButtonLinkProps) {
  const classes = cn(variants[variant], className);

  if (external) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
