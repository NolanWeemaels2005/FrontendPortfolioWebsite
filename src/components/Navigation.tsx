import { Menu } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ButtonTextStagger } from "./ButtonTextStagger";
import { navItems } from "../data/nav";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";
import { preloadPageModule } from "../utils/pageModules";

const navPreviewItems = [
  { href: "/", image: assetPath("assets/home-overview/portrait-studio-1600.jpg"), position: "50% 30%", alt: "" },
  { href: "/portfolio/", image: assetPath("assets/services/branding-1800.jpg"), position: "47% 50%", alt: "" },
  { href: "/about/", image: assetPath("assets/about-hero/header-about-1200.jpg"), position: "50% 42%", alt: "" },
  { href: "/contact/", image: assetPath("assets/contact-hero/nolan-sketch.jpg"), position: "52% 50%", alt: "" },
];

export function Navigation() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const previewGridRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const normalizedPathname = pathname.length > 1 ? `${pathname.replace(/^\/+|\/+$/g, "")}/` : "";
  const currentPreviewHref = navPreviewItems.find((item) => {
    if (item.href === "/") return pathname === "/";
    return normalizedPathname.startsWith(item.href.replace(/^\/+/, ""));
  })?.href || "/";
  const activePreviewHref = activePreview || currentPreviewHref;

  function closeMenu() {
    setOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus({ preventScroll: true }));
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const grid = previewGridRef.current;
    if (!open || !grid) return;
    const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let target = 0;
    let current = 0;
    let previousTime = 0;
    const draw = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      current += (target - current) * (1 - Math.exp(-elapsed / 110));
      if (Math.abs(target - current) < 0.05) current = target;
      grid.style.setProperty("--menu-parallax", `${current}px`);
      frame = current === target ? 0 : window.requestAnimationFrame(draw);
      if (!frame) previousTime = 0;
    };
    const reset = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      target = current = 0;
      grid.style.removeProperty("--menu-parallax");
    };
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType !== "mouse" || document.hidden) return;
      const normalizedY = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1));
      target = normalizedY * Math.min(24, window.innerHeight * 0.025);
      if (!frame) frame = window.requestAnimationFrame(draw);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset);
    document.addEventListener("visibilitychange", reset);
    motion.addEventListener("change", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", reset);
      window.removeEventListener("resize", reset);
      document.removeEventListener("visibilitychange", reset);
      motion.removeEventListener("change", reset);
      reset();
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
      <header className={`nav nav--glass ${open ? "open" : ""} ${scrolled ? "scrolled" : ""}`} id="nav">
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

        <Link to="/" className="nav-logo" data-cursor="soft" aria-label={t("nav.homeLabel")} onPointerEnter={() => void preloadPageModule("/")} onFocus={() => void preloadPageModule("/")}>
          <img className="nav-logo__word" src={assetPath("assets/logos/main-logo-white.webp")} alt="Nolan" width="2034" height="572" decoding="async" />
          <img className="nav-logo__icon" src={assetPath("assets/logos/main-icon-white.webp")} alt="Nolan" width="1631" height="1474" decoding="async" />
        </Link>

        <Link to="/contact/" className="nav-talk" data-cursor="merge" onPointerEnter={() => void preloadPageModule("/contact/")} onFocus={() => void preloadPageModule("/contact/")}>
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
                onFocus={() => {
                  setActivePreview(item.href === "/blog/" ? "/portfolio/" : item.href);
                  void preloadPageModule(item.href);
                }}
                onMouseEnter={() => {
                  setActivePreview(item.href === "/blog/" ? "/portfolio/" : item.href);
                  void preloadPageModule(item.href);
                }}
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

          <div ref={previewGridRef} className="menu-preview-grid" aria-hidden="true">
            {navPreviewItems.map((item) => (
              <figure
                className={`menu-preview-card ${activePreviewHref === item.href ? "is-active" : ""} ${currentPreviewHref === item.href ? "is-current" : ""}`}
                key={item.href}
              >
                <img src={item.image} style={{ objectPosition: item.position }} alt={item.alt} width="900" height="1200" loading="lazy" decoding="async" fetchPriority="low" />
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
                    <ButtonTextStagger text={item === "nl" ? "Nederlands" : item === "fr" ? "Français" : "English"} />
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
