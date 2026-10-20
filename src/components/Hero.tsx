import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { useLanguage } from "../i18n/LanguageContext";
import { HeroScrollCue } from "./HeroScrollCue";

type HeroProps = {
  title: string;
  script: string;
  scrollTarget?: string;
  showActions?: boolean;
  showStrip?: boolean;
  className?: string;
  visual?: ReactNode;
};

export function Hero({
  title,
  script,
  scrollTarget = "page-content",
  showActions = false,
  showStrip = false,
  className = "",
  visual,
}: HeroProps) {
  const { t } = useLanguage();

  return (
    <section className={`hero section-purple ${showStrip ? "hero--with-strip" : ""} ${className}`}>
      <div className="hero__inner">
        {visual}

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

        <HeroScrollCue target={scrollTarget} />

        {showStrip ? <span className="home-project-anchor" aria-hidden="true" /> : null}
      </div>
    </section>
  );
}
