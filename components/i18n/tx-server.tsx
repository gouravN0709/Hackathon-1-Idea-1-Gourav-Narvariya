import { getTranslations } from "next-intl/server";
import { catalogSlug } from "@/lib/i18n/slug";

type TxServerProps = {
  children: string;
  id?: string;
};

export async function TxServer({ children, id }: TxServerProps) {
  const t = await getTranslations("catalog.jsx");
  const key = id ?? catalogSlug(children);
  return t(key);
}
