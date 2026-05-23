import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useFeaturedProjectsQuery } from "../data/projectQueries";
import { useLanguage } from "../i18n/LanguageContext";
import type { Project } from "../types/project";

type ScrollProjectCardProps = {
  project: Project;
  index: number;
  setCardRef: (index: number, element: HTMLAnchorElement | null) => void;
};

function ScrollProjectCard({ project, index, setCardRef }: ScrollProjectCardProps) {
  const { t } = useLanguage();
  const projectTitle = project.titleKey ? t(project.titleKey) : project.title;

  return (
    <Link
      to={`/portfolio/${project.slug}`}
      className="scroll-project-card"
      data-cursor="soft"
      ref={(element) => setCardRef(index, element)}
      style={{
        "--offset": index,
        "--abs-offset": Math.min(index, 3),
        "--z": 20 - Math.round(index * 2),
      } as CSSProperties}
    >
      <span className="scroll-project-card__surface">
        {project.cover ? (
          <img className="scroll-project-card__cover" src={project.cover} alt={projectTitle} loading="lazy" decoding="async" />
        ) : null}
        <span className="scroll-project-card__shade" />
        <img className="scroll-project-card__logo" src={project.logo} alt="" loading="lazy" decoding="async" />
      </span>
    </Link>
  );
}

export function HomeProjectScroll() {
  const { data: featuredProjects } = useFeaturedProjectsQuery();
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  function setCardRef(index: number, element: HTMLAnchorElement | null) {
    cardRefs.current[index] = element;
  }

  const updateCards = useCallback((active: number) => {
    const projectCount = Math.max(featuredProjects.length, 1);

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - active;
      if (offset > projectCount / 2) offset -= projectCount;
      if (offset < -projectCount / 2) offset += projectCount;

      const absOffset = Math.abs(offset);
      const clamped = Math.min(absOffset, 3);

      card.style.setProperty("--offset", offset.toFixed(4));
      card.style.setProperty("--abs-offset", clamped.toFixed(4));
      card.style.setProperty("--z", String(20 - Math.round(absOffset * 2)));
      card.style.setProperty("--intro-delay", `${Math.min(index * 70, 360)}ms`);
    });
  }, [featuredProjects.length]);

  const goToProject = useCallback((nextIndex: number) => {
    const projectCount = Math.max(featuredProjects.length, 1);
    setActiveIndex(((nextIndex % projectCount) + projectCount) % projectCount);
  }, [featuredProjects.length]);

  function goToRelativeProject(direction: -1 | 1) {
    goToProject(activeIndex + direction);
  }

  useEffect(() => {
    updateCards(activeIndex);
    window.requestAnimationFrame(() => {
      document.getElementById("home-project-strip")?.classList.add("is-ready");
    });
  }, [activeIndex, updateCards]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % Math.max(featuredProjects.length, 1));
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [activeIndex, featuredProjects.length]);

  return (
    <section
      className="home-project-scroll"
      id="home-project-strip"
      style={{ "--project-count": featuredProjects.length } as CSSProperties}
    >
      <div className="home-project-scroll__sticky">
        <div className="home-project-scroll__stage">
          {featuredProjects.map((project, index) => (
            <ScrollProjectCard
              project={project}
              index={index}
              setCardRef={setCardRef}
              key={project.slug}
            />
          ))}
        </div>
        <div className="home-project-scroll__controls" aria-label="Projectcarousel bedienen">
          <button
            type="button"
            className="home-project-scroll__button home-project-scroll__button--prev"
            onClick={() => goToRelativeProject(-1)}
            aria-label="Vorig project"
            data-cursor="merge"
          >
            <ChevronLeft aria-hidden="true" size={28} strokeWidth={3} />
          </button>
          <div className="home-project-scroll__progress" aria-hidden="true">
            <span key={activeIndex} />
          </div>
          <button
            type="button"
            className="home-project-scroll__button home-project-scroll__button--next"
            onClick={() => goToRelativeProject(1)}
            aria-label="Volgend project"
            data-cursor="merge"
          >
            <ChevronRight aria-hidden="true" size={28} strokeWidth={3} />
          </button>
        </div>
      </div>
    </section>
  );
}
