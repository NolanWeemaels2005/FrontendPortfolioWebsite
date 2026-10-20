import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
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
import { getProjectCaseStudy } from "../data/projectCaseStudies";
import { backendProjectTranslations } from "../data/backendProjectTranslations";
import { assetPath } from "../utils/asset";
import "../styles/project-case.css";

const projectSlugAliases: Record<string, string> = {
  nieuwland: "basisschool-nieuwland",
  "shift-festival": "shift-festival-2026",
  erasmus: "erasmus-hogeschool",
  mentalite: "mentalite-sportswear",
};

export function ProjectDetailPage() {
  useScrollReveal();
  const { language, t } = useLanguage();
  const { slug } = useParams();
  const canonicalSlug = slug ? projectSlugAliases[slug] || slug : slug;
  const { data: project, isLoading, isFetching } = useProjectQuery(canonicalSlug);
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

  if (slug && canonicalSlug !== slug) {
    return <Navigate to={`/portfolio/${canonicalSlug}/`} replace />;
  }

  if (!project && (isLoading || isFetching)) {
    return (
      <section className="project-detail section-black">
        <div className="section-container project-detail__hero">
          <p className="eyebrow">Project</p>
          <div className="project-detail__title">
            <h1>{t("case.loading")}</h1>
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return <Navigate to="/portfolio/" replace />;
  }

  const projectTitle = project.titleKey ? t(project.titleKey) : project.title;
  const facts = getProjectCaseStudy(project.slug);
  const projectApproach = (project.source !== "backend" && backendProjectTranslations[project.slug]?.[language])
    || getProjectDescription(project, language, t);
  const paragraphs = projectApproach.split(/\n\s*\n/).filter(Boolean);
  const customHero = facts?.heroImage ? assetPath(`assets/project-heroes/${facts.heroImage}`) : undefined;
  const heroImage = customHero ? `${customHero}-1800.jpg` : project.heroImage || project.cover || galleryImages[0];
  const intro = projectApproach.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || projectApproach;
  // The opening already shows this sentence; continue the story without repeating it.
  const storyParagraphs = paragraphs.map((paragraph, index) =>
    index === 0 && intro.length <= 360 && paragraph.startsWith(intro)
      ? paragraph.slice(intro.length).trim()
      : paragraph,
  ).filter(Boolean);
  const relatedProjects = getRelatedProjects(combinedProjects, project.slug);

  return (
    <section className="project-detail project-case section-black">
      <div className="section-container project-detail__hero case-header" data-reveal>
        <div className="project-detail__topbar">
          <Link to="/portfolio/" className="back-link" data-cursor="soft">
            <ArrowLeft aria-hidden="true" size={22} />
            <ButtonTextStagger text={t("project.back")} />
          </Link>
          {isLoggedIn ? (
            <Link to={`/beheer/?project=${project.slug}`} className="btn btn--primary project-detail__edit" data-cursor="merge">
              <ButtonTextStagger text="Bewerk" />
            </Link>
          ) : null}
        </div>

        <div className="project-detail__title">
          <p className="eyebrow">{facts ? t(`case.${facts.context}`) : t("project.eyebrow")}</p>
          <h1>{projectTitle}</h1>
        </div>
      </div>

      <div className="section-container case-opening">
        <figure className="case-hero" data-reveal>
          <img src={heroImage || project.logo} alt={projectTitle} srcSet={customHero ? `${customHero}-900.jpg 900w, ${customHero}-1800.jpg 1800w` : undefined} sizes="(max-width: 640px) calc(100vw - 2rem), 55vw" width={customHero ? 1800 : 1600} height={customHero ? 2400 : 1000} fetchPriority="high" decoding="async" className={!heroImage ? "case-hero__logo" : undefined} />
        </figure>
        <div className="case-opening__info" data-reveal>
          <p className="case-intro">{intro.length <= 360 ? intro : t(`case.${facts?.role || 'story'}`)}</p>
        <div className="case-meta">
          {facts ? <>
            <div><span>{t("case.role")}</span><strong>{facts.services.map((service) => t(`portfolio.service.${service}`)).join(", ")}</strong></div>
            <div><span>{t("case.context")}</span><strong>{t(`case.${facts.context}`)}</strong></div>
            {facts.year ? <div><span>{t("case.year")}</span><strong>{facts.year}</strong></div> : null}
            {facts.collaborators ? <div><span>{t("case.with")}</span><strong>{facts.collaborators.join(", ")}</strong></div> : null}
          </> : null}
        </div>
        <nav className="case-jump" aria-label={t("case.overview")}>
          {storyParagraphs.length > 0 && <a href="#case-story" data-cursor="soft">{t("case.story")} <ArrowRight size={16} aria-hidden="true" /></a>}
          {galleryImages.length > 0 ? <a href="#case-work" data-cursor="soft">{t("case.viewWork")} <ArrowRight size={16} aria-hidden="true" /></a> : null}
        </nav>
        </div>
      </div>

      {storyParagraphs.length > 0 && <div className="case-story-band"><section className="section-container case-story" id="case-story" aria-labelledby="case-story-title">
        <div className="case-story__heading">
          <h2 id="case-story-title">{t("case.story")}</h2>
        </div>
        <div className="case-story__body">
          {storyParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}

        </div>
      </section></div>}

      {galleryImages.length ? (
        <section className="section-container case-work" id="case-work" aria-labelledby="case-work-title">
          <header className="case-work__heading">
            <h2 id="case-work-title">{t("case.work")}</h2>
            {galleryImages.length > 1 && <p className="case-work__swipe">{t("case.swipe")} <span aria-hidden="true">↔</span></p>}
          </header>
          <div className="project-detail__gallery" role="region" aria-label={t("case.gallery")} tabIndex={0}>
          {galleryImages.map((image, index) => (
            <figure className="case-work__item" key={image} data-reveal>
            <button
              type="button"
              className="project-detail__gallery-button"
              data-cursor="image"
              onClick={() => setActiveImageIndex(index)}
              aria-label={`${t("case.openImage")} ${index + 1}: ${projectTitle}`}
            >
              <img src={image} alt={`${projectTitle} — ${t("case.image")} ${index + 1}`} width="1600" height="1200" loading="lazy" decoding="async" onLoad={(event) => {
                const img = event.currentTarget;
                const figure = img.closest("figure");
                if (figure) figure.dataset.format = img.naturalWidth / img.naturalHeight > 1.3 ? "wide" : "portrait";
              }} />
            </button>
            </figure>
          ))}
          </div>
        </section>
      ) : null}

      {relatedProjects.length ? (
        <section className="section-container related-projects" data-reveal>
          <h2>{t("case.related")}</h2>
          <div className="related-projects__grid">
            {relatedProjects.map((relatedProject) => {
              const relatedTitle = relatedProject.titleKey ? t(relatedProject.titleKey) : relatedProject.title;

              return (
                <Link to={`/portfolio/${relatedProject.slug}/`} className="related-project-card" data-cursor="project" key={relatedProject.slug}>
                  <span className="related-project-card__logo-wrap">
                    <img src={relatedProject.logo} alt={relatedTitle} width="512" height="512" loading="lazy" decoding="async" />
                  </span>
                  <span className="related-project-card__label">
                    <ButtonTextStagger text={relatedTitle} wrap />
                    <ArrowRight aria-hidden="true" size={22} strokeWidth={3} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeImage && typeof document !== "undefined" ? createPortal(
        <div className="project-lightbox" role="dialog" aria-modal="true" aria-label={`${projectTitle} — ${t("case.gallery")}`}>
          <button
            type="button"
            className="project-lightbox__backdrop"
            onClick={() => setActiveImageIndex(null)}
            aria-label={t("case.close")}
          />
          <button
            type="button"
            className="project-lightbox__close"
            onClick={() => setActiveImageIndex(null)}
            aria-label={t("case.close")}
          >
            <X aria-hidden="true" size={34} strokeWidth={3} />
          </button>
          <button
            type="button"
            className="project-lightbox__nav project-lightbox__nav--prev"
            onClick={showPreviousImage}
            aria-label={t("case.previous")}
          >
            <ChevronLeft aria-hidden="true" size={42} strokeWidth={2.8} />
          </button>
          <figure className="project-lightbox__figure">
            <img src={activeImage} alt={`${projectTitle} — ${t("case.image")} ${(activeImageIndex || 0) + 1}`} width="1600" height="2000" />
          </figure>
          <button
            type="button"
            className="project-lightbox__nav project-lightbox__nav--next"
            onClick={showNextImage}
            aria-label={t("case.next")}
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
  const currentOutputs = getProjectCaseStudy(currentSlug)?.services || [];
  return projects
    .filter((project) => project.slug !== currentSlug && project.logo)
    .map((project) => ({ project, relevance: (getProjectCaseStudy(project.slug)?.services || []).filter((output) => currentOutputs.includes(output)).length, score: seededProjectScore(currentSlug, project.slug) }))
    .sort((projectA, projectB) => projectB.relevance - projectA.relevance || projectA.score - projectB.score)
    .slice(0, 4)
    .map(({ project }) => project);
}
