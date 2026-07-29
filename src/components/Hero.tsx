import { Link } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { useLanguage } from "../i18n/LanguageContext";

type HeroProps = {
  title: string;
  script: string;
  scrollText?: string;
  scrollTarget?: string;
  showActions?: boolean;
  showStrip?: boolean;
  className?: string;
};

export function Hero({
  title,
  script,
  scrollText,
  scrollTarget = "page-content",
  showActions = false,
  showStrip = false,
  className = "",
}: HeroProps) {
  const { t } = useLanguage();
  const resolvedScrollText = scrollText ?? t("hero.scroll");

  return (
    <section className={`hero section-purple ${showStrip ? "hero--with-strip" : ""} ${className}`}>
      <div className="hero__inner">
        <div className="hero-copy">
          <span className="hero-title-mask">
            <h1 className="hero-title">{title}</h1>
          </span>
          <span className="hero-script-mask">
            <p className="hero-script">{script}</p>
          </span>

          {showActions ? (
            <div className="hero-actions">
              <Link to="/contact/" className="btn btn--primary" data-cursor="merge">
                <ButtonTextStagger text={t("cta.letsTalk")} />
              </Link>
              <Link to="/portfolio/" className="btn btn--secondary" data-cursor="merge">
                <ButtonTextStagger text={t("cta.portfolio")} />
              </Link>
            </div>
          ) : null}

        </div>

        <a href={`#${scrollTarget}`} className="scroll-indicator" data-cursor="merge" aria-label={scrollText}>
          <span>{resolvedScrollText}</span>
          <span className="mouse-icon" aria-hidden="true" />
        </a>

        {showStrip ? <span className="home-project-anchor" aria-hidden="true" /> : null}
      </div>
    </section>
  );
}
