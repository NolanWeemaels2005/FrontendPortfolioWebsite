import { apiUrl, readApiError } from "../utils/api";
import { assetPath } from "../utils/asset";

type SettingProject = {
  _id: string;
  slug: string;
  title: string;
};

export const homeOfferSettingSlug = "site-setting-home-offer-visible";

export function isSiteSettingProject(project: { slug?: string; title?: string }) {
  return project.slug === homeOfferSettingSlug || project.title === "Site setting: home offer visible";
}

async function fetchSettingProjects() {
  const response = await fetch(`${apiUrl}/projects`, { cache: "no-store" });
  if (!response.ok) return [];
  const projects = await response.json();
  return Array.isArray(projects) ? (projects as SettingProject[]).filter(isSiteSettingProject) : [];
}

export async function fetchHomeOfferVisible() {
  try {
    return (await fetchSettingProjects()).length > 0;
  } catch {
    return false;
  }
}

async function fileFromAsset(path: string, filename: string) {
  const response = await fetch(assetPath(path));
  if (!response.ok) throw new Error(`Setting asset ophalen mislukt: ${filename}`);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/webp" });
}

async function createHomeOfferSetting(token: string) {
  const formData = new FormData();
  const previewImage = await fileFromAsset("assets/home-audit/design-audit.webp", "home-offer-setting.webp");
  const logo = await fileFromAsset("assets/logos/main-logo-white.svg", "home-offer-setting-logo.svg");

  formData.append("title", "Site setting: home offer visible");
  formData.append("text", "Controls whether the home offer section is visible.");
  formData.append("heroImage", previewImage);
  formData.append("clientLogoSvg", logo);
  formData.append("images", previewImage);
  formData.append("images", previewImage);
  formData.append("images", previewImage);

  const response = await fetch(`${apiUrl}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error(await readApiError(response));
}

async function deleteHomeOfferSettings(token: string, settings: SettingProject[]) {
  await Promise.all(
    settings.map(async (setting) => {
      const response = await fetch(`${apiUrl}/projects/${setting._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(await readApiError(response));
    }),
  );
}

export async function updateHomeOfferVisible(visible: boolean, token: string) {
  const settings = await fetchSettingProjects();

  if (visible) {
    if (!settings.length) await createHomeOfferSetting(token);
    return true;
  }

  if (settings.length) await deleteHomeOfferSettings(token, settings);
  return false;
}
