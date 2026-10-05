export const blogTextFields = ["title", "summary", "context", "process", "learning", "reflection", "aiContribution", "humanContribution", "planning", "sources"] as const;
export type BlogTextField = typeof blogTextFields[number];
export type BlogStatus = "draft" | "published";
export const mediaRoles = { before: "Voor", after: "Na", process: "Proces", failed: "Mislukte poging", reference: "Referentie" } as const;
export type MediaRole = keyof typeof mediaRoles;
export type BlogMedia = { _id: string; url: string; publicId: string; type: "image" | "video"; role: MediaRole; caption: string; credit: string };
export type BlogFields = Record<BlogTextField, string> & { aiUsed: boolean; status: BlogStatus };
export type BlogPost = BlogFields & { _id: string; slug: string; publishedAt: string | null; updatedAt: string; media: BlogMedia[] };
export type BlogSummary = Pick<BlogPost, "_id" | "title" | "slug" | "summary" | "publishedAt">;
export type BlogAdminSummary = Pick<BlogPost, "_id" | "title" | "slug" | "status" | "updatedAt">;
export type BlogList = { posts: BlogSummary[]; total: number; page: number; pages: number };
export const fieldHelp: Record<BlogTextField, { label: string; help: string }> = {
  title: { label: "Titel", help: "Vertel concreet wat de lezer leert." },
  summary: { label: "Samenvatting", help: "Vat het bericht samen in één zin." },
  context: { label: "Waar sta ik?", help: "Drie à vier zinnen over je opdracht, weekdoel en centrale vraag." },
  process: { label: "Wat heb ik gedaan?", help: "Beschrijf schetsen, tests, iteraties en mislukte pogingen." },
  learning: { label: "Wat kan een ander hiervan leren?", help: "Deel één bruikbaar inzicht met toepasbare stappen." },
  reflection: { label: "Feedback en reflectie", help: "Welke feedback kreeg je? Wat neem je mee en wat leg je bewust naast je neer?" },
  aiContribution: { label: "AI-bijdrage", help: "Beschrijf wat de machine deed." },
  humanContribution: { label: "Eigen bijdrage", help: "Beschrijf wat je zelf onderzocht, maakte en besliste." },
  planning: { label: "Planning", help: "Optioneel: één of twee concrete vervolgstappen." },
  sources: { label: "Bronnen en credits", help: "Vermeld links, referenties, tools en gebruikte AI-modellen. HTTP(S)-links worden klikbaar." },
};
export function blogFields(post: Partial<BlogFields>): BlogFields {
  return { ...Object.fromEntries(blogTextFields.map(key => [key, post[key] || ""])), aiUsed: post.aiUsed === true, status: post.status === "published" ? "published" : "draft" } as BlogFields;
}
export function publicationIssues(fields: BlogFields, media: BlogMedia[]): string[] {
  const errors: string[] = [];
  for (const key of ["title", "summary", "context", "process", "learning", "reflection", "sources"] as BlogTextField[]) {
    if (!fields[key].trim()) errors.push(`${fieldHelp[key].label} is verplicht voor publicatie.`);
  }
  for (const role of ["before", "after"] as const) {
    if (!media.some(item => item.type === "image" && item.role === role)) errors.push(`Voeg minstens één ${role === "before" ? "voor" : "na"}-afbeelding toe.`);
  }
  if (fields.aiUsed && (!fields.aiContribution.trim() || !fields.humanContribution.trim())) errors.push("Beschrijf zowel de AI-bijdrage als je eigen bijdrage.");
  return errors;
}
export const blogMaxUploadBytes = 100 * 1024 * 1024;
export const blogFileAccept = ".jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov";
const fileTypes: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime" };
export function blogFileIssue(file: Pick<File, "name" | "size" | "type">): string {
  if (file.size > blogMaxUploadBytes) return "Dit bestand is groter dan 100 MB.";
  if (!file.size) return "Dit bestand is leeg.";
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!fileTypes[extension] || (file.type && !Object.values(fileTypes).includes(file.type))) return "Gebruik JPG, PNG, WebP, GIF, AVIF, MP4, WebM of MOV.";
  return "";
}
export function uploadFileType(file: File) { return file.type || fileTypes[file.name.split(".").pop()?.toLowerCase() || ""] || "application/octet-stream"; }
export function blogApiBase(base: string) { const trimmed = base.replace(/\/+$/, ""); return `${trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`}/blog`; }
export function httpLink(value: string): string | null {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}
export function blogDate(value: string | null, language: string = "nl") {
  if (!value || Number.isNaN(Date.parse(value))) return "";
  return new Intl.DateTimeFormat(language === "fr" ? "fr-BE" : language === "en" ? "en-GB" : "nl-BE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
