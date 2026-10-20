import "../styles/orange-sections.css";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

const services = [
  { name: "Branding", image: "branding", project: "Brussel Noord Basket", slug: "brussel-noord-basket" },
  { name: "Webdesign", image: "webdesign", project: "La Maison Des Trois Garçons", slug: "la-maison-des-trois-garcons" },
  { name: "Promo", image: "promo", project: "SHIFT Festival", slug: "shift-festival-2026" },
  { name: "Social Media", image: "social-media", project: "City to Ocean", slug: "city-to-ocean" },
  { name: "Merchandise", image: "merchandise", project: "Videjo", slug: "videjo" },
];

export function HomeServices() {
  const { t } = useLanguage();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeService = hoveredService || expandedService;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = Array.from(list.querySelectorAll<HTMLAnchorElement>(".home-services__row"));
    let frame = 0;
    const syncScroll = () => {
      frame = 0;
      const triggerLine = window.innerHeight * .6;
      const bounds = list.getBoundingClientRect();
      if (bounds.top > triggerLine || bounds.bottom < 0) {
        setExpandedService(null);
        return;
      }
      // Compare row tops so expanding a row cannot move its own scroll trigger.
      let activeIndex = 0;
      rows.forEach((row, index) => {
        if (row.getBoundingClientRect().top <= triggerLine) activeIndex = index;
      });
      setExpandedService(services[activeIndex].slug);
    };
    const requestSync = () => {
      if (!frame) frame = window.requestAnimationFrame(syncScroll);
    };
    syncScroll();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);

  return (
    <section className="home-services home-services--orange" aria-labelledby="home-services-heading">
      <h2 id="home-services-heading" className="home-services__heading">
        <span>{t("home.services.heading")}</span>
        <strong>{t("home.services.title")}</strong>
      </h2>
      <div className="home-services__list" ref={listRef}>
        {services.map((service) => (
          <Link
            key={service.slug}
            data-cursor="project" to={`/portfolio/${service.slug}/`}
            className={`home-services__row${activeService === service.slug ? " is-expanded" : ""}`}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setHoveredService(service.slug);
            }}
            onPointerLeave={() => setHoveredService(null)}
            onClick={(event) => {
              const isTouchLayout = window.matchMedia("(hover: none), (pointer: coarse)").matches;
              if (isTouchLayout && event.detail !== 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && activeService !== service.slug) {
                event.preventDefault();
                setExpandedService(service.slug);
              }
            }}
            aria-label={`${service.name}: ${service.project}`}
          >
            <img
              className="home-services__image"
              src={assetPath(`assets/services/${service.image}-1800.jpg`)}
              srcSet={`${assetPath(`assets/services/${service.image}-800.jpg`)} 800w, ${assetPath(`assets/services/${service.image}-1800.jpg`)} 1800w`}
              sizes="(max-width: 800px) 100vw, min(94vw, 1680px)"
              alt=""
              width="1800"
              height="550"
              loading="lazy"
              decoding="async"
            />
            <div className="home-services__copy">
              <h3>{service.name}</h3>
              <p>{service.project}</p>
            </div>
            <ArrowUpRight className="home-services__arrow" aria-hidden="true" strokeWidth={3} />
          </Link>
        ))}
      </div>
    </section>
  );
}
