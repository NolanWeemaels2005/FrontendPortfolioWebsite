# Nolan Design — Portfolio

De frontend van [nolandesign.be](https://nolandesign.be): het portfolio van Nolan Weemaels met projectcases, diensten, een blog en een beheeromgeving voor content.

Gebouwd met React, TypeScript en Vite. De website wordt als statische applicatie gepubliceerd op GitHub Pages; projectdata, blogberichten en authenticatie worden geleverd door een aparte backend.

## Functionaliteiten

- Meertalig portfolio in Nederlands, Frans en Engels.
- Projectoverzicht met filters, uitgelichte projecten en uitgebreide cases.
- Interactieve homepage met projectbeelden en scrollanimaties.
- Blog met paginering en afzonderlijke artikelpagina’s.
- Beheeromgeving voor projecten, blogberichten en media.
- Contactformulier via Formspree.
- Gegenereerde SEO-bestanden, sitemap en automatische SEO-controle.

## Technologie

| Onderdeel | Technologie |
| --- | --- |
| Interface | React 19, TypeScript |
| Build en ontwikkeling | Vite 7 |
| Routing | React Router 7 |
| Styling | CSS |
| Scrollinteractie | Lenis |
| Iconen | Lucide React |
| Contactformulier | Formspree |
| Hosting | GitHub Pages, GitHub Actions |

## Lokaal starten

Gebruik Node.js 22.12 of hoger binnen de 22-reeks en npm. De deploymentworkflow gebruikt eveneens Node.js 22.

```bash
npm ci
npm run dev
```

De ontwikkelserver draait op `http://127.0.0.1:5174`. De poort is vast ingesteld; stop een bestaande server als deze al bezet is.

### API-configuratie

Zonder extra configuratie stuurt Vite lokale `/api`-verzoeken door naar de bestaande Railway-backend. Een productiebuild gebruikt die backend rechtstreeks.

Voor een andere backend maak je lokaal een `.env.local` met de volledige API-basis-URL, inclusief `/api`:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Herstart Vite na een wijziging. `VITE_`-variabelen worden opgenomen in de frontendbuild en zijn dus openbaar; gebruik ze niet voor wachtwoorden of tokens. Bij een externe API moet de backend de frontendorigin toestaan via CORS.

De backend hoort niet bij deze repository. Projecten hebben lokale terugvaldata; blogbeheer en authenticatie vereisen een bereikbare, compatibele API. De lokale proxy wijst standaard naar de bestaande backend: wijzigingen via beheer worden daar opgeslagen.

## Beschikbare commando’s

| Commando | Functie |
| --- | --- |
| `npm run dev` | Start de lokale ontwikkelserver. |
| `npm run build` | Genereert SEO-bestanden, controleert TypeScript, bouwt naar `dist/` en voert de SEO-audit uit. |
| `npm run preview` | Serveert de bestaande productiebuild op `http://127.0.0.1:4174`. |
| `npm run audit:seo` | Controleert de gegenereerde build op SEO-configuratie. |
| `npm run check:blog` | Controleert bloggedrag en het opslaan van berichten. |

Aanvullende projectcontroles:

```bash
node scripts/check-project-cases.mjs
node scripts/check-project-layout.mjs
node scripts/check-project-loading.mjs
```

Er is momenteel geen lintscript geconfigureerd.

## Projectstructuur

```text
.github/workflows/   GitHub Pages-deployment
public/             Statische bestanden en projectmedia
scripts/            SEO-generatie en gerichte controles
src/
  components/       Gedeelde interfacecomponenten
  data/             API-koppelingen, projectdata en casestudies
  hooks/            React-hooks
  i18n/             Taalcontext en vertalingen
  pages/            Publieke pagina’s en beheer
  styles/           Globale en paginaspecifieke CSS
  types/            TypeScript-types
  utils/            Helpers voor onder meer API, media en routing
vite.config.ts      Buildinstellingen en lokale API-proxy
```

## Routes

| Route | Inhoud |
| --- | --- |
| `/` | Homepage |
| `/portfolio/` | Projectoverzicht |
| `/portfolio/:slug/` | Projectcase |
| `/about/` | Over Nolan |
| `/contact/` | Contactformulier |
| `/blog/` | Blogoverzicht |
| `/blog/:slug/` | Blogbericht |
| `/beheer` | Projectbeheer en login |
| `/beheer?type=blog` | Blogbeheer |
| `/privacybeleid`, `/cookiebeleid`, `/juridische-voorwaarden` | Juridische informatie |

Bestaande links naar `/beheer/blog` blijven ondersteund. De publieke bloglink staat in de footer.

## Contentbeheer

Project- en blogbeheer delen dezelfde login. Het Bearer-token wordt alleen in het geheugen bewaard; na het herladen van een tabblad moet je opnieuw inloggen. Wanneer een sessie verloopt tijdens het bewerken van een blogbericht, blijven de tekst en uploadwachtrij behouden tijdens opnieuw inloggen.

### Blogberichten en media

- De blogindex laadt 12 berichten per API-pagina. Artikelen worden dynamisch via de API geladen.
- Concepten vereisen een titel. Publiceren controleert ook de verplichte tekst, voor- en na-afbeeldingen en eventuele AI-bijdragen. De backend voert de definitieve validatie uit.
- Meerdere bestanden kunnen tegelijk worden geselecteerd en van metadata voorzien. Uploads worden sequentieel uitgevoerd, met maximaal 100 MB per bestand en zonder frontendlimiet op het aantal bestanden.
- Geslaagde uploads worden niet opnieuw verzonden. Controleer bij een onzekere netwerkuitkomst eerst de opgeslagen medialijst om dubbele uploads te voorkomen.
- Bij vertrek met onopgeslagen tekst of een openstaande uploadwachtrij verschijnt een waarschuwing, ook bij browsernavigatie.

Voor opgeslagen media kun je een tekstonderdeel kiezen en de volgorde wijzigen met **Eerder/Later**. Sla daarna het bericht op. De API moet `mediaLayout` ondersteunen als geordende lijst van `{ mediaId, section }`-items; de bijbehorende backendwijziging moet samen met deze functionaliteit worden uitgerold. Oude berichten, nieuwe uploads en beelden uit verborgen AI- of planningonderdelen vallen terug op de procesgalerij.

Voor een schermvullende bloghero kun je in het beheer onder **Kies je hero-afbeelding** een aparte foto uploaden of een bestaande foto kiezen. Klik daarna op **Wijzigingen opslaan**. Aparte uploads krijgen `heroOnly: true` en verschijnen nooit tussen de artikelfoto’s, ook niet nadat je een andere hero kiest. De titel staat over de hero; de samenvatting volgt eronder. De backend moet zowel `heroMediaId` als `media[].heroOnly` ondersteunen.

## Deployment

[De GitHub Actions-workflow](.github/workflows/deploy.yml) bouwt en publiceert de website bij een push naar `main`. De workflow kan ook handmatig worden gestart via `workflow_dispatch`.

1. Installeert dependencies met `npm ci` op Node.js 22.
2. Voert `npm run build` uit, inclusief TypeScript- en SEO-controle.
3. Publiceert `dist/` als GitHub Pages-artifact.

Configureer GitHub Pages met **GitHub Actions** als bron. Het aangepaste domein staat in `CNAME`. De Vite-basis is `/`, passend bij hosting op het hoofddomein; pas deze configuratie aan wanneer je op een subpad host.

De blogindex maakt deel uit van de gegenereerde sitemap. Individuele blogberichten worden via de API opgehaald en hebben geen afzonderlijke statische kopie in deze repository.

## Gebruik van broncode en beeldmateriaal

Deze repository bevat geen open-sourcelicentie. De projectbeelden, ontwerpen, logo’s en lettertypen kunnen afzonderlijke gebruiksrechten hebben; publicatie van deze repository verleent geen toestemming voor hergebruik.
