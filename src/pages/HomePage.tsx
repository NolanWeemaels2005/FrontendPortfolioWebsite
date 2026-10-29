import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ImageReveal from "../components/lightswind/ImageReveal";
import { ScrollSectionEdge } from "../components/ScrollSectionEdge";
import { ProcessMedia } from "../components/ProcessMedia";
import { HeroScrollCue } from "../components/HeroScrollCue";
import "../styles/home-landing.css";
import { HomeServices } from "../components/HomeServices";
import { ProjectHallOfFame } from "../components/ProjectHallOfFame";
import { useCombinedProjectsQuery, useLatestProjectQuery } from "../data/projectQueries";
import { featuredProjects } from "../data/projects";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath, previewImageUrl } from "../utils/asset";

type CountUpNumberProps = {
  start: boolean;
  value: number;
  children?: (displayValue: number) => ReactNode;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const fixedRevealProjectSlugs = featuredProjects.map((project) => project.slug);

function getYearsActive(date: Date) {
  const anniversaryPassed = date.getMonth() > 8 || (date.getMonth() === 8 && date.getDate() >= 20);
  return Math.max(2, 2 + (date.getFullYear() - 2026) + (anniversaryPassed ? 1 : 0));
}

function getAge(date: Date) {
  const birthdayPassed = date.getMonth() > 3 || (date.getMonth() === 3 && date.getDate() >= 21);
  return Math.max(21, date.getFullYear() - 2005 - (birthdayPassed ? 0 : 1));
}

function CountUpNumber({ start, value, children }: CountUpNumberProps) {
  const frameRef = useRef(0);
  const hasPlayedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    if (hasPlayedRef.current) {
      setDisplayValue(value);
      return;
    }

    hasPlayedRef.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    const animationStart = performance.now();
    const duration = 900;

    const tick = (time: number) => {
      const progress = clamp((time - animationStart) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [start, value]);

  return children ? <>{children(displayValue)}</> : <span>{displayValue}</span>;
}

export function HomePage() {
  const { t } = useLanguage();
  const overviewRef = useRef<HTMLElement>(null);
  const [overviewStatsActive, setOverviewStatsActive] = useState(false);
  const { data: latestProject } = useLatestProjectQuery();
  const { data: projects = [] } = useCombinedProjectsQuery();
  const projectCount = Math.max(projects.length, 16);
  const homeLine2 = t("hero.homeLine2");
  const accentStart = homeLine2.lastIndexOf(" ") + 1;
  const today = new Date();
  const yearsActive = getYearsActive(today);
  const age = getAge(today);
  const projectRevealImages = useMemo(() => {
    const preferredProjects = fixedRevealProjectSlugs
      .map((slug) => projects.find((project) => project.slug === slug || project.slug.startsWith(`${slug}-`)))
      .filter((project): project is (typeof projects)[number] => Boolean(project));
    const orderedProjects = [
      ...preferredProjects,
      ...projects.filter((project) => !preferredProjects.some((preferredProject) => preferredProject.slug === project.slug)),
    ];

    return orderedProjects
      .map((project) => ({
        src: previewImageUrl(project.images?.[1] || project.images?.[0] || project.cover || project.heroImage || project.logo || "", 320),
        alt: project.titleKey ? t(project.titleKey) : project.title,
        href: `/portfolio/${project.slug}/`,
        background: project.slug.startsWith("brussel-noord-basket") ? "#292929" : undefined,
      }))
      .filter((image) => Boolean(image.src));
  }, [projects, t]);

  useLayoutEffect(() => {
    document.body.classList.add("home-route");
    return () => document.body.classList.remove("home-route");
  }, []);

  useEffect(() => {
    const overview = overviewRef.current;
    if (!overview) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setOverviewStatsActive(true);
        overview.classList.add("is-counting");
        observer.disconnect();
      },
      { threshold: 0.12 },
    );

    observer.observe(overview);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const heading = document.getElementById("home-heading");
    const text = heading?.querySelector("span");
    if (!heading || !text) return;
    let active = true;
    let lastWidth = 0;

    // Change the font size uniformly; never stretch the glyphs or their spacing.
    const fitHeading = () => {
      if (!active) return;
      heading.style.fontSize = "100px";
      const accent = heading.querySelector<HTMLElement>(".home-landing__slogan-accent");
      const context = document.createElement("canvas").getContext("2d");
      if (accent && context) {
        const mainStyle = getComputedStyle(heading);
        const accentStyle = getComputedStyle(accent);
        context.font = `${mainStyle.fontWeight} 100px ${mainStyle.fontFamily}`;
        const mainHeight = context.measureText("H").actualBoundingBoxAscent;
        // Align the visible first glyph, accounting for the font's side bearing.
        const firstLetter = text.textContent?.trimStart().charAt(0) || "";
        heading.style.setProperty(
          "--home-slogan-offset",
          `${context.measureText(firstLetter).actualBoundingBoxLeft / 100}em`,
        );
        context.font = `${accentStyle.fontWeight} 100px ${accentStyle.fontFamily}`;
        const accentHeight = context.measureText("H").actualBoundingBoxAscent;
        if (mainHeight && accentHeight) {
          heading.style.setProperty("--home-accent-scale", String(mainHeight / accentHeight));
        }
      }
      const mobile = window.matchMedia("(max-width: 40rem)").matches;
      const titleSize = mobile
        ? Math.max(41.6, Math.min(window.innerWidth * .1, 64))
        : Math.max(48, Math.min(window.innerWidth * .06, 104));
      const naturalWidth = Math.max(...Array.from(text.querySelectorAll(".home-landing__slogan-line"), (line) => line.getBoundingClientRect().width));
      if (naturalWidth > 0) {
        heading.style.fontSize = `${Math.min(titleSize, 100 * (heading.clientWidth - 1) / naturalWidth)}px`;
      }
      lastWidth = heading.clientWidth;
    };
    const observer = new ResizeObserver(() => {
      if (heading.clientWidth !== lastWidth) fitHeading();
    });
    observer.observe(heading);
    fitHeading();
    void document.fonts.ready.then(fitHeading);
    document.fonts.addEventListener("loadingdone", fitHeading);
    return () => {
      active = false;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", fitHeading);
    };
  }, [t]);

  return (
    <>
      <div className="home-landing-scroll">
        <section className="home-landing" aria-labelledby="home-heading">
          <ProcessMedia videoSrc={assetPath("assets/home/nolan-home-hero-web.mp4")} />

          <h1 id="home-heading" className="home-landing__slogan">
            <span>
              <span className="home-landing__slogan-line">{t("hero.homeLine1")}</span>{" "}
              <span className="home-landing__slogan-line">{homeLine2.slice(0, accentStart)}<span className="home-landing__slogan-accent">{homeLine2.slice(accentStart)}</span></span>
            </span>
          </h1>


          <HeroScrollCue target="home-overview" />
        </section>
      </div>

      <ScrollSectionEdge />

      <section id="home-overview" className="home-overview" aria-label={t("home.overviewAria")} ref={overviewRef}>
        <div className="home-overview__inner">
          <div className="home-overview__project-screen" id="home-project-count">
            <ImageReveal images={projectRevealImages}>
              <CountUpNumber start={overviewStatsActive} value={projectCount}>
                {(displayValue) => (
                  <strong className="home-overview__project-number" aria-label={`${projectCount} ${t("home.projects")}`}>
                    {String(projectCount).split("").map((digit, index, digits) => (
                      <span
                        key={index}
                        className={`home-overview__project-digit home-overview__project-digit--${index === digits.length - 1 ? "last" : "first"}`}
                        aria-hidden="true"
                      >
                        <span className="home-overview__project-digit-space">{digit}</span>
                        <span className="home-overview__project-digit-value">
                          {String(displayValue).padStart(digits.length, " ")[index]}
                        </span>
                        {index === digits.length - 1 && (
                          <span className="home-overview__project-label">{t("home.projects")}</span>
                        )}
                      </span>
                    ))}
                  </strong>
                )}
              </CountUpNumber>
            </ImageReveal>
          </div>

          <HomeServices />

          <div className="home-overview__stats-screen" id="home-overview-stats">
            <header className="home-overview__heading">
              <h2>
                <span>{t("home.whoAmI")}</span>
                <strong>{t("home.overview")}</strong>
              </h2>
            </header>

            <div className="home-overview__content">
              <div className="home-overview__profile">
                <div className="home-overview__portrait">
                  <img
                    className="home-overview__portrait-photo"
                    src={assetPath("assets/home-overview/portrait-studio-1600.jpg")}
                    srcSet={`${assetPath("assets/home-overview/portrait-studio-800.jpg")} 450w, ${assetPath("assets/home-overview/portrait-studio-1600.jpg")} 900w`}
                    sizes="(max-width: 68.75rem) min(40rem, calc(100vw - 2rem)), (max-width: 80rem) 36vw, min(42.5rem, 34vw)"
                    alt="Nolan Weemaels"
                    width="900"
                    height="1600"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>


              <dl className="home-overview__stats">
                <div className="home-overview__stat">
                  <dt>{t("home.projectsFinished")}<span>{t("home.createdAtoZ")}</span></dt>
                  <dd><CountUpNumber start={overviewStatsActive} value={projectCount} /></dd>
                </div>
                <div className="home-overview__stat">
                  <dt>{t("home.yearsActive")}<span>{t("home.asGraphicDesigner")}</span></dt>
                  <dd><CountUpNumber start={overviewStatsActive} value={yearsActive} /></dd>
                </div>
                <div className="home-overview__stat">
                  <dt>{t("home.myAge")}<span>{t("home.born")}</span></dt>
                  <dd><CountUpNumber start={overviewStatsActive} value={age} /></dd>
                </div>
                <div className="home-overview__stat home-overview__stat--project">
                  <dt>{t("home.latestProject")}<span>{latestProject?.title}</span></dt>
                  <dd>
                    {latestProject?.logo ? (
                      <Link data-cursor="project" to={`/portfolio/${latestProject.slug}/`} aria-label={`${t("home.viewProject")} ${latestProject.title}`}>
                        <img src={latestProject.logo} alt={latestProject.title} width="512" height="512" loading="lazy" decoding="async" />
                      </Link>
                    ) : null}
                  </dd>
                </div>
              </dl>
              <div className="home-overview__profile home-overview__profile-caption">
                <h3>{t("home.role")}</h3>
                <p>
                  <span className="sr-only">{t("home.since")}</span>
                  <svg className="home-overview__year-lockup" viewBox="0 0 1000 190" aria-hidden="true">
                    <text x="0" y="166" textLength="1000" lengthAdjust="spacingAndGlyphs">{t("home.since")}</text>
                  </svg>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProjectHallOfFame />
    </>
  );
}
