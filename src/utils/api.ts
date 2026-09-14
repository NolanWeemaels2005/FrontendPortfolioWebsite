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
    if (data.error === "File too large") {
      return "Een bestand is te groot. De maximale bestandsgrootte is 10 MB per bestand.";
    }
    if (data.error === "Unexpected field") {
      return "De upload bevat een onverwacht bestand of te veel bestanden. Kies één SVG/logo en exact 3 foto's.";
    }
    return [...new Set([data.message, data.error].filter(Boolean))].join(" ") || "Er ging iets mis met de API.";
  } catch {
    return "Er ging iets mis met de API.";
  }
}
