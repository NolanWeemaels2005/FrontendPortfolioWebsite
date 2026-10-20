import { useLanguage } from "../i18n/LanguageContext";

export function HeroScrollCue({ target }: { target: string }) {
  const { t } = useLanguage();

  return (
    <a href={`#${target}`} className="hero-scroll-cue" data-cursor="soft">
      <span>{t("hero.scroll")}</span>
      <span className="hero-scroll-cue__icon" aria-hidden="true" />
    </a>
  );
}
