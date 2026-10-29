import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useParams } from "react-router-dom";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { useCombinedProjectsQuery, useProjectQuery } from "../data/projectQueries";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { getAdminToken } from "../utils/adminAuth";
import { getProjectDescription } from "../utils/projectText";
import { getProjectCaseStudy } from "../data/projectCaseStudies";
import { backendProjectTranslations } from "../data/backendProjectTranslations";
import { projectStories, type ProjectStoryImage, type ProjectSpread } from "../data/projectStories";
import { CaseMotion } from "../components/CaseMotion";
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
  const story = projectStories[getProjectCaseStudy(project?.slug || "")?.heroImage || ""];
  const storyImages = story?.images || [];
  const galleryImages = storyImages.map(image => image.src);
  const [recommendationSeed] = useState(() => Math.random().toString(36).slice(2));
  const lightboxRef = useRef<HTMLDivElement>(null);
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

    const opener = document.activeElement as HTMLElement | null;
    lightboxRef.current?.querySelector<HTMLButtonElement>(".project-lightbox__close")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const buttons = Array.from(lightboxRef.current?.querySelectorAll<HTMLButtonElement>("button:not(.project-lightbox__backdrop)") || []);
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "Escape") setActiveImageIndex(null);
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    document.documentElement.classList.add("project-lightbox-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.classList.remove("project-lightbox-open");
      window.removeEventListener("keydown", handleKeyDown);
      opener?.focus();
    };
  }, [activeImageIndex !== null, galleryImages.length]);

  useEffect(() => { setActiveImageIndex(null); }, [canonicalSlug]);

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
  const intro = projectApproach.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || projectApproach;
  // The opening already shows this sentence; continue the story without repeating it.
  const storyParagraphs = paragraphs.map((paragraph, index) =>
    index === 0 && intro.length <= 360 && paragraph.startsWith(intro)
      ? paragraph.slice(intro.length).trim()
      : paragraph,
  ).filter(Boolean);
  const relatedProjects = [...new Map(combinedProjects.map(item => [item.slug, item])).values()]
    .filter(item => {
      const key = getProjectCaseStudy(item.slug)?.heroImage || "";
      return projectStories[key] && key !== facts?.heroImage;
    })
    .map(item => ({ item, score: recommendationScore(`${recommendationSeed}:${project.slug}:${item.slug}`) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map(({ item }) => item);

  const renderStoryArtwork = (image: ProjectStoryImage, index: number, layout: ProjectSpread["layout"] = "full") => (
    <figure className="case-feature__image" key={image.src}>
      <button type="button" className="project-detail__gallery-button" data-cursor="image"
        onClick={() => setActiveImageIndex(index)} aria-label={`${t("case.openImage")} ${index + 1}: ${projectTitle}`}>
        <img src={image.src} srcSet={image.srcSet}
          sizes={(layout === "full" || layout === "inset") ? "(max-width: 768px) calc(100vw - 2rem), 92vw" : "(max-width: 768px) calc(100vw - 2rem), 60vw"}
          alt={image.alt} width={image.width} height={image.height}
          loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} decoding="async" />
      </button>
    </figure>
  );

  return (
    <section className="project-detail project-case section-black">
      <div className="section-container project-detail__hero case-header">
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
          <p className="case-intro">{intro.length <= 360 ? intro : t(`case.${facts?.role || 'story'}`)}</p>
        </div>
      </div>

      {story && <div className="section-container case-feature__opening">{renderStoryArtwork(storyImages[0], 0)}</div>}
      <div className="section-container case-opening__info" data-reveal>
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
          {galleryImages.length > 1 ? <a href="#case-work" data-cursor="soft">{t("case.viewWork")} <ArrowRight size={16} aria-hidden="true" /></a> : null}
        </nav>
      </div>

      {storyParagraphs.length > 0 && <div className="case-story-band"><section className="section-container case-story" id="case-story" aria-labelledby="case-story-title">
        <div className="case-story__heading">
          <h2 id="case-story-title">{t("case.story")}</h2>
        </div>
        <div className="case-story__body">
          {storyParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}

        </div>
      </section></div>}

      {story && <section className="section-container case-gallery" id="case-work" aria-label={t("case.gallery")}>
        {story.spreads.map((spread, spreadIndex) => <div key={spreadIndex} className={`case-spread case-spread--${spread.layout}`}
          style={{ "--case-columns": spread.images.map(index => `${storyImages[index].width / storyImages[index].height}fr`).join(" ") } as CSSProperties}>
          {spread.images.map(index => renderStoryArtwork(storyImages[index], index, spread.layout))}
        </div>)}
        {story.video && <CaseMotion src={story.video} poster={story.poster} title={`${projectTitle} — ${t("case.identity")}`} />}
      </section>}

      {relatedProjects.length > 0 && <section className="section-container case-related" aria-labelledby="case-related-title">
        <h2 id="case-related-title">{t("case.related")}</h2>
        <div className="case-related__grid">
          {relatedProjects.map(item => {
            const image = projectStories[getProjectCaseStudy(item.slug)!.heroImage!].recommendationImage;
            const title = item.titleKey ? t(item.titleKey) : item.title;
            return <Link key={item.slug} to={`/portfolio/${item.slug}/`} className="case-related__card" data-cursor="project">
              <img src={image.src} srcSet={image.srcSet} sizes="(max-width: 768px) calc(100vw - 2rem), (max-width: 1024px) 46vw, 23vw"
                width={image.width} height={image.height} alt="" loading="lazy" decoding="async" />
              <span className="case-related__label"><ButtonTextStagger text={title} wrap /><ArrowRight aria-hidden="true" size={24} /></span>
            </Link>;
          })}
        </div>
      </section>}

      {activeImage && typeof document !== "undefined" ? createPortal(
        <div ref={lightboxRef} className="project-lightbox" role="dialog" aria-modal="true" aria-label={`${projectTitle} — ${t("case.gallery")}`}>
          <button
            type="button"
            className="project-lightbox__backdrop"
            tabIndex={-1}
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

// A fresh selection per visit, stable during lightbox and language interactions.
function recommendationScore(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  return (hash ^ (hash >>> 16)) >>> 0;
}
