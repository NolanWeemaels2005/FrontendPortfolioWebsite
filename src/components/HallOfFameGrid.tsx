import { getProjectCaseStudy } from "../data/projectCaseStudies";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import type { Project } from "../types/project";

const serviceKeys: Record<string, string> = {
  Branding: "branding",
  "Social Media": "socialMedia",
  Merchandise: "merchandise",
  Promo: "promo",
  Webdesign: "webdesign",
  Campagne: "campaign",
};

export function HallOfFameCard({ project, variant = "mosaic" }: { project: Project; variant?: "mosaic" | "home" }) {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));
  const [activeSlide, setActiveSlide] = useState(0);
  const [slidesReady, setSlidesReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const media = project.hallOfFame;
  const facts = getProjectCaseStudy(project.slug);
  const slides = media?.slides;
  const title = project.titleKey ? t(project.titleKey) : project.title;
  const animated = Boolean(media?.video || (slides && slides.length > 1));
  const playing = animated && visible && pageVisible && !reducedMotion;
  const imageSrc = slidesReady && !reducedMotion ? slides?.[activeSlide] : project.cover;
  const containedMedia = variant !== "home"
    && media?.key === "cto" && /cto-(bottle|poster-landscape)\.webp$/.test(imageSrc || "");

  useEffect(() => {
    if (!animated) return;
    const card = cardRef.current;
    if (!card) return;
    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearViewport(true);
      preloadObserver.disconnect();
    }, { rootMargin: "300px" });
    const playbackObserver = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });
    preloadObserver.observe(card);
    playbackObserver.observe(card);
    return () => {
      preloadObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, [animated]);

  useEffect(() => {
    if (!animated) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      setReducedMotion(query.matches);
      if (query.matches) setVideoReady(false);
    };
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    query.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      query.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [animated]);

  useEffect(() => {
    if (!nearViewport || reducedMotion || !slides?.length) return;
    let cancelled = false;
    // Decode the small, optimized set before starting so rapid cuts never flash blank.
    void Promise.all(slides.map((src) => {
      const image = new Image();
      image.src = src;
      return image.decode();
    })).then(() => {
      if (!cancelled) setSlidesReady(true);
    }).catch(() => { /* Keep the cover when a mockup cannot load. */ });
    return () => { cancelled = true; };
  }, [nearViewport, reducedMotion, slides]);

  useEffect(() => {
    if (!playing || !slidesReady || !slides?.length) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 850);
    return () => window.clearInterval(timer);
  }, [playing, slidesReady, slides]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing && nearViewport && !videoFailed) {
      void video.play().catch(() => { /* The poster remains if autoplay is unavailable. */ });
    } else {
      video.pause();
    }
  }, [playing, nearViewport, videoFailed]);


  return (
    <div
      ref={cardRef}
      className={`hall-tile hall-tile--${media?.key || project.slug}${variant === "home" ? " hall-tile--home" : ""}`}
      style={{ "--hall-accent": project.color } as CSSProperties}
    >
      <Link
        className="hall-tile__link"
        to={`/portfolio/${project.slug}/`}
        
        aria-label={`${t("home.viewProject")} ${title}`}
        data-cursor="project"
      >
        <span className="hall-tile__media" aria-hidden="true">
          {containedMedia ? (
            <img className="hall-tile__backdrop" src={imageSrc} alt="" width="675" height="900" decoding="async" />
          ) : null}
          <img
            className={`hall-tile__image${containedMedia ? " hall-tile__image--contained" : ""}`}
            style={media?.video && videoReady && !reducedMotion && !videoFailed ? { opacity: 0 } : undefined}
            src={imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            width="1200"
            height="1200"
          />
          {media?.video && nearViewport && !reducedMotion && !videoFailed ? (
            <video
              ref={videoRef}
              className={`hall-tile__video${videoReady ? " is-ready" : ""}`}
              src={media.video}
              poster={project.cover}
              autoPlay={playing}
              loop
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              onPlaying={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
            />
          ) : null}
          {media?.key === "shift" && project.logo ? (
            <img className="hall-tile__logo" src={project.logo} alt="" width="512" height="512" loading="lazy" decoding="async" />
          ) : null}
          {media?.key === "erasmus" && project.logo ? (
            <img className="hall-tile__signature" src={project.logo} alt="" width="256" height="256" loading="lazy" decoding="async" />
          ) : null}
          {media?.key === "videjo" ? (
            <span className="hall-tile__wordmark" style={{ maskImage: `url("${project.logo}")`, WebkitMaskImage: `url("${project.logo}")` }} />
          ) : null}
        </span>
        <span className="hall-tile__services">
          {(facts?.services || media?.services || []).map((service) => (
            <span key={service}>{t(`portfolio.service.${serviceKeys[service] || service}`)}</span>
          ))}
        </span>
        <span className="hall-tile__caption">
          <ArrowUpRight size={24} strokeWidth={3} aria-hidden="true" />
          <span>{title}</span>
        </span>
      </Link>
    </div>
  );
}

export function HallOfFameGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="hall-grid">
      {projects.map((project) => <HallOfFameCard key={project.hallOfFame?.key || project.slug} project={project} />)}
    </div>
  );
}
