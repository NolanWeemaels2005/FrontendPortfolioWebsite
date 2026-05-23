import type { Language } from "../i18n/LanguageContext";

export type ProjectTranslation = Partial<Record<Language, string>>;

export type Project = {
  id?: string;
  title: string;
  titleKey?: string;
  slug: string;
  layoutSlug?: string;
  logo: string;
  cover?: string;
  color: string;
  featured?: boolean;
  summary?: string;
  summaryTranslations?: ProjectTranslation;
  summaryKey?: string;
  text?: string;
  textTranslations?: ProjectTranslation;
  heroImage?: string;
  clientLogoSvg?: string | null;
  images?: string[];
  source?: "local" | "backend";
};
