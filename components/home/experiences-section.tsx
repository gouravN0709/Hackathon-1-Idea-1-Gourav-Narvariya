import { TxServer } from "@/components/i18n/tx-server";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { cn } from "@/lib/cn";
import { getMessages } from "next-intl/server";
import { getContentMessages } from "@/lib/i18n/content";

export async function ExperiencesSection() {
  const messages = await getMessages();
  const { experiences } = getContentMessages(messages);
  return (
    <section id="experiences" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-2xl">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex max-w-xl flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
              <TxServer>Slow Hospitality</TxServer>
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg leading-tight font-normal text-primary">
              <TxServer>Curated journeys into our estate.</TxServer>
            </h2>
          </div>
          <ButtonLink href="/#experiences" variant="underline">
            <TxServer>Browse All Seasonal Gatherings</TxServer>
            <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {experiences.map((item) => (
            <article
              key={item.title}
              className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-low shadow-sm motion-safe:transition-all motion-safe:hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container-high">
                <ResponsiveImage
                  src={item.image}
                  alt={item.alt}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
                <span
                  className={cn(
                    "absolute top-3 right-3 rounded px-space-sm py-1 font-label-sm text-label-sm font-semibold",
                    item.badgeTone === "amber"
                      ? "bg-secondary-fixed text-on-secondary-fixed"
                      : "bg-surface/90 text-primary backdrop-blur-md",
                  )}
                >
                  {item.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-space-lg">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">
                    {item.meta}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {item.title}
                  </h3>
                  <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                    {item.body}
                  </p>
                </div>
                <div className="pt-space-md">
                  <ButtonLink href={item.href} variant="text">
                    {item.cta}
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
