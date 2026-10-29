import { ArrowUpRight, RotateCw } from "lucide-react";
import { isAssetLoadError } from "../utils/assetRecovery";
import { useRouteError } from "react-router-dom";

export function RouteErrorPage() {
  const error = useRouteError();
  return (
    <main className="route-error" lang="nl">
      <h1>Deze pagina kon niet worden geladen.</h1>
      <p>{isAssetLoadError(error)
        ? "Controleer je verbinding en laad de pagina opnieuw om de nieuwste versie te openen."
        : "Er ging iets mis. Probeer de pagina opnieuw te openen."}</p>
      <button type="button" onClick={() => window.location.reload()}><RotateCw size={20} aria-hidden="true" /> Opnieuw laden</button>
      <a href={import.meta.env.BASE_URL}>Naar de homepage <ArrowUpRight size={20} aria-hidden="true" /></a>
    </main>
  );
}
