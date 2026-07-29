import { Menu } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { navItems } from "../data/nav";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

const navPreviewItems = [
  { href: "/", image: assetPath("assets/about/nolan-portrait.jpg"), alt: "" },
  { href: "/portfolio", image: assetPath("assets/nav-menu/portfolio.jpg"), alt: "" },
  { href: "/about", image: assetPath("assets/nav-menu/about.png"), alt: "" },
  { href: "/contact", image: assetPath("assets/nav-menu/contact.png"), alt: "" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const activePreviewHref = activePreview;

  function closeMenu() {
    setOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useLayoutEffect(() => {
    const syncScrolled = () => {
      const nextScrolled = (window.scrollY || document.documentElement.scrollTop) > 0;
      setScrolled(nextScrolled);
    };

    syncScrolled();
    window.addEventListener("scroll", syncScrolled, { passive: true });
    window.addEventListener("resize", syncScrolled);
    return () => {
      window.removeEventListener("scroll", syncScrolled);
      window.removeEventListener("resize", syncScrolled);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className={`nav ${open ? "open" : ""} ${scrolled ? "scrolled" : ""}`} id="nav">
        <button
          ref={menuButtonRef}
          className="menu-btn"
          data-cursor="merge"
          type="button"
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="menu-icon" aria-hidden="true">
            <span />
            <span />
          </span>
          <Menu aria-hidden="true" size={18} strokeWidth={2.6} className="menu-lucide" />
          <span className="menu-btn__label">{t("nav.menu")}</span>
        </button>

        <Link to="/" className="nav-logo" data-cursor="merge" aria-label={t("nav.homeLabel")}>
          <img className="nav-logo__word" src={assetPath("assets/logos/main-logo-white.svg")} alt="Nolan" />
          <img className="nav-logo__icon" src={assetPath("assets/logos/main-icon-white.svg")} alt="Nolan" />
        </Link>

        <Link to="/contact" className="nav-talk" data-cursor="merge">
          <ButtonTextStagger text={t("cta.letsTalk")} />
        </Link>
      </header>

      <div className={`overlay ${open ? "open" : ""}`} inert={!open}>
        <div className="overlay-inner">
          <nav className="menu-links" aria-label={t("nav.mainNavigation")} onMouseLeave={() => setActivePreview(null)}>
            {navItems.map((item) => (
              <NavLink
                to={item.href}
                className={({ isActive }) => (isActive ? "is-active" : "")}
                data-cursor="merge"
                key={item.href}
                onClick={closeMenu}
                onFocus={() => setActivePreview(item.href)}
                onMouseEnter={() => setActivePreview(item.href)}
                end={item.href === "/"}
              >
                <span className="inner">
                  <span className="link-text">
                    <ButtonTextStagger text={t(item.labelKey)} staggerMs={42} durationMs={520} />
                  </span>
                </span>
                <span className="divider" />
              </NavLink>
            ))}
          </nav>

          <div className="menu-preview-grid" aria-hidden="true">
            {navPreviewItems.map((item) => (
              <figure className={`menu-preview-card ${activePreviewHref === item.href ? "is-active" : ""}`} key={item.href}>
                <img src={item.image} alt={item.alt} loading="eager" decoding="async" />
              </figure>
            ))}
          </div>

          <div className="overlay-footer">
            <h3>{t("nav.language")}</h3>
            <div className="language-switcher" aria-label={t("nav.language")}>
              {(["nl", "fr", "en"] as const).map((item) => (
                <button
                  type="button"
                  data-cursor="merge"
                  className={language === item ? "is-active" : ""}
                  onClick={() => setLanguage(item)}
                  key={item}
                >
                  {item === "nl" ? "Nederlands" : item === "fr" ? "Français" : "English"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
