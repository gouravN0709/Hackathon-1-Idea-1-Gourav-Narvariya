import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";

const courses = [
  {
    number: "01",
    name: "Tortilla de Bacalao con Puerros y Cebolla",
    detail:
      "Line-caught salt cod omelette with slow-braised sweet Aramaio leeks and caramelized white onions. Soft-set runny core.",
    course: "Course I",
  },
  {
    number: "02",
    name: "Bacalao Frito con Pimientos de Gernika",
    detail:
      "Pan-crisped thick cod loin tossed with golden garlic flakes, mild Gernika peppers lightly blistering in unfiltered Basque olive oil.",
    course: "Course II",
  },
  {
    number: "03",
    name: "Txuleton a la Brasa de Roble y Sarría",
    detail:
      "Matured grass-fed bone-in Basque ribeye (~1kg for two), seared rare over fiery vine embers, dressed exclusively with coarse mountain mineral salt flakes.",
    course: "Course III",
    signature: true,
  },
  {
    number: "04",
    name: "Queso Idiazabal DOP con Membrillo y Nueces",
    detail:
      "Smoked Latxa raw sheep's milk cheese wedge, handmade estate apple-quince jelly (membrillo), and cracked valley walnuts.",
    course: "Postre",
  },
] as const;

const childrenItems = [
  "Pasture-raised herb roast chicken breast or tender breaded farmhouse cutlet",
  "Whipped roasted apple purée & garden potato wedges",
  "Artisanal orchard cider-apple compote dessert",
  "Freshly pressed unfermented sweet apple must (sagarmatza)",
] as const;

export function MenuDiningSection() {
  return (
    <section
      id="tasting-menus"
      className="w-full scroll-mt-24 bg-surface-container-low py-space-2xl"
    >
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary uppercase">
              Chapter I · The Hearth & Harvest
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal tracking-tight text-balance text-primary md:text-headline-lg">
              Authentic Cider-House Dining & Seasonal Menus
            </h2>
            <p className="pt-2 font-body-md text-body-md text-on-surface-variant">
              The sagardotegi meal is an ancestral agrarian rite with no
              pretense: hearty, generous courses designed to balance the crisp,
              bracing natural acidity of fresh cider. Between each bite, guests
              rise freely to pour living sagardoa straight from wooden casks.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start rounded-lg bg-surface p-space-sm shadow-sm md:self-auto">
            <Icon name="hearth" className="h-6 w-6 shrink-0 text-secondary" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-semibold text-primary uppercase">
                The Asador Wood Fire
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Pruned apple vine embers & mountain oak
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <article className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:p-space-xl lg:col-span-8">
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col justify-between gap-2 pb-space-sm sm:flex-row sm:items-baseline">
                <div>
                  <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                    The Canonical Feast
                  </span>
                  <h3 className="mt-1 font-headline-md text-headline-md text-primary">
                    Traditional Sagardotegi Menu
                  </h3>
                </div>
                <p className="sm:text-right">
                  <span className="font-display-hero text-display-hero-mobile font-normal text-primary">
                    €45
                  </span>
                  <span className="-mt-1 block font-body-sm text-body-sm text-on-surface-variant">
                    per guest · VAT included
                  </span>
                </p>
              </div>

              <p className="inline-flex w-fit max-w-full items-start gap-space-xs rounded-lg bg-tertiary-fixed px-space-md py-2 font-label-sm text-label-sm tracking-wider text-primary uppercase">
                <Icon name="wine" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Unlimited Txotx Barrel Pouring Included Throughout the Meal</span>
              </p>

              <ol className="flex flex-col gap-space-md pt-space-sm">
                {courses.map((course) => (
                  <li
                    key={course.number}
                    className={
                      "signature" in course && course.signature
                        ? "flex flex-col justify-between gap-2 rounded-lg bg-surface-container/60 p-space-sm pb-space-sm sm:flex-row sm:items-start"
                        : "flex flex-col justify-between gap-2 pb-space-sm sm:flex-row sm:items-start"
                    }
                  >
                    <div className="flex min-w-0 items-start gap-space-sm">
                      <span className="font-label-lg text-label-lg font-bold text-secondary">
                        {course.number}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="flex flex-wrap items-center gap-space-xs">
                          <span className="font-title-editorial text-title-editorial font-medium text-primary">
                            {course.name}
                          </span>
                          {"signature" in course && course.signature ? (
                            <span className="rounded bg-secondary-fixed px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-on-secondary-fixed uppercase">
                              Signature
                            </span>
                          ) : null}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {course.detail}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 font-label-sm text-label-sm tracking-widest text-secondary uppercase sm:text-right">
                      {course.course}
                    </span>
                  </li>
                ))}
              </ol>

              <p className="flex items-start gap-space-sm pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <Icon name="grill" className="h-[18px] w-[18px] shrink-0 text-secondary" />
                <span>
                  Includes warm wood-fired sourdough hearth bread and untamed
                  natural mountain spring water.
                </span>
              </p>
            </div>

            <div className="mt-space-lg flex flex-col items-start justify-between gap-space-md pt-space-md sm:flex-row sm:items-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                Served to full table parties at the txotx season lunch and
                dinner seatings.
              </p>
              <ButtonLink href="/book" variant="solid" className="gap-space-xs">
                Reserve Table
                <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </article>

          <div className="flex flex-col gap-space-md lg:col-span-4">
            <article className="flex h-full flex-col justify-between rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-baseline justify-between gap-2 pb-space-xs">
                  <div className="min-w-0">
                    <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                      Young Explorers
                    </span>
                    <h3 className="mt-1 font-headline-sm text-headline-sm text-primary">
                      Children&apos;s Farm Menu
                    </h3>
                  </div>
                  <p className="shrink-0 text-right">
                    <span className="font-headline-md text-headline-md font-normal text-primary">
                      €16
                    </span>
                    <span className="-mt-1 block font-body-sm text-body-sm text-on-surface-variant">
                      ages 3–12
                    </span>
                  </p>
                </div>
                <p className="pb-space-xs font-body-sm text-body-sm text-on-surface-variant">
                  Honest, nutrient-rich dishes crafted from pasture-raised
                  poultry and fresh orchard fruit for young palates.
                </p>
                <ul className="flex flex-col gap-space-sm pt-space-xs">
                  {childrenItems.map((item) => (
                    <li key={item} className="flex items-start gap-space-xs">
                      <Icon
                        name="check"
                        className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-space-md flex items-start gap-space-xs rounded-lg bg-surface-container p-space-sm">
                <Icon name="eco" className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <strong className="font-medium text-primary">
                    Dietary Accommodations:
                  </strong>{" "}
                  Wild vegetable embers, charred leeks, and pescatarian
                  substitutes provided with 24h advance reservation.
                </p>
              </div>
            </article>

            <aside className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-primary p-space-lg text-surface shadow-sm">
              <div className="relative z-10 flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm tracking-widest text-secondary-fixed uppercase">
                  The Hearth Tradition
                </span>
                <h3 className="font-headline-sm text-headline-sm text-surface">
                  The Soul of the Asador
                </h3>
                <p className="font-body-sm text-body-sm leading-relaxed text-on-primary-container">
                  We never use charcoal briquettes or gas. Our braziers burn
                  seasoned trunk wood from fallen mountain oaks and pruned apple
                  vine cuttings, lending an incomparable wild floral aroma to
                  every grilled txuleton.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between gap-space-sm pt-space-md font-label-sm text-label-sm tracking-wider text-secondary-fixed uppercase">
                <span>Fire Master: Mikel Goikoetxea</span>
                <Icon name="hearth" className="h-[18px] w-[18px] shrink-0" />
              </div>
            </aside>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
