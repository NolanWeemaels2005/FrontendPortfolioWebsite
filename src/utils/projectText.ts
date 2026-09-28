import type { Project, ProjectTranslation } from "../types/project";
import type { Language } from "../i18n/LanguageContext";
import { backendProjectTranslations, reviewedDutchSources } from "../data/backendProjectTranslations";

function translationForLanguage(translations: ProjectTranslation | undefined, language: Language) {
  return translations?.[language]?.trim() || "";
}

export function getProjectDescription(project: Project, language: Language, translate: (key: string) => string) {
  const translatedBackendText =
    translationForLanguage(project.textTranslations, language) ||
    translationForLanguage(project.summaryTranslations, language) ||
    ((language !== "nl" || project.text?.trim() === reviewedDutchSources[project.slug]?.trim())
      ? backendProjectTranslations[project.slug]?.[language]?.trim() : "") ||
    "";

  if (project.source === "backend") {
    if (translatedBackendText) return translatedBackendText;

    return (
      project.text ||
      project.summary ||
      (project.summaryKey ? translate(project.summaryKey) : "") ||
      translate("project.defaultApproach")
    );
  }

  if (translatedBackendText) return translatedBackendText;

  if (project.summaryKey) return translate(project.summaryKey);

  return (
    project.text ||
    project.summary ||
    translate("project.defaultApproach")
  );
}
