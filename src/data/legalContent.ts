import type { Language } from "../i18n/LanguageContext";

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

const dutchPages: Record<"cookies" | "terms" | "privacy", LegalContent> = {
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

const frenchPages: typeof dutchPages = {
  cookies: {
    eyebrow: "Politique relative aux cookies", title: "Politique relative aux cookies",
    intro: "Ce site utilise le moins de stockage possible dans votre navigateur. Vous trouverez ci-dessous une explication de son utilisation.",
    updated: "Dernière mise à jour : 5 mai 2026",
    sections: [
      { title: "Que sont les cookies ?", body: ["Les cookies et les technologies similaires sont de petits éléments d’information qu’un site peut enregistrer dans votre navigateur. Ils peuvent être nécessaires au bon fonctionnement du site ou à la mémorisation de vos préférences."] },
      { title: "Quel stockage ce site utilise-t-il ?", body: ["Ce site enregistre votre choix de langue localement dans votre navigateur via localStorage. Votre préférence, par exemple le néerlandais, le français ou l’anglais, est ainsi conservée lors de votre prochaine visite.", "Aucun cookie publicitaire n’est déposé et aucun suivi n’est utilisé pour vous suivre sur d’autres sites."] },
      { title: "Services externes", body: ["Formspree peut être utilisé pour traiter techniquement les messages envoyés via le formulaire de contact. Les images de projets et les logos peuvent être chargés via Cloudinary. Lorsque vous cliquez sur des liens externes, comme Instagram ou LinkedIn, les conditions et les paramètres de cookies du site externe s’appliquent."] },
      { title: "Gérer les cookies", body: ["Vous pouvez supprimer ou bloquer les cookies et le stockage local dans les paramètres de votre navigateur. Certaines préférences devront alors éventuellement être définies à nouveau."] },
      { title: "Contact", body: [`Pour toute question concernant cette politique relative aux cookies, vous pouvez écrire à ${CONTACT_EMAIL}.`] },
    ],
  },
  terms: {
    eyebrow: "Conditions", title: "Conditions d’utilisation",
    intro: "Ces conditions décrivent la manière dont vous pouvez utiliser ce site et le portfolio qui y est présenté.",
    updated: "Dernière mise à jour : 5 mai 2026",
    sections: [
      { title: "Utilisation du site", body: ["Vous pouvez consulter ce site à des fins personnelles, d’information et d’évaluation professionnelle. Vous ne pouvez pas l’utiliser d’une manière qui cause des dommages, perturbe son fonctionnement ou enfreint la législation applicable."] },
      { title: "Propriété intellectuelle", body: ["Sauf indication contraire explicite, l’ensemble des textes, créations, logos, images, mises en page, animations, codes et éléments du portfolio présents sur ce site restent la propriété de Nolan Design, de Nolan Weemaels ou des titulaires de droits mentionnés.", "Mon travail ne peut pas être copié, partagé, reproduit, adapté, publié, vendu ou utilisé, en tout ou en partie, sans autorisation écrite préalable. Cela s’applique à l’ensemble de mon travail en dehors des projets scolaires. Les projets scolaires ne peuvent être utilisés que dans le contexte pour lequel ils ont été créés, sauf autorisation écrite pour une utilisation plus large."] },
      { title: "Portfolio et projets clients", body: ["Les projets sont présentés à titre de portfolio et de référence. Les marques, logos et images des clients restent la propriété de leurs propriétaires respectifs. La présentation d’un projet n’autorise pas la réutilisation des éléments de ce projet."] },
      { title: "Responsabilité", body: ["Je m’efforce de maintenir les informations de ce site exactes et à jour, mais je ne peux pas garantir qu’elles soient toujours totalement exemptes d’erreurs. Vous utilisez ce site sous votre propre responsabilité."] },
      { title: "Contact", body: [`Pour une autorisation, une question ou un signalement, vous pouvez écrire à ${CONTACT_EMAIL}.`] },
    ],
  },
  privacy: {
    eyebrow: "Confidentialité", title: "Politique de confidentialité",
    intro: "Je traite les données personnelles avec soin et ne collecte que ce qui est nécessaire au fonctionnement du site et à la communication.",
    updated: "Dernière mise à jour : 5 mai 2026",
    sections: [
      { title: "Quelles données sont traitées ?", body: ["Lorsque vous utilisez le formulaire de contact ou envoyez directement un e-mail, votre nom, votre adresse e-mail, votre message et les éventuelles informations sur votre projet peuvent être traités afin de répondre à votre demande.", "Lorsque vous utilisez le site, votre préférence linguistique peut être enregistrée localement dans votre navigateur. Le site peut également traiter des données techniquement nécessaires, comme les journaux du serveur, pour assurer sa sécurité et son fonctionnement."] },
      { title: "Pourquoi les données sont-elles traitées ?", body: ["Les données sont utilisées pour vous contacter, traiter votre demande, assurer le suivi des projets et le fonctionnement technique du site, ainsi que pour prévenir les abus ou les problèmes de sécurité."] },
      { title: "Partage avec des tiers", body: ["Les données ne sont pas vendues. Des services fiables peuvent être utilisés pour le fonctionnement du site, comme l’hébergement, Formspree pour les formulaires de contact et Cloudinary pour les médias. Ces prestataires traitent les données uniquement dans le cadre de leur rôle technique."] },
      { title: "Durée de conservation", body: ["Les messages et les échanges relatifs aux projets ne sont pas conservés plus longtemps que nécessaire pour le suivi, l’administration ou les obligations légales."] },
      { title: "Vos droits", body: ["Vous pouvez demander l’accès à vos données personnelles, leur rectification ou leur suppression. Vous pouvez également vous opposer à leur traitement lorsqu’un motif valable le justifie."] },
      { title: "Contact", body: [`Pour toute question concernant la confidentialité, vous pouvez écrire à ${CONTACT_EMAIL}.`] },
    ],
  },
};

const englishPages: typeof dutchPages = {
  cookies: {
    eyebrow: "Cookie policy", title: "Cookie policy",
    intro: "This website uses as little storage in your browser as possible. Below, you can read what it is used for.",
    updated: "Last updated: 5 May 2026",
    sections: [
      { title: "What are cookies?", body: ["Cookies and similar technologies are small pieces of information that a website can store in your browser. They may be needed for a website to function properly or to remember preferences."] },
      { title: "What storage does this website use?", body: ["This website stores your language choice locally in your browser using localStorage. This preserves your preference, such as Dutch, French or English, when you return.", "No advertising cookies are placed, and no tracking is used to follow you across other websites."] },
      { title: "External services", body: ["Formspree may be used to handle messages submitted through the contact form. Project images and logos may be loaded through Cloudinary. When you click external links, such as Instagram or LinkedIn, the terms and cookie settings of that external website apply."] },
      { title: "Managing cookies", body: ["You can delete or block cookies and local storage through your browser settings. Please bear in mind that some preferences may then need to be set again."] },
      { title: "Contact", body: [`You can email questions about this cookie policy to ${CONTACT_EMAIL}.`] },
    ],
  },
  terms: {
    eyebrow: "Terms", title: "Terms of use",
    intro: "These terms describe how you may use this website and the portfolio displayed on it.",
    updated: "Last updated: 5 May 2026",
    sections: [
      { title: "Using the website", body: ["You may view this website for personal, informational and professional evaluation purposes. You may not use it in a way that causes damage, disrupts its operation or violates applicable legislation."] },
      { title: "Intellectual property", body: ["All text, designs, logos, images, layouts, animations, code and portfolio items on this website remain the property of Nolan Design, Nolan Weemaels or the named rights holders, unless expressly stated otherwise.", "My work may not be copied, shared, reproduced, adapted, published, sold or used, in whole or in part, without prior written permission. This applies to all of my work outside school assignments. School assignments may only be used within the context for which they were originally created, unless written permission has been given for wider use."] },
      { title: "Portfolio and client work", body: ["Projects are shown as portfolio work and references. Clients’ brand names, logos and images remain the property of their respective owners. Displaying a project does not grant permission to reuse material from that project."] },
      { title: "Liability", body: ["I try to keep the information on this website accurate and up to date, but cannot guarantee that everything is always completely free of errors. You use this website at your own responsibility."] },
      { title: "Contact", body: [`For permission, questions or reports, you can email ${CONTACT_EMAIL}.`] },
    ],
  },
  privacy: {
    eyebrow: "Privacy", title: "Privacy policy",
    intro: "I handle personal data carefully and collect only what is necessary for the website and communication to function.",
    updated: "Last updated: 5 May 2026",
    sections: [
      { title: "What data is processed?", body: ["When you use the contact form or email directly, your name, email address, message and any project information may be processed to respond to your enquiry.", "When you use the website, your language preference may be stored locally in your browser. The website may also process technically necessary data, such as server logs, to ensure security and proper operation."] },
      { title: "Why is data processed?", body: ["Data is used to contact you, handle your enquiry, follow up on projects, keep the website functioning technically and prevent misuse or security problems."] },
      { title: "Sharing with third parties", body: ["Data is not sold. Reliable services may be used to operate the website, such as hosting, Formspree for contact forms and Cloudinary for media. These parties process data only for their technical role."] },
      { title: "Retention period", body: ["Messages and project correspondence are not kept longer than necessary for follow-up, administration or legal obligations."] },
      { title: "Your rights", body: ["You can request access to, correction of or deletion of your personal data. You can also object to processing where there is a valid reason to do so."] },
      { title: "Contact", body: [`For privacy questions, you can email ${CONTACT_EMAIL}.`] },
    ],
  },
};

export const legalPages: Record<Language, typeof dutchPages> = { nl: dutchPages, fr: frenchPages, en: englishPages };
export const legalContactLabels: Record<Language, string> = { nl: "Contact opnemen", fr: "Me contacter", en: "Get in touch" };
