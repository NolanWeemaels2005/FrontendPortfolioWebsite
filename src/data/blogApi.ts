import { apiUrl } from "../utils/api";
import { clearAdminToken, getAdminToken } from "../utils/adminAuth";
import { blogApiBase, fieldHelp, uploadFileType, type BlogPost, type BlogList, type BlogAdminSummary, type BlogFields, type MediaRole } from "../utils/blog";

export class BlogApiError extends Error {
  constructor(message: string, public status: number, public issues: string[] = []) { super(message); }
}
const base = blogApiBase(apiUrl);
function readable(message: string): string {
  if (/file too large|LIMIT_FILE_SIZE/i.test(message)) return "Het bestand is te groot. Maximaal 100 MB per bestand.";
  for (const [key, { label }] of Object.entries(fieldHelp)) message = message.replace(new RegExp(`\\b${key}\\b`, "g"), label);
  return message;
}
function apiError(status: number, data: unknown): BlogApiError {
  if (status === 401) {
    clearAdminToken();
    return new BlogApiError("Je sessie is verlopen. Log opnieuw in; je openstaande tekst blijft in dit scherm bewaard.", status);
  }
  const body = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const issues = Array.isArray(body.errors) ? body.errors.filter((item): item is string => typeof item === "string").map(readable) : [];
  const message = typeof body.message === "string" ? body.message : typeof body.error === "string" ? body.error : "De blogaanvraag is mislukt. Probeer opnieuw.";
  return new BlogApiError(readable(message), status, issues);
}
async function request<T>(path: string, options: RequestInit = {}, secured = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (secured) {
    const token = getAdminToken();
    if (!token) throw apiError(401, null);
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body) headers.set("Content-Type", "application/json");
  let response: Response;
  try { response = await fetch(`${base}${path}`, { ...options, headers }); }
  catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new BlogApiError("Geen verbinding met de blogserver. Controleer je verbinding en probeer opnieuw.", 0);
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw apiError(response.status, data);
  if (data === null) throw new BlogApiError("De server gaf geen geldig blogantwoord. Controleer de API-configuratie.", response.status);
  return data as T;
}
export const blogApi = {
  list: (page: number, signal?: AbortSignal) => request<BlogList>(`?page=${page}`, { signal }),
  post: (slug: string, signal?: AbortSignal) => request<BlogPost>(`/${encodeURIComponent(slug)}`, { signal }),
  adminList: (signal?: AbortSignal) => request<BlogAdminSummary[]>("/admin", { signal }, true),
  adminPost: (id: string, signal?: AbortSignal) => request<BlogPost>(`/admin/${encodeURIComponent(id)}`, { signal }, true),
  create: (title: string) => request<BlogPost>("", { method: "POST", body: JSON.stringify({ title }) }, true),
  save: (id: string, fields: BlogFields) => request<BlogPost>(`/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(fields) }, true),
  remove: (id: string) => request<{ message: string }>(`/${encodeURIComponent(id)}`, { method: "DELETE" }, true),
  removeMedia: (id: string, mediaId: string) => request<BlogPost>(`/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}`, { method: "DELETE" }, true),
};
export function uploadBlogMedia(id: string, file: File, metadata: { role: MediaRole; caption: string; credit: string }, onProgress: (percent: number) => void, signal: AbortSignal): Promise<BlogPost> {
  return new Promise((resolve, reject) => {
    const token = getAdminToken();
    if (!token) { reject(apiError(401, null)); return; }
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    xhr.open("POST", `${base}/${encodeURIComponent(id)}/media`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.timeout = 10 * 60 * 1000;
    xhr.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); };
    xhr.onload = () => {
      let data: unknown;
      try { data = JSON.parse(xhr.responseText); } catch { data = null; }
      if (xhr.status >= 200 && xhr.status < 300 && data) resolve(data as BlogPost);
      else reject(apiError(xhr.status, data));
    };
    xhr.onerror = () => reject(new BlogApiError("De verbinding werd onderbroken. Controleer eerst de medialijst voordat je dit bestand opnieuw probeert.", 0));
    xhr.ontimeout = () => reject(new BlogApiError("De upload duurde te lang. Controleer eerst de medialijst voordat je opnieuw probeert.", 0));
    xhr.onabort = () => reject(new DOMException("Upload afgebroken", "AbortError"));
    xhr.onloadend = () => signal.removeEventListener("abort", abort);
    signal.addEventListener("abort", abort, { once: true });
    const body = new FormData();
    body.append("file", file.type ? file : new File([file], file.name, { type: uploadFileType(file) }));
    body.append("role", metadata.role);
    body.append("caption", metadata.caption);
    body.append("credit", metadata.credit);
    if (signal.aborted) { reject(new DOMException("Upload afgebroken", "AbortError")); return; }
    xhr.send(body);
  });
}
