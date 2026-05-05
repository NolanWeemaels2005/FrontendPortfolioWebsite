import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCombinedProjects } from "../data/projectQueries";

const siteUrl = "https://nolandesign.be";
const siteName = "Nolan Design";
const defaultTitle = "Nolan Design | Grafisch ontwerper en portfolio";
const defaultDescription =
  "Portfolio van Nolan Weemaels, grafisch ontwerper met focus op branding, visuele identiteiten, webdesign en digitale projecten.";
const defaultImage = `${siteUrl}/assets/project-covers/coverKAAI.png`;

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

function cleanPath(pathname: string) {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getSeo(pathname: string) {
  const path = cleanPath(pathname);

  if (path === "/beheer") {
    return {
      title: "Beheer | Nolan Design",
      description: "Afgeschermde beheerpagina van Nolan Design.",
      canonicalPath: "/beheer",
      robots: "noindex, nofollow",
      image: defaultImage,
    };
  }

  if (path === "/portfolio") {
    return {
      title: "Portfolio | Nolan Design",
      description: "Bekijk grafische projecten, branding, logo's, websites en visuele identiteiten van Nolan Design.",
      canonicalPath: "/portfolio",
      robots: "index, follow",
      image: defaultImage,
    };
  }

  if (path === "/about") {
    return {
      title: "Over Nolan | Nolan Design",
      description: "Leer Nolan Weemaels kennen en ontdek zijn focus op branding, grafisch ontwerp en digitale vormgeving.",
      canonicalPath: "/about",
      robots: "index, follow",
      image: `${siteUrl}/assets/about/nolan-portrait.png`,
    };
  }

  if (path === "/contact") {
    return {
      title: "Contact | Nolan Design",
      description: "Neem contact op met Nolan Design voor branding, grafisch ontwerp, websites en creatieve projecten.",
      canonicalPath: "/contact",
      robots: "index, follow",
      image: defaultImage,
    };
  }

  if (path.startsWith("/portfolio/")) {
    const slug = path.replace("/portfolio/", "");
    const project = getCombinedProjects().find((item) => item.slug === slug);
    const title = project?.title || titleFromSlug(slug);

    return {
      title: `${title} | Nolan Design`,
      description:
        project?.summary ||
        project?.text ||
        `Bekijk het project ${title} in het portfolio van Nolan Design.`,
      canonicalPath: `/portfolio/${slug}`,
      robots: "index, follow",
      image: project?.cover ? `${siteUrl}${project.cover.startsWith("/") ? project.cover : `/${project.cover}`}` : defaultImage,
    };
  }

  return {
    title: defaultTitle,
    description: defaultDescription,
    canonicalPath: "/",
    robots: "index, follow",
    image: defaultImage,
  };
}

export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeo(pathname);
    const canonicalUrl = `${siteUrl}${seo.canonicalPath === "/" ? "" : seo.canonicalPath}`;

    document.documentElement.lang = "nl";
    document.title = seo.title;
    setCanonical(canonicalUrl);
    setMeta("description", seo.description);
    setMeta("robots", seo.robots);
    setMeta("author", "Nolan Weemaels");
    setMeta("og:site_name", siteName, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:image", seo.image, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setMeta("twitter:image", seo.image);
  }, [pathname]);

  return null;
}
