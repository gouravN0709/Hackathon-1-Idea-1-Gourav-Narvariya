export const siteConfig = {
  name: "Iturrieta",
  legalName: "Iturrieta Sagardotegia",
  descriptor: "Sagardotegia · Basque Country",
  tagline: "Rooted in the land. Made to be shared.",
  title: "Iturrieta Sagardotegia | Basque Cider House",
  description:
    "Discover Iturrieta, a family cider house in the Basque countryside. Explore our farm, natural cider, traditional txotx experience and visit information.",
} as const;

export const contact = {
  phoneDisplay: "+34 945 445 102",
  phoneHref: "tel:+34945445102",
  email: "erreserbak@aramaiosagardoa.eus",
  infoEmail: "info@aramaiosagardoa.eus",
  addressLines: ["Caserío Goikola", "Barrio Barajuen 12", "01169 Aramaio, Araba/Álava"] as const,
  gps: "Goikola Bidea 12, 01169 Aramaio, Álava",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Aramaio%20Alava%20Basque%20Country",
} as const;

export const navItems = [
  { href: "/our-farm", label: "Our Farm" },
  { href: "/menu", label: "Menu & Cider" },
  { href: "/#experiences", label: "Experiences" },
  { href: "/visit", label: "Visit Us" },
] as const;

export const diningHours = {
  openDays: "Thursday – Sunday",
  openDaysShort: "Thu – Sun",
  hours: "13:00 – 16:00",
  closedDays: "Monday – Wednesday",
  closedDaysShort: "Mon – Wed",
  openWeekdays: [0, 4, 5, 6] as const,
} as const;

export const txotxSeasonLabel = "January 15 – May 18";

export const menuPrices = {
  adult: 45,
  child: 16,
  childAges: "3–12",
} as const;

export const footerEstateLinks = [
  { href: "/our-farm", label: "Our Farm & Heritage" },
  { href: "/menu", label: "The Sagardotegi Menu" },
  { href: "/menu#natural-cider", label: "Cellar & Kupela Reserves" },
  { href: "/#experiences", label: "Harvest Tours & Tastings" },
  { href: "/#visit", label: "Rural Stays & Guesthouse" },
] as const;

export const orchardStages = [
  {
    image: "/images/orchard-flora.jpg",
    alt: "Heritage Basque cider apples ripening on moss-draped orchard branches.",
    stage: "01 · Flora",
    season: "Spring & Summer",
    title: "Native Cultivars",
    body: "Polyculture orchards planted with 14 rare Basque cultivars: high-tannin Urtebi Txiki, acidic Moko, and bitter Gezamina. Trees are dry-farmed without synthetic intervention.",
    icon: "eco" as const,
    note: "Biodynamic Certified Orchards",
  },
  {
    image: "/images/orchard-harvest.jpg",
    alt: "Hand-harvested cider apples gathered into woven baskets on dewy orchard grass.",
    stage: "02 · Autumn Harvest",
    season: "October – November",
    title: "Hand Gathered by Kizkia",
    body: "Fruit is allowed to drop naturally at peak phenolic maturity, harvested individually using the ancestral spiked wood pole (kizkia), ensuring only pristine fruit enters the press.",
    icon: "hand" as const,
    note: "Zero Mechanical Shaking",
  },
  {
    image: "/images/orchard-cellar.jpg",
    alt: "Antique chestnut cider barrels aging in a stone cellar with lantern light.",
    stage: "03 · The Cellar",
    season: "December – May",
    title: "Wild Kupela Aging",
    body: "Slow, spontaneous double fermentation in seasoned 10,000-liter chestnut and oak casks (kupelak). The cold mountain air naturally stabilizes the liquid into sparkling life.",
    icon: "droplet" as const,
    note: "Wild Fermentation & Untamed Clarity",
  },
] as const;

export const menuCourses = [
  {
    name: "Tortilla de Bacalao con Puerros",
    detail: "Free-range eggs, salt cod flakes, caramelized Aramaio garden leeks",
    course: "First Course",
  },
  {
    name: "Bacalao Frito con Pimientos de Gernika",
    detail: "Line-caught Cantabrian cod, confit garlic, sweet Gernika peppers",
    course: "Second Course",
  },
  {
    name: "Txuleton de Vaca Vieja a la Brasa",
    detail:
      "45-day dry-aged Basque grass-fed ribeye seared over aged vine wood embers and coarse sea salt",
    course: "Main Feast (~1kg / pair)",
  },
  {
    name: "Queso Idiazabal con Membrillo y Nueces",
    detail:
      "Raw Latxa sheep cheese from Gorbeia, homemade orchard quince jelly, toasted walnuts",
    course: "Postre",
  },
] as const;

export const childrenMenuItems = [
  "Free-range herb roast chicken breast",
  "Hand-whipped roasted apple purée",
  "Artisanal cider-apple stewed compote",
  "Fresh pressed sweet apple must (non-alcoholic)",
] as const;

export const experiences = [
  {
    image: "/images/experience-walk.jpg",
    alt: "Guests walking through a Basque apple orchard beneath limestone mountains.",
    badge: "€22 / guest",
    badgeTone: "light" as const,
    meta: "Year-Round · 90 Minutes",
    title: "Guided Orchard & Cellar Walks",
    body: "Stroll the biodynamic terraced groves, learn ancient pruning arts, and finish in the cellar with a guided tasting of three single-variety natural reserves.",
    cta: "Book Walk",
    href: "/book",
  },
  {
    image: "/images/experience-harvest.jpg",
    alt: "Visitors operating a wooden hand-screw cider press during harvest.",
    badge: "Autumn Only (Sep–Nov)",
    badgeTone: "amber" as const,
    meta: "Seasonal Immersion · Half-Day",
    title: "Harvest & Pressing Immersion",
    body: "Gather heritage apples with the kizkia, operate the 1912 wooden hand press, and bottle your own cloudy unfermented sagarmustia to take home.",
    cta: "Reserve Harvest Date",
    href: "/book",
  },
  {
    image: "/images/experience-celebration.jpg",
    alt: "Candlelit communal table set for a private gathering in the barrel cellar.",
    badge: "Custom Quote",
    badgeTone: "light" as const,
    meta: "Exclusive Hire · Up to 60 Guests",
    title: "Celebrations in the Kupelategi",
    body: "Intimate banquets, milestone gatherings, and bespoke corporate retreats surrounded by century-old oak and the gentle perfume of natural cider maturation.",
    cta: "Inquire for Private Hire",
    href: "/#visit",
  },
] as const;

export const galleryItems = [
  {
    src: "/images/gallery-valley.jpg",
    alt: "Morning mist in the Aramaio valley with terraced pastures and limestone peaks.",
    caption: "The Valley of Aramaio · Álava",
    featured: true,
  },
  {
    src: "/images/gallery-txuleton.jpg",
    alt: "Txuleton ribeye searing over wood embers beside a glass of Basque cider.",
    caption: "Txuleton over vine embers",
    featured: false,
  },
  {
    src: "/images/gallery-apples.jpg",
    alt: "Freshly harvested heirloom apples in a linen basket with tasting glasses.",
    caption: "Urtebi Txiki harvest",
    featured: false,
  },
] as const;
