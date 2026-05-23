import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useAllProjectsQuery, useFeaturedProjectsQuery } from "../data/projectQueries";
import { useTilt } from "../hooks/useTilt";
import { useLanguage } from "../i18n/LanguageContext";

function projectClassSlug(slug: string) {
  return slug.replace(/[^a-z0-9-]/gi, "");
}

export function Portfolio() {
  const { t } = useLanguage();
  const { data: featuredProjects } = useFeaturedProjectsQuery();
  const { data: allProjects = [] } = useAllProjectsQuery();
  const featuredTilt = useTilt({ max: 7, scale: 1.018 });
  const projectTilt = useTilt({ max: 9, scale: 1.02 });

  function rememberPortfolioScroll() {
    window.sessionStorage.setItem("portfolio-scroll-y", String(window.scrollY));
  }

  return (
    <section className="portfolio" id="portfolio">
      <div className="section-container">
        <h2 data-reveal>{t("portfolio.featured")}</h2>

        <div className="featured-grid">
          {featuredProjects.map((project, index) => (
            (() => {
              const classSlug = projectClassSlug(project.layoutSlug || project.slug);

              return (
            <Link
              to={`/portfolio/${project.slug}`}
              className={`featured-card featured-card--${classSlug}`}
              data-cursor="soft"
              data-reveal
              id={project.slug}
              key={project.slug}
              onClick={rememberPortfolioScroll}
              style={{ "--accent": project.color, "--featured-delay": `${Math.min(index * 80, 520)}ms` } as CSSProperties}
              {...featuredTilt}
            >
              {project.cover ? <img className="featured-card__cover" src={project.cover} alt="" /> : null}
              <span className="featured-card__wash" />
              <img className="featured-card__logo" src={project.logo} alt={project.titleKey ? t(project.titleKey) : project.title} />
            </Link>
              );
            })()
          ))}
        </div>

        <h2 className="all-projects-title" data-reveal>{t("portfolio.all")}</h2>

        <div className="project-grid">
          {allProjects.map((project) => (
            (() => {
              const classSlug = projectClassSlug(project.layoutSlug || project.slug);

              return (
            <Link
              to={`/portfolio/${project.slug}`}
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
      </div>
    </section>
  );
}
