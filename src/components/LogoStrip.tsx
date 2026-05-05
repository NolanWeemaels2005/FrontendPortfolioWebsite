import { Link } from "react-router-dom";
import { useFeaturedProjectsQuery } from "../data/projectQueries";
import { useLanguage } from "../i18n/LanguageContext";

function projectClassSlug(slug: string) {
  return slug.replace(/[^a-z0-9-]/gi, "");
}

export function LogoStrip() {
  const { t } = useLanguage();
  const { data: featuredProjects } = useFeaturedProjectsQuery();

  return (
    <section className="logo-strip" aria-label={t("portfolio.clients")}>
      <div className="logo-strip__inner">
        <p>{t("portfolio.clients")}</p>
        <div className="logo-rail">
          {[...featuredProjects, ...featuredProjects].map((project, index) => (
            <Link
              to={`/portfolio/${project.slug}`}
              className={`logo-rail__item logo-rail__item--${projectClassSlug(project.layoutSlug || project.slug)}`}
              data-cursor="soft"
              key={`${project.slug}-${index}`}
            >
              <img src={project.logo} alt={project.titleKey ? t(project.titleKey) : project.title} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
