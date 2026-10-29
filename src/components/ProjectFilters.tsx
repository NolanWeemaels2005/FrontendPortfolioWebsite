import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/project-filters.css";

type Props = {
  services: string[];
  years: string[];
  service: string;
  year: string;
  count: number;
  onService: (value: string) => void;
  onYear: (value: string) => void;
};

export function ProjectFilters({ services, years, service, year, count, onService, onYear }: Props) {
  const { t } = useLanguage();
  const active = Boolean(service || year);
  return <details className="project-filters">
    <summary className="project-filters__heading" data-cursor="soft">
      <SlidersHorizontal size={20} aria-hidden="true" />
      <span>{t("filter.title")}</span>
      <span className="project-filters__count" role="status" aria-live="polite">{count} {t("home.projects")}</span>
      <ChevronDown className="project-filters__chevron" size={20} aria-hidden="true" />
    </summary>
    <div className="project-filters__body">
      <fieldset><legend>{t("filter.service")}</legend><div className="project-filter-options">
        {["", ...services].map(value => <button type="button" key={value} data-cursor="soft" aria-pressed={service === value} onClick={() => onService(value)}>{value ? t(`portfolio.service.${value}`) : t("filter.all")}</button>)}
      </div></fieldset>
      <fieldset><legend>{t("filter.year")}</legend><div className="project-filter-options">
        {["", ...years].map(value => <button type="button" key={value} data-cursor="soft" aria-pressed={year === value} onClick={() => onYear(value)}>{value || t("filter.all")}</button>)}
      </div></fieldset>
      <button type="button" disabled={!active} className="project-filter-reset" data-cursor="soft" onClick={() => { onService(""); onYear(""); }}><X size={16} aria-hidden="true" />{t("filter.clear")}</button>
    </div>
  </details>;
}
