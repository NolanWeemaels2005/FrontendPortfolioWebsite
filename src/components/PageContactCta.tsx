import { Link } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { useLanguage } from "../i18n/LanguageContext";

export function PageContactCta() {
  const { t } = useLanguage();

  return (
    <section className="about-story-cta" aria-labelledby="page-contact-heading">
      <h2 id="page-contact-heading">{t("portfolio.cta")}</h2>
      <Link to="/contact/" className="btn btn--primary" data-cursor="merge">
        <ButtonTextStagger text={t("cta.letsTalk")} />
      </Link>
    </section>
  );
}
