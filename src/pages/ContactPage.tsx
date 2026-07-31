import { useForm, ValidationError } from "@formspree/react";
import { BadgeCheck, CircleEllipsis, Instagram, Mail, Megaphone, Monitor, Palette, Phone, Send, Share2, Shirt } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { Hero } from "../components/Hero";
import { fetchHomeOfferVisible } from "../data/siteSettings";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";

const serviceOptions = [
  { value: "free-audit", labelKey: "contact.service.freeAudit", icon: BadgeCheck },
  { value: "branding", labelKey: "contact.service.branding", icon: Palette },
  { value: "webdesign", labelKey: "contact.service.webdesign", icon: Monitor },
  { value: "promo", labelKey: "contact.service.promo", icon: Megaphone },
  { value: "social-media", labelKey: "contact.service.socialMedia", icon: Share2 },
  { value: "merchandise", labelKey: "contact.service.merchandise", icon: Shirt },
  { value: "other", labelKey: "contact.service.other", icon: CircleEllipsis },
];

export function ContactPage() {
  useScrollReveal();
  const { t } = useLanguage();
  const [state, handleSubmit] = useForm("mbdwrepv");
  const [searchParams] = useSearchParams();
  const [showFreeAudit, setShowFreeAudit] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const visibleServiceOptions = useMemo(
    () => serviceOptions.filter((option) => showFreeAudit || option.value !== "free-audit"),
    [showFreeAudit],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchHomeOfferVisible().then((visible) => {
      if (cancelled) return;
      setShowFreeAudit(visible);
      if (visible && searchParams.get("service") === "free-audit") setSelectedService("free-audit");
      if (!visible) setSelectedService((current) => current === "free-audit" ? "" : current);
    });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useLayoutEffect(() => {
    document.body.classList.add("contact-route");
    return () => document.body.classList.remove("contact-route");
  }, []);

  return (
    <>
      <Hero
        title={t("hero.contactTitle")}
        script={t("hero.contactScript")}
        scrollText={t("hero.scroll")}
        className="portfolio-showcase-hero contact-studio-hero"
      />

      <section className="contact-studio-page" id="page-content">
        <div className="contact-studio-page__inner">
          <header className="contact-studio-intro" data-reveal>
            <h2>{t("contact.title")}</h2>
            <p>{t("contact.intro")}</p>
          </header>

          <form className="contact-studio-form" onSubmit={handleSubmit} data-reveal>
            {state.succeeded ? (
              <p className="contact-form__status contact-form__status--success" role="status">
                {t("contact.success")}
              </p>
            ) : null}

            <fieldset className="contact-service-picker" disabled={state.submitting || state.succeeded}>
              <legend>{t("contact.serviceTitle")}</legend>
              <p>{t("contact.serviceHint")}</p>
              <div className="contact-service-picker__options">
                {visibleServiceOptions.map(({ value, labelKey, icon: Icon }) => (
                  <label className="contact-service-option" key={value}>
                    <input
                      className="sr-only"
                      type="radio"
                      name="service"
                      value={value}
                      checked={selectedService === value}
                      onChange={() => setSelectedService(value)}
                      required
                    />
                    <Icon aria-hidden="true" size={21} />
                    <span>{t(labelKey)}</span>
                  </label>
                ))}
              </div>
              <ValidationError className="contact-form__error" field="service" errors={state.errors} />
            </fieldset>

            {selectedService === "other" ? (
              <label className="contact-service-other">
                <span>{t("contact.serviceTitle")}</span>
                <input
                  type="text"
                  name="service_other"
                  placeholder={t("contact.servicePlaceholder")}
                  required
                  autoFocus
                  disabled={state.submitting || state.succeeded}
                />
              </label>
            ) : null}

            <label>
              <span>{t("contact.name")}</span>
              <input type="text" name="name" autoComplete="name" required disabled={state.submitting || state.succeeded} />
            </label>

            <label>
              <span>{t("contact.contactField")}</span>
              <input type="text" name="contact" autoComplete="email tel" required disabled={state.submitting || state.succeeded} />
              <ValidationError className="contact-form__error" field="contact" errors={state.errors} />
            </label>

            <label>
              <span>{t("contact.message")}</span>
              <textarea name="message" rows={6} required disabled={state.submitting || state.succeeded} />
              <ValidationError className="contact-form__error" field="message" errors={state.errors} />
            </label>

            <ValidationError className="contact-form__error contact-form__error--form" errors={state.errors} />

            <button type="submit" data-cursor="merge" disabled={state.submitting || state.succeeded}>
              <Send aria-hidden="true" size={17} />
              <ButtonTextStagger text={state.submitting ? t("contact.sending") : t("contact.send")} />
            </button>
          </form>
        </div>
      </section>

      <aside className="contact-studio-strip" aria-label={t("contact.detailsLabel")}>
        <a href="tel:+32472085890" data-cursor="merge">
          <Phone aria-hidden="true" />
          <span>+32 472 08 58 90</span>
        </a>
        <a href="https://www.instagram.com/nolanweemaelsdesign/" target="_blank" rel="noopener noreferrer" data-cursor="merge">
          <Instagram aria-hidden="true" />
          <span>@nolanweemaelsdesign</span>
        </a>
        <a href="mailto:info@nolandesign.be" data-cursor="merge">
          <Mail aria-hidden="true" />
          <span>info@nolandesign.be</span>
        </a>
      </aside>
    </>
  );
}
