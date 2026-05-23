import { useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { navItems } from "../data/nav";
import { useLanguage } from "../i18n/LanguageContext";
import { KaaiModal } from "./KaaiModal";
import { assetPath } from "../utils/asset";

const socials = [
  { label: "Instagram", icon: assetPath("assets/icons/social/InstagramWhite.svg"), href: "https://www.instagram.com/nolanweemaelsdesign/" },
  { label: "LinkedIn", icon: assetPath("assets/icons/social/LinkedInWhite.svg"), href: "https://www.linkedin.com/in/nolan-weemaels-1780511b4/" },
  { label: "Kaai", icon: assetPath("assets/icons/social/kaaiIconWhite.svg"), href: "https://kaai.be", modal: true },
];

export function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const [kaaiOpen, setKaaiOpen] = useState(false);

  function openKaaiModal(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setKaaiOpen(true);
  }

  return (
    <footer className="site-footer" data-reveal>
      <div className="footer-top">
        <div>
          <Link to="/" className="footer-logo" data-cursor="merge" aria-label={t("nav.homeLabel")}>
            <img src={assetPath("assets/logos/main-logo-white.svg")} alt="Nolan" />
          </Link>

          <div className="footer-columns">
            <div className="footer-column footer-column--links">
              <h3>{t("footer.links")}</h3>
              <a href="https://www.instagram.com/nolanweemaelsdesign/" data-cursor="soft" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/in/nolan-weemaels-1780511b4/" data-cursor="soft" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://kaai.be" data-cursor="soft" target="_blank" rel="noopener noreferrer" onClick={openKaaiModal}>Kaai.</a>
            </div>
            <div className="footer-column footer-column--pages">
              <h3>{t("footer.pages")}</h3>
              {navItems.map((item) => (
                <Link to={item.href} data-cursor="soft" key={item.href}>
                  {t(item.labelKey)}
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
                    {item.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="footer-cta">
          <p>{t("footer.project")}</p>
          <strong>{t("cta.letsTalk")}</strong>
          <Link to="/contact" className="btn btn--primary" data-cursor="merge">
            {t("cta.letsTalk")}
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="legal-links">
          <Link to="/cookiebeleid" data-cursor="soft">{t("footer.cookies")}</Link>
          <Link to="/juridische-voorwaarden" data-cursor="soft">{t("footer.legal")}</Link>
          <Link to="/privacybeleid" data-cursor="soft">{t("footer.privacy")}</Link>
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
                <img src={social.icon} alt="" loading="lazy" decoding="async" />
              </a>
            ) : (
              <a href={social.href} data-cursor="soft" aria-label={social.label} key={social.label} target="_blank" rel="noopener noreferrer">
                <img src={social.icon} alt="" loading="lazy" decoding="async" />
              </a>
            )
          ))}
        </div>
      </div>

      <KaaiModal open={kaaiOpen} onClose={() => setKaaiOpen(false)} />
    </footer>
  );
}
