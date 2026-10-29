import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { assetPath } from "../utils/asset";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/kaai-modal.css";

const copy = {
  nl: { close: "Sluiten", first: "Een bureau met", second: "nen hoek", accent: "af", heading: "Meer nodig dan wat ik je kan bieden?", body: "Bij Kaai. Creative Agency zijn we uitgerust om elk project van A tot Z te realiseren.", cta: "Klapke doen?", team: "Het team van Kaai. Creative Agency" },
  fr: { close: "Fermer", first: "Une agence", second: "qui sort du", accent: "cadre", heading: "Besoin de plus que ce que je peux vous offrir ?", body: "Chez Kaai. Creative Agency, nous avons les compétences pour réaliser chaque projet de A à Z.", cta: "On en parle ?", team: "L’équipe de Kaai. Creative Agency" },
  en: { close: "Close", first: "An agency with", second: "a different", accent: "angle", heading: "Need more than I can offer?", body: "At Kaai. Creative Agency, we are equipped to bring every project to life from A to Z.", cta: "Let’s chat?", team: "The Kaai. Creative Agency team" },
};

type KaaiModalProps = { open: boolean; onClose: () => void };

export function KaaiModal({ open, onClose }: KaaiModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { language } = useLanguage();
  const text = copy[language];

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("kaai-modal-open");
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const controls = panelRef.current?.querySelectorAll<HTMLElement>('button, a[href]');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove("kaai-modal-open");
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="kaai-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} lang={language} data-lenis-prevent>
      <div className="kaai-popup" ref={panelRef}>
        <button ref={closeRef} type="button" className="kaai-popup__close" data-cursor="soft" onClick={onClose}>{text.close}</button>
        <div className="kaai-popup__visual">
          <img className="kaai-popup__logo" src={assetPath("assets/kaai/logo-outline.svg")} alt="Kaai." width="621" height="261" />
          <img className="kaai-popup__team" src={assetPath("assets/kaai/team.png")} alt={text.team} width="1339" height="1088" />
        </div>
        <div className="kaai-popup__content">
          <h2 className="kaai-popup__title" id={titleId}><span>{text.first}</span><span>{text.second} <em>{text.accent}</em>.</span></h2>
          <div className="kaai-popup__intro">
            <h3>{text.heading}</h3>
            <p>{text.body}</p>
            <a className="kaai-popup__cta" data-cursor="soft" href="https://www.instagram.com/kaaipunt/" target="_blank" rel="noopener noreferrer">{text.cta}</a>
          </div>
        </div>
      </div>
    </div>, document.body
  );
}
