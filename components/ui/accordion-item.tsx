import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type AccordionItemProps = {
  question: string;
  children: ReactNode;
  defaultOpen?: boolean;
  questionClassName?: string;
};

export function AccordionItem({
  question,
  children,
  defaultOpen = false,
  questionClassName,
}: AccordionItemProps) {
  return (
    <details
      className="group overflow-hidden rounded-xl bg-surface-container shadow-sm open:bg-surface-container-low"
      {...(defaultOpen ? { open: true } : {})}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-space-md p-space-md transition-colors hover:bg-surface-container-high sm:p-space-lg [&::-webkit-details-marker]:hidden">
        <span
          className={cn(
            "font-headline-sm text-headline-sm text-primary",
            questionClassName,
          )}
        >
          {question}
        </span>
        <Icon
          name="chevron-down"
          className="h-5 w-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="border-t border-outline-variant/40 px-space-md pt-space-md pb-space-lg font-body-md text-body-md text-on-surface-variant sm:px-space-lg">
        {children}
      </div>
    </details>
  );
}
