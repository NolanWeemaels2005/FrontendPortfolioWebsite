import { useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { navItems } from "../data/nav";
import { useLanguage } from "../i18n/LanguageContext";
import { KaaiModal } from "./KaaiModal";
import { assetPath } from "../utils/asset";
import { createWhatsAppHref } from "./WhatsAppPopup";

type SocialItem = {
  label: string;
  href: string;
  icon?: string;
  modal?: boolean;
};

const socialLinks: SocialItem[] = [
  { label: "Instagram", icon: assetPath("assets/icons/social/InstagramWhite-64.webp"), href: "https://www.instagram.com/nolanweemaelsdesign/" },
  { label: "LinkedIn", icon: assetPath("assets/icons/social/LinkedInWhite-64.webp"), href: "https://www.linkedin.com/in/nolan-weemaels-1780511b4/" },
  { label: "Kaai", icon: assetPath("assets/icons/social/kaaiIconWhite-64.webp"), href: "https://kaai.be", modal: true },
];

export function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const [kaaiOpen, setKaaiOpen] = useState(false);
  const socials: SocialItem[] = [
    { label: "WhatsApp", icon: assetPath("assets/icons/social/WhatsApp.webp"), href: createWhatsAppHref(t("whatsapp.defaultMessage")) },
    ...socialLinks,
  ];

  function openKaaiModal(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setKaaiOpen(true);
  }

  function renderSocialIcon(social: SocialItem) {
    return social.icon ? <img src={social.icon} alt="" width="64" height="64" loading="lazy" decoding="async" /> : null;
  }

  return (
    <footer className="site-footer" id="site-footer">
      <div className="footer-top">
        <div>
          <Link to="/" className="footer-logo" data-cursor="merge" aria-label={t("nav.homeLabel")}>
            <img src={assetPath("assets/logos/main-logo-white.svg")} alt="Nolan" width="2034" height="572" loading="lazy" decoding="async" />
          </Link>

          <div className="footer-columns">
            <div className="footer-column footer-column--links">
              <h3>{t("footer.links")}</h3>
              <a href={createWhatsAppHref(t("whatsapp.defaultMessage"))} data-cursor="soft" target="_blank" rel="noopener noreferrer">
                <ButtonTextStagger text="WhatsApp" />
              </a>
              <a href="https://www.instagram.com/nolanweemaelsdesign/" data-cursor="soft" target="_blank" rel="noopener noreferrer">
                <ButtonTextStagger text="Instagram" />
              </a>
              <a href="https://www.linkedin.com/in/nolan-weemaels-1780511b4/" data-cursor="soft" target="_blank" rel="noopener noreferrer">
                <ButtonTextStagger text="LinkedIn" />
              </a>
              <a href="https://kaai.be" data-cursor="soft" target="_blank" rel="noopener noreferrer" onClick={openKaaiModal}>
                <ButtonTextStagger text="Kaai." />
              </a>
            </div>
            <div className="footer-column footer-column--pages">
              <h3>{t("footer.pages")}</h3>
              {navItems.map((item) => (
                <Link to={item.href} data-cursor="soft" key={item.href}>
                  <ButtonTextStagger text={t(item.labelKey)} />
                </Link>
              ))}
            </div>
            <div className="footer-language">
              <h3>{t("nav.language")}</h3>
              <div className="footer-language-switcher" aria-label={t("nav.language")}>
                {(["nl", "fr", "en"] as const).map((item) => (
                  <button
                    type="button"
                    data-cursor="merge"
                    className={language === item ? "is-active" : ""}
                    onClick={() => setLanguage(item)}
                    key={item}
                  >
                    <ButtonTextStagger text={item.toUpperCase()} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="footer-contact" aria-labelledby="footer-contact-title">
          <p>{t("footer.project")}</p>
          <div className="footer-contact__title" id="footer-contact-title" role="heading" aria-level={2}>
            {t("cta.letsTalk")}
          </div>
          <Link to="/contact/" className="btn btn--primary" data-cursor="merge">
            <ButtonTextStagger text={t("cta.letsTalk")} />
          </Link>
        </section>
      </div>

      <div className="footer-bottom">
        <div className="legal-links">
          <Link to="/cookiebeleid/" data-cursor="soft">{t("footer.cookies")}</Link>
          <Link to="/juridische-voorwaarden/" data-cursor="soft">{t("footer.legal")}</Link>
          <Link to="/privacybeleid/" data-cursor="soft">{t("footer.privacy")}</Link>
        </div>

        <div className="footer-socials">
          {socials.map((social) => (
            social.modal ? (
              <a
                href={social.href}
                data-cursor="soft"
                aria-label={social.label}
                key={social.label}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openKaaiModal}
              >
                {renderSocialIcon(social)}
              </a>
            ) : (
              <a href={social.href} data-cursor="soft" aria-label={social.label} key={social.label} target="_blank" rel="noopener noreferrer">
                {renderSocialIcon(social)}
              </a>
            )
          ))}
        </div>
      </div>

      <KaaiModal open={kaaiOpen} onClose={() => setKaaiOpen(false)} />
    </footer>
  );
}
