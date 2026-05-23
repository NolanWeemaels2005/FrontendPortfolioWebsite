import { Menu } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { navItems } from "../data/nav";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { language, setLanguage, t } = useLanguage();

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
          {t("cta.letsTalk")}
        </Link>
      </header>

      <div className={`overlay ${open ? "open" : ""}`} inert={!open}>
        <div className="overlay-inner">
          <nav className="menu-links" aria-label={t("nav.mainNavigation")}>
            {navItems.map((item) => (
              <NavLink
                to={item.href}
                className={({ isActive }) => (isActive ? "is-active" : "")}
                data-cursor="merge"
                key={item.href}
                onClick={closeMenu}
                end={item.href === "/"}
              >
                <span className="divider" />
                <span className="inner">
                  <span className="link-text">{t(item.labelKey)}</span>
                </span>
              </NavLink>
            ))}
          </nav>

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
