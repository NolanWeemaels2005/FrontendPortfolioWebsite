import { Link, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo } from "react";
import { Footer } from "./components/Footer";
import { Navigation } from "./components/Navigation";
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
const AdminPage = lazy(() => pageModuleLoaders.admin().then((module) => ({ default: module.AdminPage })));
const LegalPage = lazy(() => pageModuleLoaders.legal().then((module) => ({ default: module.LegalPage })));
const notFoundProjectPool = featuredProjects.filter((project) => project.logo);

function ScrollToTop() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) {
      const scrollToHash = () => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: "start" });
      const frame = window.requestAnimationFrame(scrollToHash);
      const timeout = window.setTimeout(scrollToHash, 120);
      const settledTimeout = window.setTimeout(scrollToHash, 700);

      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timeout);
        window.clearTimeout(settledTimeout);
      };
    }
    if (pathname === "/portfolio" && window.sessionStorage.getItem("portfolio-scroll-y")) return;

    const scrollTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollTop();
    const frame = window.requestAnimationFrame(scrollTop);
    const timeout = window.setTimeout(scrollTop, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [hash, pathname]);

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
                {project.logo ? <img className="not-found-project__logo" src={project.logo} alt="" loading="lazy" decoding="async" /> : null}
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

  return (
    <>
      <InitialLoader pathname={location.pathname} />
      <Seo />
      <ScrollToTop />
      <Navigation />
      <main className="page-shell" key={location.pathname}>
        <Suspense fallback={null}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/beheer" element={<AdminPage />} />
            <Route path="/cookiebeleid" element={<LegalPage type="cookies" />} />
            <Route path="/juridische-voorwaarden" element={<LegalPage type="terms" />} />
            <Route path="/privacybeleid" element={<LegalPage type="privacy" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <WhatsAppPopup />
      <Footer />
    </>
  );
}
