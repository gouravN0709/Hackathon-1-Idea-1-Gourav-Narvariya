import Link from "next/link";
import { VisitInquiryForm } from "@/components/visit/visit-inquiry-form";
import { Icon, type IconName } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";
import { contact } from "@/lib/site-config";

const channels: {
  href: string;
  icon: IconName;
  kicker: string;
  title: string;
  detail: string;
  action: string;
}[] = [
  {
    href: contact.phoneHref,
    icon: "phone",
    kicker: "Telephone",
    title: contact.phoneDisplay,
    detail: "Call the farm about a table, a group, or the drive into the valley.",
    action: "Call the farm",
  },
  {
    href: `mailto:${contact.email}`,
    icon: "mail",
    kicker: "Reservations email",
    title: contact.email,
    detail: "Write about dining, dietary notes, or a proposed visit date.",
    action: "Email reservations",
  },
  {
    href: `mailto:${contact.infoEmail}`,
    icon: "mail",
    kicker: "General enquiries",
    title: contact.infoEmail,
    detail: "For other questions about the estate, use the information address.",
    action: "Email the estate",
  },
];

export function VisitContact() {
  return (
    <section id="contact" className="w-full scroll-mt-24 bg-surface-container py-space-2xl">
      <SiteContainer className="space-y-space-xl">
        <div className="max-w-2xl space-y-space-xs">
          <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            Direct enquiries · Caserío Goikola
          </p>
          <h2 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
            Get in Touch
          </h2>
          <p className="pt-space-xs font-body-lg text-body-lg text-on-surface-variant">
            Questions about the menu, a group, or finding the farm can go
            straight to the telephone and email addresses already published for
            Iturrieta.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {channels.map((channel) => (
            <a
              key={channel.kicker}
              href={channel.href}
              className="group flex flex-col justify-between rounded-xl bg-surface p-space-xl shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="space-y-space-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded bg-surface-container-high text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <Icon name={channel.icon} className="h-6 w-6" />
                </span>
                <span className="block font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                  {channel.kicker}
                </span>
                <p className="font-headline-sm text-headline-sm break-words text-primary">
                  {channel.title}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {channel.detail}
                </p>
              </div>
              <span className="flex items-center gap-1 pt-space-md font-label-lg text-label-lg tracking-wider text-secondary uppercase group-hover:text-primary">
                {channel.action}
                <Icon name="arrow-right" className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>

        <VisitInquiryForm />

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Published menus are on{" "}
          <Link href="/menu" className="text-primary underline underline-offset-4">
            Menu & Cider
          </Link>
          . Longer answers are on the{" "}
          <Link href="/faq" className="text-primary underline underline-offset-4">
            FAQ
          </Link>
          .
        </p>
      </SiteContainer>
    </section>
  );
}
