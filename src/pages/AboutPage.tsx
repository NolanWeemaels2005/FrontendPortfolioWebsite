import { useEffect, useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { Hero } from "../components/Hero";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
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

const tools = [
  { label: "Adobe Photoshop", icon: "NewPHOTOSHOPLogo.webp" },
  { label: "Figma", icon: "NewFIGMALogo.webp" },
  { label: "Adobe Illustrator", icon: "NewILLUSTRATORLogo.webp" },
  { label: "Microsoft VS Code", icon: "NewVSCODELogo.webp" },
  { label: "Adobe InDesign", icon: "NewINDESIGNLogo.webp" },
  { label: "Artificial Intelligence", icon: "AIIcon.webp" },
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
  const storyProgressRef = useRef(0);
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
    if (window.matchMedia("(max-width: 1024px)").matches) {
      storyProgressRef.current = 0;
      sectionRef.current?.style.removeProperty("height");
      sectionRef.current?.style.removeProperty("--about-story-height");
      sectionRef.current?.style.removeProperty("--story-progress");
      trackRef.current?.style.removeProperty("--story-x");
      return;
    }

    let frame = 0;
    let maxStoryX = 0;
    let targetStoryProgress = storyProgressRef.current;
    let storyHasWheelControl = false;
    const lenis = new Lenis({
      anchors: true,
      lerp: 0.09,
      overscroll: false,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.1,
      wheelMultiplier: 0.9,
    });

    const applyStoryProgress = (progress: number) => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const nextProgress = Math.min(1, Math.max(0, progress));
      storyProgressRef.current = nextProgress;
      track.style.setProperty("--story-x", `${-(maxStoryX * nextProgress)}px`);
      section.style.setProperty("--story-progress", `${nextProgress}`);
    };

    const syncStoryPosition = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.5) {
        targetStoryProgress = 0;
        applyStoryProgress(0);
      } else if (rect.bottom < window.innerHeight * 0.5) {
        targetStoryProgress = 1;
        applyStoryProgress(1);
      }
    };

    const measureStory = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const viewportWidth = section.clientWidth || window.innerWidth;
      const viewportHeight = window.innerHeight || section.getBoundingClientRect().height;
      section.style.setProperty("--about-story-height", `${viewportHeight}px`);
      maxStoryX = Math.max(0, track.scrollWidth - viewportWidth);
      section.style.height = `${viewportHeight}px`;
      lenis.resize();
      syncStoryPosition();
    };

    const handleStoryWheel = (event: WheelEvent) => {
      const section = sectionRef.current;
      if (!section || maxStoryX <= 0) return;

      const rect = section.getBoundingClientRect();
      const tolerance = 28;
      const sectionFillsViewport = rect.top <= tolerance && rect.bottom >= window.innerHeight - tolerance;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const canMoveForward = delta > 0 && targetStoryProgress < 1;
      const canMoveBack = delta < 0 && targetStoryProgress > 0;

      if (!sectionFillsViewport || (!canMoveForward && !canMoveBack)) {
        if (storyHasWheelControl) {
          storyHasWheelControl = false;
          lenis.start();
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      storyHasWheelControl = true;
      lenis.stop();
      targetStoryProgress = Math.min(1, Math.max(0, targetStoryProgress + delta / maxStoryX));
    };

    const raf = (time: number) => {
      lenis.raf(time);
      if (Math.abs(storyProgressRef.current - targetStoryProgress) > 0.0001) {
        const nextProgress = storyProgressRef.current + (targetStoryProgress - storyProgressRef.current) * 0.16;
        applyStoryProgress(Math.abs(nextProgress - targetStoryProgress) < 0.0005 ? targetStoryProgress : nextProgress);
      }
      frame = window.requestAnimationFrame(raf);
    };

    measureStory();
    syncStoryPosition();
    lenis.on("scroll", syncStoryPosition);
    frame = window.requestAnimationFrame(raf);
    window.addEventListener("resize", measureStory);
    window.addEventListener("wheel", handleStoryWheel, { passive: false, capture: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      lenis.start();
      lenis.off("scroll", syncStoryPosition);
      lenis.destroy();
      window.removeEventListener("resize", measureStory);
      window.removeEventListener("wheel", handleStoryWheel, { capture: true });
    };
  }, []);

  return (
    <>
      <Hero
        title={t("hero.aboutTitle")}
        script={t("hero.aboutScript")}
        scrollText={t("hero.scroll")}
        className="portfolio-showcase-hero about-story-hero"
      />

      <div id="page-content" className="about-story-content">
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
                  src={assetPath("assets/about-story/optimized/MyStoryPicture7.webp")}
                  srcSet={storyImageSrcSet("MyStoryPicture7.webp")}
                  sizes="(max-width: 61.25rem) min(calc(100vw - 2rem), 26.25rem), min(27.5rem, 38vw)"
                  alt="Nolan Weemaels aan het werk als grafisch ontwerper"
                  width="998"
                  height="1400"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="about-skills__copy">
                <h3>{t("about.toolsHeading")}</h3>
                <div className="tool-grid">
                  {tools.map((tool) => (
                    <div className="tool-item" key={tool.label}>
                      <span>
                        <img src={assetPath(`assets/about-story/${tool.icon.replace(/\.webp$/, "-64.webp")}`)} alt="" width="64" height="64" loading="lazy" decoding="async" />
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

        <section className="about-story-cta" data-reveal>
          <h2>{t("portfolio.cta")}</h2>
          <Link to="/contact/" className="btn btn--primary" data-cursor="merge">
            <ButtonTextStagger text={t("cta.letsTalk")} />
          </Link>
        </section>
      </div>
    </>
  );
}
