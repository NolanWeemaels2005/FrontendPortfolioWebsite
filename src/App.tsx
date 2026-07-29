import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Footer } from "./components/Footer";
import { Navigation } from "./components/Navigation";
import { Seo } from "./components/Seo";
import { WhatsAppPopup } from "./components/WhatsAppPopup";
import { InitialLoader } from "./components/InitialLoader";
import { pageModuleLoaders } from "./utils/pageModules";

const HomePage = lazy(() => pageModuleLoaders.home().then((module) => ({ default: module.HomePage })));
const PortfolioPage = lazy(() => pageModuleLoaders.portfolio().then((module) => ({ default: module.PortfolioPage })));
const ProjectDetailPage = lazy(() => pageModuleLoaders.projectDetail().then((module) => ({ default: module.ProjectDetailPage })));
const AboutPage = lazy(() => pageModuleLoaders.about().then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => pageModuleLoaders.contact().then((module) => ({ default: module.ContactPage })));
const AdminPage = lazy(() => pageModuleLoaders.admin().then((module) => ({ default: module.AdminPage })));
const LegalPage = lazy(() => pageModuleLoaders.legal().then((module) => ({ default: module.LegalPage })));

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
          </Routes>
        </Suspense>
      </main>
      <WhatsAppPopup />
      <Footer />
    </>
  );
}
