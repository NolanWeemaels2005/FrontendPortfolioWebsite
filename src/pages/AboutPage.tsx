import "../styles/about-hero.css";
import "../styles/orange-sections.css";
import { ScrollSectionEdge } from "../components/ScrollSectionEdge";
import { useEffect, useLayoutEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { Hero } from "../components/Hero";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { softwareTools } from "../data/softwareTools";
import { assetPath } from "../utils/asset";

const storyItems = [
  {
    place: "Knokke",
    year: "2022",
    image: "MyStoryPicture1.webp",
    descriptionKey: "about.story.item1",
  },
  {
    place: "Geraardsbergen",
    year: "2023",
    image: "MyStoryPicture2.webp",
    descriptionKey: "about.story.item2",
  },
  {
    place: "Brussel",
    year: "2024",
    image: "MyStoryPicture3.webp",
    descriptionKey: "about.story.item3",
  },
  {
    place: "Brussel",
    year: "2024",
    image: "MyStoryPicture4.webp",
    descriptionKey: "about.story.item4",
  },
  {
    place: "Carcès",
    year: "2025",
    image: "MyStoryPicture5.webp",
    descriptionKey: "about.story.item5",
  },
  {
    place: "Brussel",
    year: "2026",
    image: "MyStoryPicture7.webp",
    descriptionKey: "about.story.item6",
  },
];



const storySourceWidths: Record<string, number> = {
  "MyStoryPicture1.webp": 1093,
  "MyStoryPicture2.webp": 1310,
  "MyStoryPicture3.webp": 1600,
  "MyStoryPicture4.webp": 911,
  "MyStoryPicture5.webp": 1400,
  "MyStoryPicture7.webp": 998,
};

function storyImageSrcSet(image: string) {
  const base = assetPath(`assets/about-story/optimized/${image}`);
  return `${base.replace(/\.webp$/, "-480.webp")} 480w, ${base.replace(/\.webp$/, "-800.webp")} 800w, ${base} ${storySourceWidths[image]}w`;
}

export function AboutPage() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useScrollReveal();

  function scrollStory(direction: -1 | 1) {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".story-card");
    if (!track || !card) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  }

  useLayoutEffect(() => {
    document.body.classList.add("about-route");
    return () => document.body.classList.remove("about-route");
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const desktop = window.matchMedia("(min-width: 1025px)");
    let frame = 0;
    let maxStoryX = 0;

    const update = () => {
      frame = 0;
      if (!desktop.matches) return;
      const distance = Math.min(maxStoryX, Math.max(0, -section.getBoundingClientRect().top));
      track.style.setProperty("--story-x", `${-distance}px`);
      section.style.setProperty("--story-progress", `${maxStoryX ? distance / maxStoryX : 0}`);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const measure = () => {
      if (desktop.matches) {
        maxStoryX = Math.max(0, track.scrollWidth - section.clientWidth);
        section.style.setProperty("--about-story-height", `${window.innerHeight}px`);
        section.style.height = `${window.innerHeight + maxStoryX}px`;
        track.scrollLeft = 0;
      } else {
        section.style.removeProperty("height");
        section.style.removeProperty("--about-story-height");
        section.style.removeProperty("--story-progress");
        track.style.removeProperty("--story-x");
      }
      scheduleUpdate();
    };
    const onFocus = (event: FocusEvent) => {
      if (!desktop.matches) return;
      const card = (event.target as HTMLElement).closest<HTMLElement>(".story-card");
      if (!card) return;
      const distance = Math.min(maxStoryX, Math.max(0, card.offsetLeft - (section.clientWidth - card.offsetWidth) / 2));
      window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top + distance, behavior: "instant" });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    measure();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", measure);
    desktop.addEventListener("change", measure);
    track.addEventListener("focusin", onFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", measure);
      desktop.removeEventListener("change", measure);
      track.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <>
      <div className="hero-overlap-scroll">
        <Hero
          title={t("hero.aboutTitle")}
          script={t("hero.aboutScript")}
          className="portfolio-showcase-hero about-story-hero about-photo-hero"
          visual={<div className="about-photo-hero__media" aria-hidden="true">
            <img
              src={assetPath("assets/about-hero/header-about-2400.jpg")}
              srcSet={`${assetPath("assets/about-hero/header-about-1200.jpg")} 1200w, ${assetPath("assets/about-hero/header-about-2400.jpg")} 2400w`}
              sizes="100vw"
              alt=""
              width="2400"
              height="1600"
              fetchPriority="high"
              decoding="async"
            />
          </div>}
        />
      </div>
      <ScrollSectionEdge color="#000" />

      <div id="page-content" className="about-story-content">
        <section className="about-skills" data-reveal>
          <div className="about-skills__inner">
            <header className="about-section-heading">
              <h2>{t("about.helpTitle")}</h2>
              <p>{t("about.skillsTitle")}</p>
            </header>

            <div className="about-skills__grid">
              <div className="about-skills__portrait-frame">
                <img
                  className="about-skills__portrait"
                  src={assetPath("assets/home-overview/portrait-studio-1600.jpg")}
                  srcSet={`${assetPath("assets/home-overview/portrait-studio-800.jpg")} 450w, ${assetPath("assets/home-overview/portrait-studio-1600.jpg")} 900w`}
                  sizes="(max-width: 61.25rem) min(calc(100vw - 2rem), 26.25rem), min(27.5rem, 38vw)"
                  alt={t("about.portraitAlt")}
                  width="900"
                  height="1600"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="about-skills__copy">
                <h3>{t("about.toolsHeading")}</h3>
                <div className="tool-grid">
                  {softwareTools.map((tool) => (
                    <div className="tool-item" key={tool.label}>
                      <span>
                        <img src={assetPath(`assets/about-story/${tool.icon}`)} alt="" width="64" height="64" loading="lazy" decoding="async" />
                      </span>
                      <strong>{tool.label}</strong>
                    </div>
                  ))}
                </div>

                <p>
                  {t("about.skillsCopy")}
                </p>
                <p>{t("about.skillsPrompt")}</p>
                <Link to="/contact/" className="btn btn--primary about-skills__button" data-cursor="merge">
                  <ButtonTextStagger text={t("cta.letsTalk")} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="about-approach" aria-labelledby="about-approach-heading">
          <div className="section-container about-approach__inner">
            <header>
              <p className="about-approach__eyebrow">{t("about.approach.eyebrow")}</p>
              <h2 id="about-approach-heading">{t("about.approach.title")}</h2>
            </header>
            <div className="about-approach__steps">
              {["understand", "design", "deliver"].map((step) => (
                <article key={step}>
                  <h3>{t(`about.approach.${step}.title`)}</h3>
                  <p>{t(`about.approach.${step}.copy`)}</p>
                </article>
              ))}
              <Link to="/contact/" className="btn about-approach__contact" data-cursor="merge">
                <ButtonTextStagger text={t("cta.letsTalk")} /><ArrowRight size={22} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="about-story" ref={sectionRef}>
          <div className="about-story__sticky">
            <div className="about-story__pattern" aria-hidden="true" />
            <div className="about-story__intro">
              <h2>
                <span>{t("about.story.intro")}</span>
                <strong>{t("about.storyTitle")}</strong>
              </h2>
            </div>

            <div className="about-story__track" ref={trackRef}>
              {storyItems.map((item, index) => (
                <article className="story-card" key={`${item.place}-${item.year}-${index}`} tabIndex={0}>
                  <div className="story-card__frame">
                    <img
                      src={assetPath(`assets/about-story/optimized/${item.image}`)}
                      srcSet={storyImageSrcSet(item.image)}
                      sizes="(max-width: 68.75rem) min(74vw, 18.125rem), min(18vw, 19.375rem)"
                      alt={`${item.place}, ${item.year}`}
                      width="1200"
                      height="1600"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="auto"
                    />
                    <div className="story-card__overlay">
                      <p>{t(item.descriptionKey)}</p>
                    </div>
                  </div>
                  <p className="story-card__meta">
                    {item.place}, <time dateTime={item.year}>{item.year}</time>
                  </p>
                </article>
              ))}
            </div>

            <div className="about-story__controls" aria-label={t("about.story.navigation")}>
              <button type="button" aria-label={t("about.story.previous")} onClick={() => scrollStory(-1)}>
                <ArrowLeft aria-hidden="true" />
              </button>
              <button type="button" aria-label={t("about.story.next")} onClick={() => scrollStory(1)}>
                <ArrowRight aria-hidden="true" />
              </button>
            </div>

            <div className="about-story__progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </section>


      </div>
    </>
  );
}
