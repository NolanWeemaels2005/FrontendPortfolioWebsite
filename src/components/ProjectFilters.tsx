import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/project-filters.css";

type Props = {
  sectionRef: RefObject<HTMLDivElement | null>;
  services: string[];
  years: string[];
  service: string;
  year: string;
  count: number;
  onService: (value: string) => void;
  onYear: (value: string) => void;
};

export function ProjectFilters({ sectionRef, services, years, service, year, count, onService, onYear }: Props) {
  const { t } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef]);

  useEffect(() => {
    const closeOnScroll = (event: Event) => {
      if (event.target instanceof Node && dialog.current?.contains(event.target)) return;
      dialog.current?.close();
    };
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !dialog.current?.contains(event.target) && !launcher.current?.contains(event.target)) dialog.current?.close();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dialog.current?.open) {
        dialog.current.close();
        launcher.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("scroll", closeOnScroll, true);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("scroll", closeOnScroll, true);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => { if (!visible) dialog.current?.close(); }, [visible]);

  if (typeof document === "undefined") return null;
  return createPortal(<>
    {visible && <button ref={launcher} className="project-filter-launcher" type="button" aria-expanded={open} aria-controls="project-filter-panel" onClick={() => {
      if (dialog.current?.open) dialog.current.close();
      else { dialog.current?.show(); setOpen(true); }
    }} aria-haspopup="dialog" aria-label={t("filter.title")}>
      <SlidersHorizontal size={24} aria-hidden="true" />
      {(service || year) && <span className="project-filter-badge">{Number(Boolean(service)) + Number(Boolean(year))}</span>}
    </button>}
    <dialog id="project-filter-panel" className="project-filter-dialog" ref={dialog} aria-labelledby="project-filter-title" onClose={() => setOpen(false)}>
      <header><h2 id="project-filter-title">{t("filter.title")}</h2><button type="button" onClick={() => dialog.current?.close()} aria-label={t("filter.close")}><X /></button></header>
      <fieldset><legend>{t("filter.service")}</legend><div className="project-filter-options">
        {["", ...services].map((value) => <button type="button" key={value} aria-pressed={service === value} onClick={() => onService(value)}>{value ? t(`portfolio.service.${value}`) : t("filter.all")}</button>)}
      </div></fieldset>
      <fieldset><legend>{t("filter.year")}</legend><div className="project-filter-options">
        {["", ...years].map((value) => <button type="button" key={value} aria-pressed={year === value} onClick={() => onYear(value)}>{value || t("filter.all")}</button>)}
      </div></fieldset>
      <footer><button type="button" className="project-filter-reset" onClick={() => { onService(""); onYear(""); }}>{t("filter.clear")}</button><button type="button" className="btn btn--primary" onClick={() => dialog.current?.close()}>{t("filter.show")} ({count})</button></footer>
    </dialog>
  </>, document.body);
}
