import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SiteContainerProps = {
  children: ReactNode;
  className?: string;
};

export function SiteContainer({ children, className }: SiteContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1280px] px-margin-mobile md:px-margin-tablet lg:px-margin",
        className,
      )}
    >
      {children}
    </div>
  );
}
