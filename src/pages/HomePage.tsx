import { Hero } from "../components/Hero";
import { HomeProjectScroll } from "../components/HomeProjectScroll";
import { LogoStrip } from "../components/LogoStrip";
import { VideoPanel } from "../components/VideoPanel";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";

export function HomePage() {
  useScrollReveal();
  const { t } = useLanguage();

  return (
    <>
      <Hero
        title={t("hero.homeTitle")}
        script={t("hero.homeScript")}
        scrollText={t("hero.scroll")}
        scrollTarget="home-project-strip"
        showActions
        showStrip
        className="home-hero"
      />
      
      <section className="home-video section-black">
        
      </section>
      <HomeProjectScroll />
      
    </>
  );
}
