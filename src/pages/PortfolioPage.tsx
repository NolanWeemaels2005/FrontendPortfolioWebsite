import { Hero } from "../components/Hero";
import { LogoStrip } from "../components/LogoStrip";
import { Portfolio } from "../components/Portfolio";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { useLayoutEffect } from "react";

export function PortfolioPage() {
  useScrollReveal();
  const { t } = useLanguage();

  useLayoutEffect(() => {
    const savedScrollY = window.sessionStorage.getItem("portfolio-scroll-y");
    if (!savedScrollY) return;

    window.sessionStorage.removeItem("portfolio-scroll-y");
    const scrollY = Number(savedScrollY);
    if (!Number.isFinite(scrollY)) return;

    const restore = () => window.scrollTo(0, scrollY);
    restore();
    const frame = window.requestAnimationFrame(restore);
    const timeout = window.setTimeout(restore, 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <Hero title={t("hero.portfolioTitle")} script={t("hero.portfolioScript")} scrollText={t("hero.scroll")} className="portfolio-hero" />
      <div id="page-content">
        <LogoStrip />
        <Portfolio />
      </div>
    </>
  );
}
