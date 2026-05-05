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
  summaryKey?: string;
  text?: string;
  heroImage?: string;
  clientLogoSvg?: string | null;
  images?: string[];
  source?: "local" | "backend";
};
