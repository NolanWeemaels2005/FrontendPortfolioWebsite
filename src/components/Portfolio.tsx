import { getProjectCaseStudy } from "../data/projectCaseStudies";
import { ProjectFilters } from "./ProjectFilters";
import { PortfolioHoverImage } from "./PortfolioHoverImage";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { useAllProjectsQuery, useFeaturedProjectsQuery } from "../data/projectQueries";
import { useTilt } from "../hooks/useTilt";
import { useLanguage } from "../i18n/LanguageContext";
import { previewImageUrl } from "../utils/asset";
import { HallOfFameGrid } from "./HallOfFameGrid";
import { portfolioHoverImages } from "../data/portfolioHoverImages";
import "../styles/portfolio-hover.css";

function projectClassSlug(slug: string) {
  return slug.replace(/[^a-z0-9-]/gi, "");
}

type PortfolioProps = {
  variant?: "default" | "showcase";
};

export function Portfolio({ variant = "default" }: PortfolioProps) {
  const { t } = useLanguage();
  const { data: featuredProjects = [] } = useFeaturedProjectsQuery();
  const { data: allProjects = [] } = useAllProjectsQuery();
  const [service, setService] = useState("");
  const [year, setYear] = useState("");
  const services = [...new Set(allProjects.flatMap((project) => getProjectCaseStudy(project.slug)?.services || []))].sort();
  const years = [...new Set(allProjects.map((project) => getProjectCaseStudy(project.slug)?.year).filter((value): value is string => Boolean(value)))].sort().reverse();
  const filteredProjects = allProjects.filter((project) => {
    const facts = getProjectCaseStudy(project.slug);
    return (!service || facts?.services.includes(service)) && (!year || facts?.year === year);
  });
  const filtering = Boolean(service || year);
  const [showAllMobileProjects, setShowAllMobileProjects] = useState(false);
  const projectTilt = useTilt({ max: 9, scale: 1.02 });
  const isShowcase = variant === "showcase";


  return (
    <section className={`portfolio ${isShowcase ? "portfolio--showcase" : ""}`} id="portfolio">
      <div className="section-container">
        {isShowcase ? (
          <h2 className="portfolio-showcase-heading" data-reveal>
            <span>{t("portfolio.hallEyebrow")}</span>
            <strong>{t("portfolio.hallTitle")}</strong>
          </h2>
        ) : (
          <h2 data-reveal>{t("portfolio.featured")}</h2>
        )}

        <HallOfFameGrid projects={featuredProjects} />

        <div className={isShowcase ? "portfolio-showcase-all-section" : undefined}>
          {isShowcase ? (
            <h2 className="all-projects-title portfolio-showcase-all-title" data-reveal>
              <span>{t("portfolio.all")}</span>
              <strong>{t("portfolio.aToZ")}</strong>
            </h2>
          ) : (
            <h2 className="all-projects-title" data-reveal>{t("portfolio.all")}</h2>
          )}

          <ProjectFilters services={services} years={years} service={service} year={year} count={filteredProjects.length} onService={setService} onYear={setYear} />

          {filteredProjects.length === 0 && <p role="status">{t("filter.empty")}</p>}
          <div className={`project-grid ${showAllMobileProjects || filtering ? "is-mobile-expanded" : ""}`}>
            {filteredProjects.map((project) => (
              (() => {
                const classSlug = projectClassSlug(project.layoutSlug || project.slug);
                const facts = getProjectCaseStudy(project.slug);
                const hoverImage = isShowcase ? portfolioHoverImages[facts?.heroImage || ""] : undefined;

                return (
              <Link
                to={`/portfolio/${project.slug}/`}
                className={`project-card project-card--${classSlug}${hoverImage ? " project-card--image-hover" : ""} ${project.source === "backend" ? "project-card--backend" : ""}`}
                data-cursor="project"
                key={project.slug}

                {...(isShowcase ? {} : projectTilt)}
              >
                <span className="project-card__logo-wrap" data-cursor-surface>
                  <img
                    className="project-card__logo"
                    src={previewImageUrl(project.logo, 800)}
                    alt={project.titleKey ? t(project.titleKey) : project.title}
                    width="512"
                    height="512"
                    loading="lazy"
                    decoding="async"
                  />
                  {hoverImage && <PortfolioHoverImage {...hoverImage} />}
                  {isShowcase && <span className="project-card__services">
                    {facts?.services.map((service) => <span key={service}>{t(`portfolio.service.${service}`)}</span>)}
                  </span>}
                </span>
                <span className="project-card__label">
                  <ButtonTextStagger text={project.titleKey ? t(project.titleKey) : project.title} />
                  <ArrowRight aria-hidden="true" size={24} strokeWidth={3} />
                </span>
              </Link>
                );
              })()
            ))}
          </div>
          {isShowcase && !filtering && allProjects.length > 6 ? (
            <button
              className="portfolio-showcase-show-more"
              type="button"
              aria-expanded={showAllMobileProjects}
              onClick={() => setShowAllMobileProjects((current) => !current)}
            >
              <ButtonTextStagger text={showAllMobileProjects ? t("portfolio.showLess") : t("portfolio.showMore")} />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
