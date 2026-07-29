import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import ImageReveal from "../components/lightswind/ImageReveal";
import { ProjectHallOfFame } from "../components/ProjectHallOfFame";
import { useCombinedProjectsQuery, useLatestProjectQuery } from "../data/projectQueries";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

type CountUpNumberProps = {
  start: boolean;
  value: number;
  children?: (displayValue: number) => ReactNode;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const fixedRevealProjectSlugs = ["shift-festival-2026", "kaai", "ring-tv", "city-to-ocean", "basisschool-nieuwland", "poutrel"];

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
        src: project.images?.[1] || project.images?.[0] || project.cover || project.heroImage || project.logo || "",
        alt: project.title,
        href: `/portfolio/${project.slug}/`,
      }))
      .filter((image) => Boolean(image.src));
  }, [projects]);

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

  const scrollToOverview = () => {
    overviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="home-landing" aria-labelledby="home-heading">
        <div className="home-landing__background" aria-hidden="true" />

        <div className="home-landing__center">
          <img src={assetPath("assets/logos/main-logo-white.webp")} alt="Nolan" width="2034" height="572" fetchPriority="high" decoding="async" />
          <h1 id="home-heading">
            <span>{t("hero.homeTitle")}</span>
            <strong>{t("hero.homeScript")}</strong>
          </h1>
          <div className="home-landing__actions">
            <Link to="/contact/" className="home-landing__action home-landing__action--primary" data-cursor="merge">
              <ButtonTextStagger text={t("cta.letsTalk")} />
            </Link>
            <Link to="/portfolio/" className="home-landing__action home-landing__action--secondary" data-cursor="merge">
              <ButtonTextStagger text={t("cta.portfolio")} />
            </Link>
          </div>
        </div>

        <aside className="home-landing__project" aria-label={t("home.latestProject")}>
          {latestProject ? (
            <Link
              className="home-landing__project-link"
              to={`/portfolio/${latestProject.slug}/`}
              aria-label={`${t("home.viewProject")} ${latestProject.title}`}
            />
          ) : null}
          <span className="home-landing__project-brand" aria-hidden="true" />
          <span className="home-landing__project-divider" />
          <strong>{t("home.latestProject")}</strong>
          {latestProject?.logo ? (
            <img src={latestProject.logo} alt={latestProject.title} loading="eager" decoding="async" />
          ) : null}
          <small>{latestProject?.title}</small>
        </aside>

        <button type="button" className="home-landing__scroll" onClick={scrollToOverview}>
          <strong>{t("hero.scroll")}</strong>
          <span aria-hidden="true" />
        </button>
      </section>

      <section className="home-overview" aria-label={t("home.overviewAria")} ref={overviewRef}>
        <div className="home-overview__inner">
          <div className="home-overview__project-screen" id="home-project-count">
            <ImageReveal images={projectRevealImages}>
              <CountUpNumber start={overviewStatsActive} value={projectCount}>
                {(displayValue) => (
                  <strong className="home-overview__project-number">
                    {String(displayValue).length > 1 ? (
                      <>
                        <span className="home-overview__project-digit home-overview__project-digit--first">{String(displayValue).slice(0, -1)}</span>
                        <span className="home-overview__project-digit home-overview__project-digit--last">
                          {String(displayValue).slice(-1)}
                          <span className="home-overview__project-label">{t("home.projects")}</span>
                        </span>
                      </>
                    ) : (
                      <span className="home-overview__project-digit home-overview__project-digit--last">
                        {displayValue}
                        <span className="home-overview__project-label">{t("home.projects")}</span>
                      </span>
                    )}
                  </strong>
                )}
              </CountUpNumber>
            </ImageReveal>
          </div>

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
                  <img src={assetPath("assets/home-overview/head-bw.webp")} alt="Nolan Weemaels" loading="lazy" decoding="async" />
                  <img className="home-overview__signature" src={assetPath("assets/about-story/Signature.webp")} alt="" aria-hidden="true" />
                </div>
                <h3>{t("home.role")}</h3>
                <p>
                  <span className="sr-only">{t("home.since")}</span>
                  <svg className="home-overview__year-lockup" viewBox="0 0 1000 190" aria-hidden="true">
                    <text x="0" y="166" textLength="1000" lengthAdjust="spacingAndGlyphs">{t("home.since")}</text>
                  </svg>
                </p>
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
                      <Link to={`/portfolio/${latestProject.slug}/`} aria-label={`${t("home.viewProject")} ${latestProject.title}`}>
                        <img src={latestProject.logo} alt={latestProject.title} loading="lazy" decoding="async" />
                      </Link>
                    ) : null}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <ProjectHallOfFame />
    </>
  );
}
