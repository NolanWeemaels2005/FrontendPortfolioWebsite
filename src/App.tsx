import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useLayoutEffect } from "react";
import { PageContactCta } from "./components/PageContactCta";
import { Footer } from "./components/Footer";
import { Navigation } from "./components/Navigation";
import { CustomCursor } from "./components/CustomCursor";
import { Seo } from "./components/Seo";
import { WhatsAppPopup } from "./components/WhatsAppPopup";
import { InitialLoader } from "./components/InitialLoader";
import { loadPageWithRecovery } from "./utils/assetRecovery";
import { pageModuleLoaders } from "./utils/pageModules";

const NotFoundPage = lazy(() => loadPageWithRecovery(() => import("./pages/NotFoundPage")).then(module => ({ default: module.NotFoundPage })));
const HomePage = lazy(() => loadPageWithRecovery(pageModuleLoaders.home).then((module) => ({ default: module.HomePage })));
const PortfolioPage = lazy(() => loadPageWithRecovery(pageModuleLoaders.portfolio).then((module) => ({ default: module.PortfolioPage })));
const ProjectDetailPage = lazy(() => loadPageWithRecovery(pageModuleLoaders.projectDetail).then((module) => ({ default: module.ProjectDetailPage })));
const AboutPage = lazy(() => loadPageWithRecovery(pageModuleLoaders.about).then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => loadPageWithRecovery(pageModuleLoaders.contact).then((module) => ({ default: module.ContactPage })));
const LegalPage = lazy(() => loadPageWithRecovery(pageModuleLoaders.legal).then((module) => ({ default: module.LegalPage })));
const BlogPage = lazy(() => loadPageWithRecovery(pageModuleLoaders.blog).then(module => ({ default: module.BlogPage })));
const BlogPostPage = lazy(() => loadPageWithRecovery(pageModuleLoaders.blogPost).then(module => ({ default: module.BlogPostPage })));
const BlogAdminPage = lazy(() => loadPageWithRecovery(pageModuleLoaders.blogAdmin).then(module => ({ default: module.BlogAdminPage })));
const routeBodyClasses = [
  "home-route",
  "portfolio-route",
  "about-route",
  "contact-route",
  "project-route",
  "legal-route",
  "admin-route",
  "blog-route",
  "not-found-route",
] as const;
const legalPaths = new Set(["/cookiebeleid", "/juridische-voorwaarden", "/privacybeleid"]);

function normalizePathname(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function getRouteBodyClass(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === "/") return "home-route";
  if (normalizedPathname === "/portfolio") return "portfolio-route";
  if (normalizedPathname.startsWith("/portfolio/")) return "project-route";
  if (normalizedPathname === "/about") return "about-route";
  if (normalizedPathname === "/contact") return "contact-route";
  if (normalizedPathname === "/blog" || normalizedPathname.startsWith("/blog/")) return "blog-route";
  if (normalizedPathname === "/beheer" || normalizedPathname.startsWith("/beheer/")) return "admin-route";
  if (legalPaths.has(normalizedPathname)) return "legal-route";

  return "not-found-route";
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Route changes start immediately at the top; in-page anchor clicks remain usable.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export function App() {
  const location = useLocation();
  const routeBodyClass = getRouteBodyClass(location.pathname);

  useLayoutEffect(() => {
    document.body.classList.remove(...routeBodyClasses);
    document.body.classList.add(routeBodyClass);
  }, [location.pathname, routeBodyClass]);

  return (
    <>
      <InitialLoader pathname={location.pathname} />
      <Seo />
      <ScrollToTop />
      <Navigation />
      <CustomCursor />
      <main className="page-shell" key={location.pathname}>
        <Suspense fallback={null}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/beheer/blog" element={<BlogAdminPage />} />
            <Route path="/beheer/blog/:id" element={<BlogAdminPage />} />
            <Route path="/beheer" element={<BlogAdminPage />} />
            <Route path="/cookiebeleid" element={<LegalPage type="cookies" />} />
            <Route path="/juridische-voorwaarden" element={<LegalPage type="terms" />} />
            <Route path="/privacybeleid" element={<LegalPage type="privacy" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          {!location.pathname.startsWith("/beheer") && location.pathname.replace(/\/+$/, "") !== "/contact" && <PageContactCta />}
        </Suspense>
      </main>
      <WhatsAppPopup />
      <Footer />
    </>
  );
}
