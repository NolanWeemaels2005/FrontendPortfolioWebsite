import { ScrollSectionEdge } from "../components/ScrollSectionEdge";
import { useLayoutEffect } from "react";
import { Hero } from "../components/Hero";
import { ThreeDMarquee } from "../components/lightswind/3d-marquee";
import { LogoStrip } from "../components/LogoStrip";
import { Portfolio } from "../components/Portfolio";
import { useCombinedProjectsQuery } from "../data/projectQueries";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

// The landing keeps its original photos independently of the curated Hall of Fame.
const landingProjects = [
  { slug: "brussel-noord-basket", cover: "BNB", title: "Brussel Noord Basket" },
  { slug: "erasmus-hogeschool", cover: "EHB", title: "Erasmushogeschool Brussel" },
  { slug: "videjo", cover: "VIDEJO", title: "Videjo" },
  { slug: "city-to-ocean", cover: "CTO", title: "City To Ocean" },
  { slug: "fc-eisbar", cover: "FCEISBAR", title: "FC Eisbär" },
  { slug: "shift-festival-2026", cover: "SHIFT", title: "Shift Festival 2026" },
  { slug: "ring-tv", cover: "RING", title: "Ring TV" },
  { slug: "mentalite-sportswear", cover: "MENTALITE", title: "Mentalité Sportswear" },
];

export function PortfolioPage() {
  useScrollReveal();
  const { t } = useLanguage();
  const { data: projects = [] } = useCombinedProjectsQuery();
  const marqueeImages = landingProjects.map((landing) => {
    const project = projects.find((item) => item.slug === landing.slug || item.slug.startsWith(`${landing.slug}-`));
    return {
      src: assetPath(`assets/project-covers/cover${landing.cover}.webp`),
      alt: project?.titleKey ? t(project.titleKey) : project?.title || landing.title,
      logoSrc: project?.logo || undefined,
      href: `/portfolio/${project?.slug || landing.slug}/`,
    };
  });

  useLayoutEffect(() => {
    document.body.classList.add("portfolio-route");
    return () => document.body.classList.remove("portfolio-route");
  }, []);


  return (
    <>
      <div className="hero-overlap-scroll">
        <Hero
          title={t("hero.portfolioTitle")}
          script={t("hero.portfolioScript")}
          className="portfolio-showcase-hero"
          visual={<ThreeDMarquee images={marqueeImages} className="portfolio-hero-marquee" />}
        />
      </div>
      <ScrollSectionEdge color="#000" />
      <div id="page-content" className="portfolio-showcase-content">
        <LogoStrip />
        <Portfolio variant="showcase" />
      </div>
    </>
  );
}
