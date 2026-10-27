import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";
import { childrenMenuItems, menuCourses } from "@/lib/site-config";

export function MenuSection() {
  return (
    <section id="menu" className="w-full scroll-mt-24 bg-surface-container-low py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-2xl">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-space-xs text-center">
          <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            Fire & Orchard Feasts
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg leading-tight font-normal text-primary">
            Good food. Natural cider. Time together.
          </h2>
          <p className="mt-space-xs max-w-lg font-body-md text-body-md text-on-surface-variant">
            Served at hand-hewn oak trestles beside glowing vine embers. Our menu
            has remained unadulterated since our great-grandfather’s table.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-gutter lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-xl bg-surface p-space-xl shadow-md lg:col-span-8">
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col justify-between gap-space-xs pb-space-sm sm:flex-row sm:items-baseline">
                <div>
                  <span className="font-label-sm text-label-sm font-bold tracking-widest text-secondary uppercase">
                    The Authentic Rite
                  </span>
                  <h3 className="font-headline-md text-headline-md text-primary">
                    Traditional Sagardotegi Menu
                  </h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-md text-headline-md font-normal text-primary">
                    €45
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    / person (VAT incl.)
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-space-md pt-space-xs">
                {menuCourses.map((course) => (
                  <div
                    key={course.name}
                    className="flex flex-col justify-between rounded bg-surface-container-low/40 p-space-sm pb-space-xs sm:flex-row sm:items-baseline"
                  >
                    <div className="flex flex-col">
                      <span className="font-title-editorial text-title-editorial text-primary">
                        {course.name}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {course.detail}
                      </span>
                    </div>
                    <span className="mt-1 font-label-sm text-label-sm font-semibold text-secondary uppercase sm:mt-0">
                      {course.course}
                    </span>
                  </div>
                ))}
                <div className="flex flex-col justify-between rounded bg-primary-container p-space-md text-surface sm:flex-row sm:items-center">
                  <div className="flex items-center gap-space-sm">
                    <Icon name="wine" className="h-5 w-5 text-secondary-fixed" />
                    <span className="font-body-md text-body-md font-medium">
                      Unlimited Txotx Barrel Pouring Throughout Meal
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm tracking-widest text-secondary-fixed uppercase">
                    Included
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-space-md pt-space-lg sm:flex-row">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Wood-fired sourdough bread & spring water always provided.
              </span>
              <ButtonLink href="/#menu" variant="underline">
                View Detailed Beverage & Cellar List
                <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>

          <div className="flex flex-col gap-space-lg lg:col-span-4">
            <div className="flex flex-1 flex-col justify-between rounded-xl bg-surface p-space-lg shadow-md">
              <div className="flex flex-col gap-space-sm">
                <span className="font-label-sm text-label-sm font-bold tracking-widest text-secondary uppercase">
                  Young Apprentices
                </span>
                <div className="flex items-baseline justify-between gap-space-sm">
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    Children&apos;s Farm Menu
                  </h3>
                  <span className="font-headline-sm text-headline-sm text-primary">
                    €16
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Crafted for young palates using pasture-raised ingredients from
                  our neighboring farms.
                </p>
                <ul className="flex flex-col gap-space-xs pt-space-xs font-body-sm text-body-sm text-on-surface">
                  {childrenMenuItems.map((item) => (
                    <li key={item} className="flex items-center gap-space-xs">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-space-md">
                <ButtonLink href="/book" variant="soft" className="w-full">
                  Reserve Lunch or Dinner
                </ButtonLink>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container-highest/60 p-space-lg shadow-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm text-primary">
                <Icon name="grill" className="h-5 w-5 text-secondary" />
                <span>The Asador Wood Fire</span>
              </div>
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                We never use charcoal. Our grills burn trimmed apple orchard
                branches and dried holm oak, imparting a gentle rustic aroma
                unique to our valley.
              </p>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
