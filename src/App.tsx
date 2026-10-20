import { Link, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useLayoutEffect, useMemo } from "react";
import { PageContactCta } from "./components/PageContactCta";
import { Footer } from "./components/Footer";
import { Navigation } from "./components/Navigation";
import { CustomCursor } from "./components/CustomCursor";
import { Seo } from "./components/Seo";
import { WhatsAppPopup } from "./components/WhatsAppPopup";
import { InitialLoader } from "./components/InitialLoader";
import { ButtonTextStagger } from "./components/ButtonTextStagger";
import { pageModuleLoaders } from "./utils/pageModules";
import { featuredProjects } from "./data/projects";
import { useLanguage } from "./i18n/LanguageContext";

const HomePage = lazy(() => pageModuleLoaders.home().then((module) => ({ default: module.HomePage })));
const PortfolioPage = lazy(() => pageModuleLoaders.portfolio().then((module) => ({ default: module.PortfolioPage })));
const ProjectDetailPage = lazy(() => pageModuleLoaders.projectDetail().then((module) => ({ default: module.ProjectDetailPage })));
const AboutPage = lazy(() => pageModuleLoaders.about().then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => pageModuleLoaders.contact().then((module) => ({ default: module.ContactPage })));
const LegalPage = lazy(() => pageModuleLoaders.legal().then((module) => ({ default: module.LegalPage })));
const BlogPage = lazy(() => pageModuleLoaders.blog().then(module => ({ default: module.BlogPage })));
const BlogPostPage = lazy(() => pageModuleLoaders.blogPost().then(module => ({ default: module.BlogPostPage })));
const BlogAdminPage = lazy(() => pageModuleLoaders.blogAdmin().then(module => ({ default: module.BlogAdminPage })));
const notFoundProjectPool = featuredProjects.filter((project) => project.logo);
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

function NotFoundPage() {
  const { t } = useLanguage();
  const notFoundProjects = useMemo(() => {
    return [...notFoundProjectPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, []);

  useLayoutEffect(() => {
    document.body.classList.add("not-found-route");
    return () => document.body.classList.remove("not-found-route");
  }, []);

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-page__inner">
        <div className="not-found-page__copy">
          <h1 id="not-found-title">
            <span>{t("notFound.titleLineOne")}</span>
            <strong>{t("notFound.titleLineTwo")}</strong>
          </h1>
          <p>{t("notFound.body")}</p>

          <div className="not-found-page__actions">
            <Link to="/contact/" className="home-landing__action home-landing__action--primary" data-cursor="merge">
              <ButtonTextStagger text={t("notFound.talk")} />
            </Link>
            <Link to="/portfolio/" className="home-landing__action home-landing__action--secondary" data-cursor="merge">
              <ButtonTextStagger text={t("notFound.portfolio")} />
            </Link>
          </div>
        </div>

        <div className="not-found-page__suggestions">
          <h2>{t("notFound.projects")}</h2>
          <div className="not-found-page__projects" aria-label={t("notFound.projectsLabel")}>
            {notFoundProjects.map((project) => (
              <Link
                to={`/portfolio/${project.slug}/`}
                className="not-found-project"
                data-cursor="merge"
                key={project.slug}
                aria-label={`${t("notFound.viewProject")} ${project.title}`}
              >
                {project.logo ? <img className="not-found-project__logo" src={project.logo} alt="" width="512" height="512" loading="lazy" decoding="async" /> : null}
                <span className="not-found-project__title">{project.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
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
