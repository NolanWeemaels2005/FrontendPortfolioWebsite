# main
Portfolio Website

### Blog

- Publiek: `/blog/` (12 berichten per API-pagina) en `/blog/:slug/`.
- Beheer: één pagina op `/beheer` met bovenaan **Projecten** en **Blog**. Blogbeheer gebruikt `/beheer?type=blog`; bestaande `/beheer/blog`-links blijven werken.
- De publieke bloglink staat alleen in de footer.
- Gebruikt dezelfde login en bestaande in-memory Bearer-tokenopslag als het projectbeheer. Een herladen tabblad vraagt daarom opnieuw om login. Bij een verlopen sessie binnen het geopende blogformulier blijven tekst en uploadwachtrij behouden tijdens opnieuw inloggen.
- Gebruikt `VITE_API_URL` en de bestaande Vite-proxy. Een base met `/api` krijgt alleen `/blog` toegevoegd; een host zonder `/api` krijgt `/api/blog`. Geen extra frontendconfiguratie nodig bij de bestaande backend.
- Concepten kunnen onvolledig zijn (titel verplicht). Publicatie controleert verplichte tekst, voor-/na-afbeeldingen en eventuele AI-bijdragen; de backend blijft de definitieve validator.
- Uploads: meerdere bestanden selecteren, metadata per bestand vooraf invullen, daarna sequentieel uploaden. Maximaal 100 MB per bestand, geen frontendlimiet op het aantal. Geslaagde uploads worden niet opnieuw verzonden. Bij een onzekere netwerkuitkomst moet eerst de opgeslagen medialijst worden gecontroleerd om duplicaten te vermijden.
- Bij vertrek met gewijzigde tekst of een openstaande uploadwachtrij volgt een waarschuwing, ook via browser terug/vooruit. Hiervoor gebruikt de bestaande React Router nu `createBrowserRouter` met dezelfde routes en basename.
- De blogindex staat in de bestaande SEO-generatie/sitemap. Individuele berichten worden dynamisch via de API geladen; er is geen extra backend of statische kopie van blogdata.

Controles: `npm run check:blog`, `npm run build` (inclusief TypeScript en SEO-audit). Er is momenteel geen lintscript geconfigureerd.
