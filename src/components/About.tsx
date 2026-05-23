import { useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useCombinedProjectsQuery } from "../data/projectQueries";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

const tools = [
  { name: "Adobe Illustrator", icon: assetPath("assets/icons/tools/IllustratorWhite.svg") },
  { name: "Adobe InDesign", icon: assetPath("assets/icons/tools/InDesignWhite.svg") },
  { name: "Adobe Photoshop", icon: assetPath("assets/icons/tools/PhotoshopWhite.svg") },
  { name: "Figma", icon: assetPath("assets/icons/tools/FigmaWhite.svg") },
  { name: "Visual Studio Code", icon: assetPath("assets/icons/tools/VScodeWhite.svg") },
];

const focusGroups = [
  {
    labelKey: "about.focus.brandIdentity",
    projects: [
      { title: "Ferraaawri", slug: "ferraaawri", color: "#c1272d" },
      { title: "Shift Festival", slug: "shift-festival", color: "#29abe2" },
      { title: "Kaai.", slug: "kaai", color: "#d7df23" },
    ],
  },
  {
    labelKey: "about.focus.graphicDesign",
    projects: [
      { title: "Find Your Light", slug: "find-your-light", color: "#f05a2d" },
      { title: "City To Ocean", slug: "city-to-ocean", color: "#00ce9d" },
      { title: "Erasmus hogeschool Brussel", slug: "erasmus-hogeschool", color: "#ed1c24" },
    ],
  },
  {
    labelKey: "about.focus.digitalDesign",
    projects: [
      { title: "Basisschool Nieuwland", slug: "basisschool-nieuwland", color: "#29abe2" },
      { title: "La Maison Des Trois Garçons", slug: "la-maison-des-trois-garcons", color: "#aeaa7a" },
      { title: "Poutrel", slug: "poutrel", color: "#662149" },
    ],
  },
];

const processSlides = [
  {
    titleKey: "about.process.sketching.title",
    textKey: "about.process.sketching.text",
    image: assetPath("assets/about/process-schetsen.png"),
  },
  {
    titleKey: "about.process.digitalising.title",
    textKey: "about.process.digitalising.text",
    image: assetPath("assets/about/process-digitaliseren.png"),
  },
  {
    titleKey: "about.process.finishing.title",
    textKey: "about.process.finishing.text",
    image: assetPath("assets/about/process-product-uitwerken.png"),
  },
];

export function About() {
  const { t } = useLanguage();
  const { data: projects = [] } = useCombinedProjectsQuery();
  const [activeFocus, setActiveFocus] = useState(0);
  const [activeProcess, setActiveProcess] = useState(0);
  const selectedFocus = focusGroups[activeFocus];
  const selectedProcess = processSlides[activeProcess];

  function getProjectLogo(slug: string) {
    return projects.find((project) => project.slug === slug || project.layoutSlug === slug)?.logo;
  }

  return (
    <section className="about section-black" id="about">
      <div className="section-container about-process" data-reveal>
        <p className="eyebrow">{t("about.process")}</p>
        <article className="about-process__card">
          <img src={selectedProcess.image} alt="" loading="lazy" decoding="async" />
          <div className="about-process__copy">
            <h2>{t(selectedProcess.titleKey)}</h2>
            <p>{t(selectedProcess.textKey)}</p>
          </div>
        </article>
        <div className="about-process__dots" aria-label={t("about.processDots")}>
          {processSlides.map((slide, index) => (
            <button
              type="button"
              className={activeProcess === index ? "is-active" : ""}
              onClick={() => setActiveProcess(index)}
              aria-label={t(slide.titleKey)}
              aria-current={activeProcess === index ? "true" : undefined}
              key={slide.titleKey}
            />
          ))}
        </div>
      </div>

      <div className="section-container about-story" data-reveal>
        <p className="eyebrow">{t("about.storyTitle")}</p>
        <div className="about-story__layout">
          <div className="about-story__portrait">
            <img src={assetPath("assets/about/nolan-portrait.jpg")} alt={t("about.portraitAlt")} />
          </div>
          <div className="about-story__copy">
            <p>{t("about.storyOne")}</p>
            <p>{t("about.storyTwo")}</p>
            <Link to="/contact" className="btn btn--primary" data-cursor="merge">{t("cta.letsTalk")}</Link>
          </div>
        </div>
      </div>

      <div className="section-container about-focus" data-reveal>
        <p className="eyebrow">{t("about.focus")}</p>
        <div className="about-focus__tabs" aria-label={t("about.focusLabel")}>
          {focusGroups.map((group, index) => (
            <button
              type="button"
              className={activeFocus === index ? "is-active" : ""}
              onClick={() => setActiveFocus(index)}
              key={group.labelKey}
            >
              {t(group.labelKey)}
            </button>
          ))}
        </div>

        <div className="about-focus__projects">
          {selectedFocus.projects.map((project) => {
            const logo = getProjectLogo(project.slug);

            return (
              <Link
                to={`/portfolio/${project.slug}`}
                className="about-focus-card"
                style={{ "--focus-color": project.color } as CSSProperties}
                key={project.slug}
              >
                <span className="about-focus-card__logo">
                  {logo ? <img src={logo} alt="" loading="lazy" decoding="async" /> : <strong>{project.title}</strong>}
                </span>
                <span>{project.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="section-container tools" data-reveal>
        <p className="eyebrow">{t("about.tools")}</p>
        <div className="tools-panel">
          {tools.map((tool) => (
            <div className="tool" data-cursor="merge" key={tool.name}>
              <span className="tool__icon">
                <img src={tool.icon} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="tool__name">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-container inline-cta" data-reveal>
        <h2>{t("portfolio.cta")}</h2>
        <div>
          <Link to="/contact" className="btn btn--primary" data-cursor="merge">{t("cta.letsTalk")}</Link>
          <Link to="/portfolio" className="btn btn--secondary" data-cursor="merge">{t("cta.portfolio")}</Link>
        </div>
      </div>
    </section>
  );
}
