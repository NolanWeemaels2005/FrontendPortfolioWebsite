import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

const tools = [
  { name: "Adobe Illustrator", icon: assetPath("assets/icons/tools/IllustratorWhite.svg") },
  { name: "Adobe InDesign", icon: assetPath("assets/icons/tools/InDesignWhite.svg") },
  { name: "Adobe Photoshop", icon: assetPath("assets/icons/tools/PhotoshopWhite.svg") },
  { name: "Figma", icon: assetPath("assets/icons/tools/FigmaWhite.svg") },
  { name: "Visual Studio Code", icon: assetPath("assets/icons/tools/VScodeWhite.svg") },
];

export function About() {
  const { t } = useLanguage();

  return (
    <section className="about section-black" id="about">
      <div className="section-container about-hero">
        <div className="about-copy" data-reveal>
          <p className="eyebrow">{t("about.standsFor")}</p>

          <div className="focus-list">
            <h3>{t("about.focus")}</h3>
            <p>{t("about.branding")} <span>{t("about.brandingMeta")}</span></p>
            <p>{t("about.graphic")} <span>{t("about.graphicMeta")}</span></p>
            <p>{t("about.digital")} <span>{t("about.digitalMeta")}</span></p>
          </div>
        </div>

        <div className="about-portrait" data-reveal>
          <img src={assetPath("assets/about/nolan-portrait.jpg")} alt={t("about.portraitAlt")} />
        </div>
      </div>

      <div className="section-container story" data-reveal>
        <div>
          <p className="eyebrow">{t("about.storyTitle")}</p>
          <p>{t("about.storyOne")} {t("about.storyTwo")}</p>
          <p>{t("about.storyThree")}</p>
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
