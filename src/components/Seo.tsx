import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import seoData from "../data/seoRoutes.json";
import { getCombinedProjects } from "../data/projectQueries";
import { useLanguage } from "../i18n/LanguageContext";

type SeoRoute = (typeof seoData.routes)[number];

const { site } = seoData;

function setMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = url;
}

function setSchema(schema: object) {
  let element = document.head.querySelector<HTMLScriptElement>("#seo-schema");

  if (!element) {
    element = document.createElement("script");
    element.id = "seo-schema";
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
}

function normalizePath(pathname: string) {
  return pathname === "/" ? "/" : `/${pathname.split("/").filter(Boolean).join("/")}/`;
}

function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function keywordsFor(seo: SeoRoute) {
  const routeKeywords = "keywords" in seo && Array.isArray(seo.keywords) ? seo.keywords : [];
  return [...new Set([...routeKeywords, ...site.keywords])];
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function routeSeo(pathname: string): SeoRoute & { known: boolean } {
  const path = normalizePath(pathname);
  const configured = seoData.routes.find((route) => route.path === path);
  if (configured) return { ...configured, known: true };

  if (path.startsWith("/portfolio/")) {
    const slug = path.replace(/^\/portfolio\//, "").replace(/\/$/, "");
    const project = getCombinedProjects().find((item) => item.slug === slug);
    const title = project?.title || titleFromSlug(slug);
    return {
      path,
      title: `${title} | Nolan Design`,
      description: project?.summary || project?.text || `Bekijk het project ${title} in het portfolio van Nolan Design.`,
      heading: title,
      intro: project?.summary || `Een grafisch ontwerpproject uit het portfolio van Nolan Design.`,
      image: project?.cover || site.defaultImage,
      imageAlt: `${title}, grafisch ontwerpproject van Nolan Design`,
      type: "project",
      index: Boolean(project),
      known: Boolean(project),
    };
  }

  return {
    path,
    title: "Pagina niet gevonden | Nolan Design",
    description: "Deze pagina bestaat niet of is verplaatst.",
    heading: "Pagina niet gevonden",
    intro: "Deze pagina bestaat niet of is verplaatst.",
    type: "not-found",
    index: false,
    known: false,
  };
}

function schemaFor(seo: SeoRoute, canonicalUrl: string, image: string, imageWidth: number, imageHeight: number) {
  const personId = `${site.url}/#nolan-weemaels`;
  const businessId = `${site.url}/#nolan-design`;
  const websiteId = `${site.url}/#website`;
  const pageType = seo.type === "about" ? "ProfilePage" : seo.type === "portfolio" ? "CollectionPage" : seo.type === "contact" ? "ContactPage" : "WebPage";
  const sameAs = [
    "https://www.instagram.com/nolanweemaelsdesign/",
    "https://www.linkedin.com/in/nolan-weemaels-1780511b4/",
  ];
  const serviceArea = site.areaServed.map((name) => ({ "@type": "Place", name }));
  const keywords = keywordsFor(seo);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${site.url}/`,
      name: site.name,
      inLanguage: "nl-BE",
      publisher: { "@id": businessId },
    },
    {
      "@type": ["LocalBusiness", "ProfessionalService", "Organization"],
      "@id": businessId,
      name: site.name,
      url: `${site.url}/`,
      logo: `${site.url}/apple-touch-icon.png`,
      image: absoluteUrl(site.businessImage),
      description: "Grafisch ontwerp, branding, logo-ontwerp, visuele identiteit, webdesign en digitale vormgeving voor ondernemers en organisaties in Galmaarden, Pajottegem, Geraardsbergen en omgeving.",
      slogan: "Design dat blijft hangen",
      email: "mailto:info@nolandesign.be",
      telephone: "+32472085890",
      priceRange: "€€",
      founder: { "@id": personId },
      address: {
        "@type": "PostalAddress",
        addressLocality: site.baseLocality,
        addressRegion: site.addressRegion,
        addressCountry: "BE",
      },
      areaServed: serviceArea,
      serviceType: ["Grafisch ontwerp", "Branding", "Logo-ontwerp", "Visuele identiteit", "Webdesign", "Digital design"],
      knowsAbout: keywords,
      sameAs,
    },
    {
      "@type": "Person",
      "@id": personId,
      name: site.owner,
      alternateName: site.name,
      url: `${site.url}/`,
      image: `${site.url}/apple-touch-icon.png`,
      jobTitle: "Grafisch ontwerper",
      email: "mailto:info@nolandesign.be",
      telephone: "+32472085890",
      knowsAbout: ["Grafisch ontwerp", "Branding", "Visuele identiteit", "Webdesign", "Digital design"],
      worksFor: { "@id": businessId },
      sameAs,
    },
    {
      "@type": pageType,
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: seo.title,
      description: seo.description,
      keywords,
      isPartOf: { "@id": websiteId },
      about: { "@id": personId },
      primaryImageOfPage: { "@type": "ImageObject", url: image, width: imageWidth, height: imageHeight },
      inLanguage: "nl-BE",
      ...(seo.type === "home" || seo.type === "about" ? { mainEntity: { "@id": personId } } : {}),
    },
  ];

  if (seo.type === "project") {
    graph.push({
      "@type": "CreativeWork",
      "@id": `${canonicalUrl}#project`,
      url: canonicalUrl,
      name: seo.heading,
      description: seo.intro,
      image,
      creator: { "@id": personId },
      copyrightHolder: { "@id": personId },
      inLanguage: "nl-BE",
    });
  }

  if (seo.type === "portfolio") {
    graph.push({
      "@type": "ItemList",
      "@id": `${canonicalUrl}#projects`,
      name: "Portfolio van Nolan Design",
      itemListElement: seoData.routes
        .filter((route) => route.type === "project" && route.index)
        .map((route, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: route.heading,
          url: `${site.url}${route.path}`,
        })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function Seo() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const seo = routeSeo(pathname);
    const canonicalUrl = seo.path === "/" ? `${site.url}/` : `${site.url}${seo.path}`;
    const image = absoluteUrl(seo.image || site.defaultImage);
    const imageWidth = "imageWidth" in seo ? seo.imageWidth || 1280 : 1280;
    const imageHeight = "imageHeight" in seo ? seo.imageHeight || 1280 : 1280;
    const imageAlt = seo.imageAlt || seo.heading;
    const robots = seo.index
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, nofollow";

    document.documentElement.lang = language === "nl" ? "nl-BE" : language;
    document.title = seo.title;
    const updateTabTitle = () => {
      document.title = document.hidden ? "Hey, nu al weg?" : seo.title;
    };
    document.addEventListener("visibilitychange", updateTabTitle);
    setCanonical(canonicalUrl);
    setMeta("description", seo.description);
    setMeta("robots", robots);
    setMeta("googlebot", robots);
    setMeta("author", site.owner);
    setMeta("keywords", keywordsFor(seo).join(", "));
    setMeta("og:site_name", site.name, "property");
    setMeta("og:locale", site.locale, "property");
    setMeta("og:type", seo.type === "project" ? "article" : "website", "property");
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:image", image, "property");
    setMeta("og:image:alt", imageAlt, "property");
    setMeta("og:image:width", String(imageWidth), "property");
    setMeta("og:image:height", String(imageHeight), "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setMeta("twitter:image", image);
    setMeta("twitter:image:alt", imageAlt);
    setSchema(schemaFor(seo, canonicalUrl, image, imageWidth, imageHeight));

    return () => document.removeEventListener("visibilitychange", updateTabTitle);
  }, [language, pathname]);

  return null;
}
