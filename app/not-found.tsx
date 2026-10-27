import { ButtonLink } from "@/components/ui/button-link";
import { SiteContainer } from "@/components/ui/site-container";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <section className="bg-surface py-space-2xl">
      <SiteContainer className="flex max-w-xl flex-col gap-space-md py-space-xl">
        <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
          {t("eyebrow")}
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-normal text-primary">
          {t("title")}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{t("body")}</p>
        <ButtonLink href="/" variant="primary" className="w-fit">
          {t("homeCta")}
        </ButtonLink>
      </SiteContainer>
    </section>
  );
}
