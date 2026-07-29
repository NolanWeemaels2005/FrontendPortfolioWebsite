import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useParams } from "react-router-dom";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { useCombinedProjectsQuery, useProjectQuery } from "../data/projectQueries";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import type { Project } from "../types/project";
import { getAdminToken } from "../utils/adminAuth";
import { getProjectDescription } from "../utils/projectText";

export function ProjectDetailPage() {
  useScrollReveal();
  const { language, t } = useLanguage();
  const { slug } = useParams();
  const { data: project, isLoading, isFetching } = useProjectQuery(slug);
  const { data: combinedProjects = [] } = useCombinedProjectsQuery();
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAdminToken()));
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const galleryImages = project?.images || [];
  const activeImage = activeImageIndex === null ? null : galleryImages[activeImageIndex];

  useLayoutEffect(() => {
    document.body.classList.add("project-route");
    return () => document.body.classList.remove("project-route");
  }, []);

  useEffect(() => {
    const updateLoginState = () => setIsLoggedIn(Boolean(getAdminToken()));
    window.addEventListener("admin-auth-change", updateLoginState);
    return () => window.removeEventListener("admin-auth-change", updateLoginState);
  }, []);

  function showPreviousImage() {
    setActiveImageIndex((current) => {
      if (current === null) return current;
      return current === 0 ? galleryImages.length - 1 : current - 1;
    });
  }

  function showNextImage() {
    setActiveImageIndex((current) => {
      if (current === null) return current;
      return current === galleryImages.length - 1 ? 0 : current + 1;
    });
  }

  useEffect(() => {
    if (activeImageIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImageIndex(null);
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    document.documentElement.classList.add("project-lightbox-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.classList.remove("project-lightbox-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, galleryImages.length]);

  if (!project && (isLoading || isFetching)) {
    return (
      <section className="project-detail section-black">
        <div className="section-container project-detail__hero">
          <p className="eyebrow">Project</p>
          <div className="project-detail__title">
            <h1>Laden...</h1>
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return <Navigate to="/portfolio" replace />;
  }

  const projectTitle = project.titleKey ? t(project.titleKey) : project.title;
  const projectApproach = getProjectDescription(project, language, t);
  const relatedProjects = getRelatedProjects(combinedProjects, project.slug);

  return (
    <section className="project-detail section-black">
      <div className="section-container project-detail__hero" data-reveal>
        <div className="project-detail__topbar">
          <Link to="/portfolio" className="back-link" data-cursor="soft">
            <ArrowLeft aria-hidden="true" size={22} />
            {t("project.back")}
          </Link>
          {isLoggedIn ? (
            <Link to={`/beheer?project=${project.slug}`} className="btn btn--primary project-detail__edit" data-cursor="merge">
              Bewerk
            </Link>
          ) : null}
        </div>

        <div className="project-detail__title">
          <p className="eyebrow">{t("project.eyebrow")}</p>
          <h1>{projectTitle}</h1>
        </div>
      </div>

      <div className={`section-container project-detail__showcase ${project.source === "backend" ? "project-detail__showcase--backend" : ""}`} data-reveal>
        <img className="project-detail__logo" src={project.logo} alt={projectTitle} />
      </div>

      <div className="section-container project-detail__content" data-reveal>
        <div>
          <p className="eyebrow">{t("project.approach")}</p>
          <p>{projectApproach}</p>
        </div>
        <Link to="/contact" className="btn btn--primary" data-cursor="merge">
          <ButtonTextStagger text={t("cta.letsTalk")} />
        </Link>
      </div>

      {galleryImages.length ? (
        <div className="section-container project-detail__gallery" data-reveal>
          {galleryImages.map((image, index) => (
            <button
              type="button"
              className="project-detail__gallery-button"
              onClick={(event) => {
                event.currentTarget.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                window.setTimeout(() => setActiveImageIndex(index), 180);
              }}
              aria-label={`${projectTitle} beeld ${index + 1} openen`}
              key={image}
            >
              <img src={image} alt={`${projectTitle} beeld ${index + 1}`} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      ) : null}

      {relatedProjects.length ? (
        <section className="section-container related-projects" data-reveal>
          <h2>Bekijk ook zeker deze projecten:</h2>
          <div className="related-projects__grid">
            {relatedProjects.map((relatedProject) => {
              const relatedTitle = relatedProject.titleKey ? t(relatedProject.titleKey) : relatedProject.title;

              return (
                <Link to={`/portfolio/${relatedProject.slug}`} className="related-project-card" key={relatedProject.slug}>
                  <span className="related-project-card__logo-wrap">
                    <img src={relatedProject.logo} alt={relatedTitle} loading="lazy" decoding="async" />
                  </span>
                  <span>{relatedTitle}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeImage && typeof document !== "undefined" ? createPortal(
        <div className="project-lightbox" role="dialog" aria-modal="true" aria-label={`${projectTitle} galerij`}>
          <button
            type="button"
            className="project-lightbox__backdrop"
            onClick={() => setActiveImageIndex(null)}
            aria-label="Galerij sluiten"
          />
          <button
            type="button"
            className="project-lightbox__close"
            onClick={() => setActiveImageIndex(null)}
            aria-label="Galerij sluiten"
          >
            <X aria-hidden="true" size={34} strokeWidth={3} />
          </button>
          <button
            type="button"
            className="project-lightbox__nav project-lightbox__nav--prev"
            onClick={showPreviousImage}
            aria-label="Vorige foto"
          >
            <ChevronLeft aria-hidden="true" size={42} strokeWidth={2.8} />
          </button>
          <figure className="project-lightbox__figure">
            <img src={activeImage} alt={`${projectTitle} beeld ${(activeImageIndex || 0) + 1}`} />
          </figure>
          <button
            type="button"
            className="project-lightbox__nav project-lightbox__nav--next"
            onClick={showNextImage}
            aria-label="Volgende foto"
          >
            <ChevronRight aria-hidden="true" size={42} strokeWidth={2.8} />
          </button>
        </div>,
        document.body,
      ) : null}
    </section>
  );
}

function seededProjectScore(seed: string, value: string) {
  const input = `${seed}:${value}`;
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getRelatedProjects(projects: Project[], currentSlug: string) {
  return projects
    .filter((project) => project.slug !== currentSlug && project.logo)
    .map((project) => ({ project, score: seededProjectScore(currentSlug, project.slug) }))
    .sort((projectA, projectB) => projectA.score - projectB.score)
    .slice(0, 4)
    .map(({ project }) => project);
}
