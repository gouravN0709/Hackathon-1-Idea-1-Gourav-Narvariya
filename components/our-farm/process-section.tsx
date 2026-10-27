import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon, type IconName } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";

const steps: ReadonlyArray<{
  number: string;
  icon: IconName;
  title: string;
  body: ReactNode;
  meta: string;
}> = [
  {
    number: "01",
    icon: "waves",
    title: "Hand Selection & Spring Wash",
    body: "Apples are inspected by hand to remove unsound fruit, then gently rinsed in pure mountain spring water that flows from Mount Anboto aquifers.",
    meta: "Stage: Late October",
  },
  {
    number: "02",
    icon: "press",
    title: "Gentle Pressing & Sweet Must",
    body: (
      <>
        Crushed slow in traditional presses. We coax out dense, unclarified juice
        (<em>patsa</em>) loaded with natural enzymes, natural tannins, and wild
        microflora.
      </>
    ),
    meta: "Extract: Cold Run Must",
  },
  {
    number: "03",
    icon: "bubbles",
    title: "Wild Native Fermentation",
    body: "No commercial yeasts, no pasteurization, zero added sulfites. Indigenous orchard yeast converts natural fructose into living dry cider over cold winter months.",
    meta: "Alchemy: 100% Spontaneous",
  },
  {
    number: "04",
    icon: "wine",
    title: "Oak Kupela Aging & Txotx",
    body: (
      <>
        Resting inside centuries-old chestnut and seasoned oak barrels (
        <em>kupelak</em>). By mid-January, the cellar opens for the traditional
        first pour.
      </>
    ),
    meta: "Tasting: Txotx Season",
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="mx-auto flex max-w-2xl flex-col gap-space-xs text-center">
          <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary uppercase">
            Chapter III · The Transformation
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal text-balance text-primary md:text-headline-lg">
            From Apple to Cup: The Slow Basque Method.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Patience over technology. Spontaneous cold fermentation guides our
            cider into rustic complexity, honoring five centuries of farmhouse
            practice.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.number}
              className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container p-space-lg shadow-sm motion-safe:transition-colors motion-safe:hover:bg-surface-container-high"
            >
              <div className="flex items-center justify-between">
                <span className="font-display-hero text-[2.375rem] leading-none font-light text-secondary">
                  {step.number}
                </span>
                <Icon name={step.icon} className="h-7 w-7 text-primary" />
              </div>
              <div className="flex flex-col gap-space-xs">
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  {step.title}
                </h3>
                <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  {step.body}
                </p>
              </div>
              <span className="pt-space-xs font-label-sm text-label-sm font-semibold tracking-wider text-primary uppercase">
                {step.meta}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col items-start justify-between gap-space-lg rounded-xl bg-tertiary-fixed p-space-lg md:flex-row md:items-center md:p-space-xl">
          <div className="flex items-start gap-space-md">
            <Icon name="verified" className="mt-1 h-9 w-9 shrink-0 text-primary" />
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg font-bold tracking-wider text-primary uppercase">
                Unfiltered · Unpasteurized · Living Estate Sagardoa
              </span>
              <p className="mt-1 max-w-3xl font-body-md text-body-md text-on-surface-variant">
                Every bottle and barrel of Iturrieta cider carries the official
                Basque Quality Label (<em>Euskal Sagardoa</em>), guaranteeing
                100% Álava and Gipuzkoa native fruit and stringent craft
                benchmarks.
              </p>
            </div>
          </div>
          <ButtonLink href="/#menu" variant="solid" className="w-full md:w-auto">
            View Cider Tasting Notes
          </ButtonLink>
        </div>
      </SiteContainer>
    </section>
  );
}
