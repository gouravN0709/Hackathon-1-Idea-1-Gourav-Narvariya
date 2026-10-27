import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";
import { contact } from "@/lib/site-config";

const channels: { href: string; icon: IconName; label: string; value: string; detail: string }[] = [
  {
    href: contact.phoneHref,
    icon: "phone",
    label: "Estate phone",
    value: contact.phoneDisplay,
    detail: "Call about a booking the farm already holds.",
  },
  {
    href: `mailto:${contact.email}`,
    icon: "mail",
    label: "Reservations",
    value: contact.email,
    detail: "Email the reservations address.",
  },
  {
    href: `mailto:${contact.infoEmail}`,
    icon: "mail",
    label: "Information",
    value: contact.infoEmail,
    detail: "General questions about the estate.",
  },
];

export function ManageSupport() {
  return (
    <section className="w-full bg-surface-container-high py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-5">
            <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
              Bespoke hospitality
            </p>
            <h2 className="font-headline-lg text-headline-lg-mobile text-primary md:text-headline-lg">
              Need a Hand?
            </h2>
            <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              Party numbers, the drive into the valley, and dietary notes belong
              in a conversation with the farm. This page cannot pass them on.
            </p>
            <Link
              href="/visit"
              className="inline-flex min-h-11 w-fit items-center gap-2 font-label-lg text-label-lg font-semibold tracking-wider text-secondary uppercase hover:text-on-secondary-container"
            >
              View arrival & visit guide
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3 lg:col-span-7">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                className="group flex flex-col gap-space-md rounded-xl bg-surface p-space-lg shadow-sm transition-colors hover:bg-surface-container-lowest"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <Icon name={channel.icon} className="h-5 w-5" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
                    {channel.label}
                  </span>
                  <span className="font-body-sm text-body-sm font-semibold break-all text-primary">
                    {channel.value}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {channel.detail}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
