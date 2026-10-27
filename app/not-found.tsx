import { ButtonLink } from "@/components/ui/button-link";
import { SiteContainer } from "@/components/ui/site-container";

export default function NotFound() {
  return (
    <section className="bg-surface py-space-2xl">
      <SiteContainer className="flex max-w-xl flex-col gap-space-md py-space-xl">
        <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
          Page not found
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-normal text-primary">
          This path does not lead to the orchard.
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          The page you requested is not part of this site yet. Return to the
          homepage to continue exploring the farm, cellar, and table.
        </p>
        <ButtonLink href="/" variant="primary" className="w-fit">
          Back to homepage
        </ButtonLink>
      </SiteContainer>
    </section>
  );
}
