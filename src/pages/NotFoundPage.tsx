import { Link } from "react-router-dom";
import { useLayoutEffect, useMemo } from "react";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { allProjects } from "../data/projects";
import projectAssets from "../data/projectCaseAssets.json";
import { assetPath } from "../utils/asset";
import "../styles/not-found.css";
import { useLanguage } from "../i18n/LanguageContext";

const notFoundProjectPool = Object.entries(projectAssets).map(([slug, assets]) => {
  const project = allProjects.find(item => item.slug === slug);
  return { slug, title: project?.title || (slug === "n-wah" ? "N/WAH" : "Find Your Light"), titleKey: project?.titleKey,
    image: assetPath(assets["1"].variants[0].src) };
});
export function NotFoundPage() {
  const { t } = useLanguage();
  const notFoundProjects = useMemo(() => {
    const shuffled = [...notFoundProjectPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, []);

  useLayoutEffect(() => {
    document.body.classList.add("not-found-route");
    return () => document.body.classList.remove("not-found-route");
  }, []);

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-page__inner">
        <div className="not-found-page__copy">
          <h1 id="not-found-title">
            <span>{t("notFound.titleLineOne")}</span>
            <strong>{t("notFound.titleLineTwo")}</strong>
          </h1>
          <p>{t("notFound.body")}</p>

          <div className="not-found-page__actions">
            <Link to="/contact/" className="home-landing__action home-landing__action--primary" data-cursor="merge">
              <ButtonTextStagger text={t("notFound.talk")} />
            </Link>
            <Link to="/portfolio/" className="home-landing__action home-landing__action--secondary" data-cursor="merge">
              <ButtonTextStagger text={t("notFound.portfolio")} />
            </Link>
          </div>
        </div>

        <div className="not-found-page__suggestions">
          <h2>{t("notFound.projects")}</h2>
          <div className="not-found-page__projects" aria-label={t("notFound.projectsLabel")}>
            {notFoundProjects.map((project) => (
              <Link
                to={`/portfolio/${project.slug}/`}
                className="not-found-project"
                data-cursor="project"
                key={project.slug}
                aria-label={`${t("notFound.viewProject")} ${project.title}`}
              >
                <img className="not-found-project__image" src={project.image} alt="" width="800" height="450" loading="lazy" decoding="async" />
                <span className="not-found-project__title">{project.titleKey ? t(project.titleKey) : project.title}<span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

