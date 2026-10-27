import type { useMessages } from "next-intl";

type Messages = ReturnType<typeof useMessages>;

export type ContentMessages = {
  siteConfig: {
    name: string;
    legalName: string;
    descriptor: string;
    tagline: string;
    title: string;
    description: string;
  };
  navItems: { href: string; label: string }[];
  footerEstateLinks: { href: string; label: string }[];
  orchardStages: {
    image: string;
    alt: string;
    stage: string;
    season: string;
    title: string;
    body: string;
    icon: string;
    note: string;
  }[];
  menuCourses: { name: string; detail: string; course: string }[];
  childrenMenuItems: string[];
  experiences: {
    image: string;
    alt: string;
    badge: string;
    badgeTone: string;
    meta: string;
    title: string;
    body: string;
    cta: string;
    href: string;
  }[];
  galleryItems: {
    src: string;
    alt: string;
    caption: string;
    featured: boolean;
  }[];
  diningHours: {
    openDays: string;
    openDaysShort: string;
    hours: string;
    closedDays: string;
    closedDaysShort: string;
    openWeekdays: number[];
  };
  txotxSeasonLabel: string;
  menuPrices: { adult: number; child: number; childAges: string };
};

export function getContentMessages(messages: Messages): ContentMessages {
  return messages.content as ContentMessages;
}
