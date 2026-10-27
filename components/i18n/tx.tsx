"use client";

import { useTranslations } from "next-intl";
import { catalogSlug } from "@/lib/i18n/slug";

type TxProps = {
  children: string;
  id?: string;
};

export function Tx({ children, id }: TxProps) {
  const t = useTranslations("catalog.jsx");
  const key = id ?? catalogSlug(children);
  return t(key);
}
