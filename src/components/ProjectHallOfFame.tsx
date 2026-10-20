import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { useFeaturedProjectsQuery } from "../data/projectQueries";
import { useLanguage } from "../i18n/LanguageContext";
import type { Project } from "../types/project";
import { HallOfFameCard } from "./HallOfFameGrid";

function splitColumns(projects: Project[]) {
  const columns: Project[][] = [[], [], []];
  projects.forEach((project, index) => {
    columns[index % columns.length].push(project);
  });
  return columns;
}

export function ProjectHallOfFame() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: projects = [] } = useFeaturedProjectsQuery();
  const columns = useMemo(() => splitColumns(projects), [projects]);

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

  return (
    <section className="project-hall project-hall--classic" ref={sectionRef} aria-labelledby="home-hall-heading">
      <div className="project-hall__inner">
        <header className="project-hall__heading">
          <h2 id="home-hall-heading">
            <span>{t("portfolio.hallEyebrow")}</span>
            <strong>{t("portfolio.hallTitle")}</strong>
          </h2>
        </header>

        <div className="project-hall__grid">
          {columns.map((column, columnIndex) => (
            <div className={`project-hall__column project-hall__column--${columnIndex + 1}`} key={columnIndex}>
              {column.map((project) => {
                const title = project.titleKey ? t(project.titleKey) : project.title;

                return (
                  <div className="project-hall-card" key={project.slug}>
                    <HallOfFameCard project={project} variant="home" />
                    <Link className="project-hall-card__label" to={`/portfolio/${project.slug}/`}>
                      <ButtonTextStagger text={title} wrap />
                      <ArrowRight aria-hidden="true" size={24} strokeWidth={3} />
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
