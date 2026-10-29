import { Link } from "react-router-dom";
import { useLayoutEffect } from "react";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { legalPages, legalContactLabels } from "../data/legalContent";

type LegalPageProps = {
  type: keyof typeof legalPages.nl;
};

export function LegalPage({ type }: LegalPageProps) {
  useScrollReveal();
  const { language } = useLanguage();
  const content = legalPages[language][type];

  useLayoutEffect(() => {
    document.body.classList.add("legal-route");
    return () => document.body.classList.remove("legal-route");
  }, []);

  return (
    <section className="legal-page" lang={language}>
      <div className="section-container legal-page__inner" data-reveal>
        <header className="legal-page__header">
        <p className="legal-page__eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="legal-page__intro">{content.intro}</p>
        <p className="legal-page__updated">{content.updated}</p>
        </header>

        <div className="legal-page__sections">
          {content.sections.map((section) => (
            <article className="legal-page__section" key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>

        <Link to="/contact/" className="btn btn--primary legal-page__cta" data-cursor="merge">
          <ButtonTextStagger text={legalContactLabels[language]} />
        </Link>
      </div>
    </section>
  );
}
