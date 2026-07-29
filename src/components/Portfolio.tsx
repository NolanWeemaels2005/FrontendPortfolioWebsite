import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { useAllProjectsQuery, useFeaturedProjectsQuery } from "../data/projectQueries";
import { useTilt } from "../hooks/useTilt";
import { useLanguage } from "../i18n/LanguageContext";
import { responsiveImageSrcSet } from "../utils/asset";

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
  const [showAllMobileProjects, setShowAllMobileProjects] = useState(false);
  const featuredTilt = useTilt({ max: 7, scale: 1.018 });
  const projectTilt = useTilt({ max: 9, scale: 1.02 });
  const isShowcase = variant === "showcase";

  function rememberPortfolioScroll() {
    window.sessionStorage.setItem("portfolio-scroll-y", String(window.scrollY));
  }

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

        <div className="featured-grid">
          {featuredProjects.map((project, index) => (
            (() => {
              const classSlug = projectClassSlug(project.layoutSlug || project.slug);
              const projectTitle = project.titleKey ? t(project.titleKey) : project.title;

              return (
                <div className={`featured-item featured-card--${classSlug}`} key={project.slug}>
                  <Link
                    to={`/portfolio/${project.slug}/`}
                    className="featured-card"
                    data-cursor="soft"
                    data-reveal
                    id={project.slug}
                    onClick={rememberPortfolioScroll}
                    style={{ "--accent": project.color, "--featured-delay": `${Math.min(index * 80, 520)}ms` } as CSSProperties}
                    {...featuredTilt}
                  >
                    {project.cover ? (
                      <img
                        className="featured-card__cover"
                        src={project.cover}
                        srcSet={responsiveImageSrcSet(project.cover, 640, 1280)}
                        sizes="(max-width: 760px) calc(100vw - 2rem), (max-width: 1200px) 50vw, 580px"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <span className="featured-card__wash" />
                    <img
                      className="featured-card__logo"
                      src={project.logo}
                      alt={projectTitle}
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                  <Link className="featured-card__label" to={`/portfolio/${project.slug}/`} onClick={rememberPortfolioScroll}>
                    {projectTitle}
                    <ArrowRight aria-hidden="true" size={20} strokeWidth={3} />
                  </Link>
                </div>
              );
            })()
          ))}
        </div>

        <div className={isShowcase ? "portfolio-showcase-all-section" : undefined}>
          {isShowcase ? (
            <h2 className="all-projects-title portfolio-showcase-all-title" data-reveal>
              <span>{t("portfolio.all")}</span>
              <strong>{t("portfolio.aToZ")}</strong>
            </h2>
          ) : (
            <h2 className="all-projects-title" data-reveal>{t("portfolio.all")}</h2>
          )}

          <div className={`project-grid ${allProjects.length % 3 === 1 ? "project-grid--remainder-1" : ""} ${showAllMobileProjects ? "is-mobile-expanded" : ""}`}>
            {allProjects.map((project) => (
              (() => {
                const classSlug = projectClassSlug(project.layoutSlug || project.slug);

                return (
              <Link
                to={`/portfolio/${project.slug}/`}
                className={`project-card project-card--${classSlug} ${project.source === "backend" ? "project-card--backend" : ""}`}
                data-cursor="soft"
                data-reveal
                key={project.slug}
                onClick={rememberPortfolioScroll}
                {...projectTilt}
              >
                <span className="project-card__logo-wrap" data-cursor-surface>
                  <img
                    className="project-card__logo"
                    src={project.logo}
                    alt={project.titleKey ? t(project.titleKey) : project.title}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="project-card__label">
                  {project.titleKey ? t(project.titleKey) : project.title}
                  <ArrowRight aria-hidden="true" size={24} strokeWidth={3} />
                </span>
              </Link>
                );
              })()
            ))}
          </div>
          {isShowcase && allProjects.length > 6 ? (
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
