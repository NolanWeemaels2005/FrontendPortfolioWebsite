import { useForm, ValidationError } from "@formspree/react";
import { Instagram, Mail, Phone, Send } from "lucide-react";
import { Hero } from "../components/Hero";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";

export function ContactPage() {
  useScrollReveal();
  const { t } = useLanguage();
  const [state, handleSubmit] = useForm("mbdwrepv");

  return (
    <>
      <Hero title={t("hero.contactTitle")} script={t("hero.contactScript")} scrollText={t("hero.contactScroll")} className="contact-hero" />

      <section className="contact-page" id="page-content">
        <div className="section-container contact-intro" data-reveal>
          <h2>{t("contact.title")}</h2>
          <p>{t("contact.intro")}</p>
        </div>

        <div className="section-container contact-layout">
          <form className="contact-form" onSubmit={handleSubmit} data-reveal>
            {state.succeeded ? (
              <p className="contact-form__status contact-form__status--success" role="status">
                {t("contact.success")}
              </p>
            ) : null}
            <label>
              <span>{t("contact.name")}</span>
              <input type="text" name="name" autoComplete="name" required disabled={state.submitting || state.succeeded} />
            </label>
            <label>
              <span>{t("contact.email")}</span>
              <input type="email" name="email" autoComplete="email" required disabled={state.submitting || state.succeeded} />
              <ValidationError className="contact-form__error" field="email" errors={state.errors} />
            </label>
            <label>
              <span>{t("contact.message")}</span>
              <textarea name="message" rows={6} required disabled={state.submitting || state.succeeded} />
              <ValidationError className="contact-form__error" field="message" errors={state.errors} />
            </label>
            <ValidationError className="contact-form__error contact-form__error--form" errors={state.errors} />
            <button type="submit" data-cursor="merge" disabled={state.submitting || state.succeeded}>
              <Send aria-hidden="true" size={20} />
              {state.submitting ? t("contact.sending") : t("contact.send")}
            </button>
          </form>

          <aside className="contact-card" aria-label={t("contact.detailsLabel")} data-reveal>
            <a href="tel:+32472085890" data-cursor="merge">
              <Phone aria-hidden="true" />
              +32 472 08 58 90
            </a>
            <a href="mailto:info@nolandesign.be" data-cursor="merge">
              <Mail aria-hidden="true" />
              info@nolandesign.be
            </a>
            <a
              href="https://www.instagram.com/nolanweemaelsdesign/"
              data-cursor="merge"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram aria-hidden="true" />
              @nolanweemaelsdesign
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
