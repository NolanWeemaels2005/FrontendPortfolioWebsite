import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useFeaturedProjectsQuery } from "../data/projectQueries";
import { useLanguage } from "../i18n/LanguageContext";
import { previewImageUrl } from "../utils/asset";

// Reserve each SVG's viewBox ratio before lazy loading; SVGs have no intrinsic pixel size.
const logoRatios: Record<string, number> = {
  bnb: 1, shift: 957.64 / 648.67, cto: 1142.88 / 385.74,
  videjo: 1, ferraawri: 1016.83 / 574.68, erasmus: 785.78 / 579.29,
  eisbar: 1, maison: 1094.54 / 456.5, "bite-back": 1868.18 / 867.71,
};

function projectClassSlug(slug: string) {
  return slug.replace(/[^a-z0-9-]/gi, "");
}

export function LogoStrip() {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let visible = false;
    const sync = () => { rail.style.animationPlayState = visible && !document.hidden ? "running" : "paused"; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(rail);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  const { t } = useLanguage();
  const { data: featuredProjects = [] } = useFeaturedProjectsQuery();

  return (
    <section className="logo-strip" aria-label={t("portfolio.clients")}>
      <div className="logo-strip__inner">
        <p>{t("portfolio.clients")}</p>
        <div ref={railRef} className="logo-rail" style={{ animationPlayState: "paused" }}>
          {[...featuredProjects, ...featuredProjects].filter((project) => project.logo).map((project, index) => (
            <Link
              to={`/portfolio/${project.slug}/`}
              className={`logo-rail__item logo-rail__item--${projectClassSlug(project.slug)} logo-rail__item--layout-${projectClassSlug(project.layoutSlug || project.slug)}`}
              style={{ "--logo-ratio": logoRatios[project.hallOfFame?.key || ""] || 1 } as CSSProperties}
              data-cursor="soft"
              key={`${project.slug}-${index}`}
            >
              <img src={previewImageUrl(project.logo, 256)} alt={project.titleKey ? t(project.titleKey) : project.title} width="256" height="256" loading="lazy" decoding="async" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
