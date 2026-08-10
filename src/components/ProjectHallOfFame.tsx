import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { featuredProjects } from "../data/projects";
import { useFeaturedProjectsQuery } from "../data/projectQueries";
import { useLanguage } from "../i18n/LanguageContext";
import type { Project } from "../types/project";
import { previewImageUrl, responsiveImageSrcSet } from "../utils/asset";

function splitColumns(projects: Project[]) {
  const columns: Project[][] = [[], [], []];
  projects.forEach((project, index) => {
    columns[index % columns.length].push(project);
  });
  return columns;
}

const featuredCoverBySlug = new Map(featuredProjects.map((project) => [project.slug.replace(/\.$/, ""), project.cover]));
const featuredColorBySlug = new Map(featuredProjects.map((project) => [project.slug.replace(/\.$/, ""), project.color]));

function getProjectCover(project: Project) {
  return project.cover || project.heroImage || featuredCoverBySlug.get(project.slug.replace(/\.$/, ""));
}

function getProjectAccent(project: Project) {
  const color = featuredColorBySlug.get(project.slug.replace(/\.$/, "")) || project.color;
  return color === "#000" ? "#ee9d59" : color;
}

export function ProjectHallOfFame() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: projects = [] } = useFeaturedProjectsQuery();
  const columns = useMemo(() => splitColumns(projects.filter((project) => project.logo || getProjectCover(project))), [projects]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    const syncProgress = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height + window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / distance));
      section.style.setProperty("--hall-progress", `${progress}`);
    };

    const requestSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncProgress();
      });
    };

    syncProgress();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);

  function rememberPortfolioScroll() {
    window.sessionStorage.setItem("portfolio-scroll-y", String(window.scrollY));
  }

  return (
    <section className="project-hall" ref={sectionRef}>
      <div className="project-hall__inner">
        <header className="project-hall__heading">
          <span>{t("portfolio.hallEyebrow")}</span>
          <strong>{t("portfolio.hallTitle")}</strong>
        </header>

        <div className="project-hall__grid">
          {columns.map((column, columnIndex) => (
            <div className={`project-hall__column project-hall__column--${columnIndex + 1}`} key={columnIndex}>
              {column.map((project) => {
                const cover = getProjectCover(project);
                const title = project.titleKey ? t(project.titleKey) : project.title;

                return (
                  <Link className="project-hall-card" to={`/portfolio/${project.slug}/`} key={project.slug} onClick={rememberPortfolioScroll}>
                    <span className="project-hall-card__media" style={{ "--hall-accent": getProjectAccent(project) } as CSSProperties}>
                      {cover ? (
                        <img
                          className="project-hall-card__cover"
                          src={cover}
                          srcSet={responsiveImageSrcSet(cover, 640, 1280)}
                          sizes="(max-width: 760px) calc(100vw - 2rem), 390px"
                          alt=""
                          width="1280"
                          height="1600"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                      <span className="project-hall-card__shade" />
                      {project.logo ? (
                        <img
                          className="project-hall-card__logo"
                          src={previewImageUrl(project.logo, 256)}
                          alt={title}
                          width="512"
                          height="512"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </span>
                    <span className="project-hall-card__label">
                      <ButtonTextStagger text={title} />
                      <ArrowRight aria-hidden="true" size={24} strokeWidth={3} />
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
