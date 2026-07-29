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
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  if (path === "/") return "home";
  if (path === "/portfolio") return "portfolio";
  if (path.startsWith("/portfolio/")) return "projectDetail";
  if (path === "/about") return "about";
  if (path === "/contact") return "contact";
  if (path === "/beheer") return "admin";
  if (["/cookiebeleid", "/juridische-voorwaarden", "/privacybeleid"].includes(path)) return "legal";
  return null;
}

export function preloadPageModule(pathname: string) {
  const key = getPageModuleKey(pathname);
  return key ? pageModuleLoaders[key]() : Promise.resolve();
}
