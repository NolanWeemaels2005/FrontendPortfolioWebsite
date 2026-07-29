import { Link } from "react-router-dom";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { useScrollReveal } from "../hooks/useScrollReveal";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalContent = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

const CONTACT_EMAIL = "info@nolandesign.be";

const pages: Record<"cookies" | "terms" | "privacy", LegalContent> = {
  cookies: {
    eyebrow: "Cookiebeleid",
    title: "Cookiebeleid",
    intro:
      "Deze website gebruikt zo weinig mogelijk opslag in je browser. Hieronder lees je helder waarvoor dat gebeurt.",
    updated: "Laatst bijgewerkt: 5 mei 2026",
    sections: [
      {
        title: "Wat zijn cookies?",
        body: [
          "Cookies en vergelijkbare technieken zijn kleine stukjes informatie die een website kan bewaren in je browser. Ze kunnen nodig zijn om een website goed te laten werken of om voorkeuren te onthouden.",
        ],
      },
      {
        title: "Welke opslag gebruikt deze website?",
        body: [
          "Deze website bewaart je taalkeuze lokaal in je browser via localStorage. Dat zorgt ervoor dat je voorkeur, bijvoorbeeld Nederlands, Frans of Engels, behouden blijft wanneer je terugkomt.",
          "Er worden geen advertentiecookies geplaatst en er wordt geen tracking gebruikt om je over andere websites heen te volgen.",
        ],
      },
      {
        title: "Externe diensten",
        body: [
          "Voor het contactformulier kan Formspree worden gebruikt om je bericht technisch te verwerken. Projectbeelden en logo's kunnen via Cloudinary geladen worden. Wanneer je op externe links klikt, zoals Instagram of LinkedIn, gelden de voorwaarden en cookie-instellingen van die externe website.",
        ],
      },
      {
        title: "Cookies beheren",
        body: [
          "Je kan cookies en lokale opslag wissen of blokkeren via de instellingen van je browser. Hou er rekening mee dat sommige voorkeuren dan opnieuw ingesteld moeten worden.",
        ],
      },
      {
        title: "Contact",
        body: [`Vragen over dit cookiebeleid kan je mailen naar ${CONTACT_EMAIL}.`],
      },
    ],
  },
  terms: {
    eyebrow: "Voorwaarden",
    title: "Juridische voorwaarden",
    intro:
      "Deze voorwaarden beschrijven hoe je deze website en het getoonde portfolio mag gebruiken.",
    updated: "Laatst bijgewerkt: 5 mei 2026",
    sections: [
      {
        title: "Gebruik van de website",
        body: [
          "Je mag deze website bekijken voor persoonlijke, informatieve en professionele evaluatie. Je mag de website niet gebruiken op een manier die schade veroorzaakt, de werking verstoort of in strijd is met toepasselijke wetgeving.",
        ],
      },
      {
        title: "Intellectuele eigendom",
        body: [
          "Alle teksten, ontwerpen, logo's, beelden, lay-outs, animaties, code en portfolio-items op deze website blijven eigendom van Nolan Design, Nolan Weemaels of de vermelde rechthebbenden, tenzij uitdrukkelijk anders vermeld.",
          "Mijn werk mag niet zomaar volledig of gedeeltelijk gekopieerd, gedeeld, gereproduceerd, aangepast, gepubliceerd, verkocht of gebruikt worden zonder voorafgaande schriftelijke toestemming. Dit geldt voor al mijn werk buiten schoolopdrachten. Schoolopdrachten mogen enkel gebruikt worden binnen de context waarvoor ze oorspronkelijk gemaakt zijn, tenzij er schriftelijke toestemming is voor ruimer gebruik.",
        ],
      },
      {
        title: "Portfolio en klantwerk",
        body: [
          "Projecten worden getoond als portfolio en referentie. Merknamen, logo's en beelden van klanten blijven eigendom van hun respectieve eigenaars. Het tonen van een project geeft geen toestemming om materiaal van dat project over te nemen.",
        ],
      },
      {
        title: "Aansprakelijkheid",
        body: [
          "Ik probeer de informatie op deze website correct en actueel te houden, maar kan niet garanderen dat alles altijd volledig foutloos is. Gebruik van de website gebeurt op eigen verantwoordelijkheid.",
        ],
      },
      {
        title: "Contact",
        body: [`Voor toestemming, vragen of meldingen kan je mailen naar ${CONTACT_EMAIL}.`],
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacybeleid",
    intro:
      "Ik ga zorgvuldig om met persoonsgegevens en verzamel alleen wat nodig is om de website en communicatie te laten werken.",
    updated: "Laatst bijgewerkt: 5 mei 2026",
    sections: [
      {
        title: "Welke gegevens worden verwerkt?",
        body: [
          "Wanneer je het contactformulier gebruikt of rechtstreeks mailt, kunnen je naam, e-mailadres, bericht en eventuele projectinformatie verwerkt worden om je vraag te beantwoorden.",
          "Wanneer je de website gebruikt, kan je taalvoorkeur lokaal in je browser bewaard worden. De website kan ook technisch noodzakelijke gegevens verwerken, zoals serverlogs, om veiligheid en werking te garanderen.",
        ],
      },
      {
        title: "Waarom worden gegevens verwerkt?",
        body: [
          "Gegevens worden gebruikt om contact met je op te nemen, je vraag te behandelen, projecten op te volgen, de website technisch te laten werken en misbruik of beveiligingsproblemen te voorkomen.",
        ],
      },
      {
        title: "Delen met derden",
        body: [
          "Gegevens worden niet verkocht. Voor de werking van de website kunnen betrouwbare diensten gebruikt worden, zoals hosting, Formspree voor contactformulieren en Cloudinary voor media. Deze partijen verwerken gegevens alleen voor hun technische rol.",
        ],
      },
      {
        title: "Bewaartermijn",
        body: [
          "Berichten en projectcommunicatie worden niet langer bewaard dan nodig is voor opvolging, administratie of wettelijke verplichtingen.",
        ],
      },
      {
        title: "Je rechten",
        body: [
          "Je kan vragen om inzage, verbetering of verwijdering van je persoonsgegevens. Je kan ook bezwaar maken tegen verwerking wanneer daar een geldige reden voor is.",
        ],
      },
      {
        title: "Contact",
        body: [`Voor privacyvragen kan je mailen naar ${CONTACT_EMAIL}.`],
      },
    ],
  },
};

type LegalPageProps = {
  type: keyof typeof pages;
};

export function LegalPage({ type }: LegalPageProps) {
  useScrollReveal();
  const content = pages[type];

  return (
    <section className="legal-page">
      <div className="section-container legal-page__inner" data-reveal>
        <p className="legal-page__eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="legal-page__intro">{content.intro}</p>
        <p className="legal-page__updated">{content.updated}</p>

        <div className="legal-page__sections">
          {content.sections.map((section) => (
            <article className="legal-page__section" key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>

        <Link to="/contact" className="btn btn--primary legal-page__cta" data-cursor="merge">
          <ButtonTextStagger text="Contact opnemen" />
        </Link>
      </div>
    </section>
  );
}
