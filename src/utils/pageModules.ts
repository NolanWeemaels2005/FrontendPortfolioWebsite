export const pageModuleLoaders = {
  home: () => import("../pages/HomePage"),
  portfolio: () => import("../pages/PortfolioPage"),
  projectDetail: () => import("../pages/ProjectDetailPage"),
  about: () => import("../pages/AboutPage"),
  contact: () => import("../pages/ContactPage"),
  admin: () => import("../pages/AdminPage"),
  legal: () => import("../pages/LegalPage"),
} as const;

export type PageModuleKey = keyof typeof pageModuleLoaders;

export const publicPageModuleKeys: PageModuleKey[] = [
  "home",
  "portfolio",
  "projectDetail",
  "about",
  "contact",
  "legal",
];

export function getPageModuleKey(pathname: string): PageModuleKey | null {
  if (pathname === "/") return "home";
  if (pathname === "/portfolio") return "portfolio";
  if (pathname.startsWith("/portfolio/")) return "projectDetail";
  if (pathname === "/about") return "about";
  if (pathname === "/contact") return "contact";
  if (pathname === "/beheer") return "admin";
  if (["/cookiebeleid", "/juridische-voorwaarden", "/privacybeleid"].includes(pathname)) return "legal";
  return null;
}
