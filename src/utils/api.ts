const productionApiUrl = "https://backendportfoliowebsite-production.up.railway.app/api";
const fallbackApiUrl = import.meta.env.DEV ? "/api" : productionApiUrl;

export const apiUrl = (import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/$/, "");

type ApiErrorBody = {
  message?: string;
  error?: string;
};

export async function readApiError(response: Response) {
  try {
    const data = (await response.json()) as ApiErrorBody;
    return data.message || data.error || "Er ging iets mis met de API.";
  } catch {
    return "Er ging iets mis met de API.";
  }
}
