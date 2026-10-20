// Keep legacy settings records out of the portfolio project list.
export const homeOfferSettingSlug = "site-setting-home-offer-visible";

export function isSiteSettingProject(project: { slug?: string; title?: string }) {
  return project.slug === homeOfferSettingSlug || project.title === "Site setting: home offer visible";
}
