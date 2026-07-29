import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(await readFile(join(root, "src/data/seoRoutes.json"), "utf8"));
const { site, routes } = data;
const mode = process.argv[2];
let buildManifest = {};

const pageSourceByType = {
  home: "src/pages/HomePage.tsx",
  portfolio: "src/pages/PortfolioPage.tsx",
  project: "src/pages/ProjectDetailPage.tsx",
  about: "src/pages/AboutPage.tsx",
  contact: "src/pages/ContactPage.tsx",
  legal: "src/pages/LegalPage.tsx",
  admin: "src/pages/AdminPage.tsx",
};

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function absoluteUrl(path = site.defaultImage) {
  if (/^https?:\/\//.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function routeUrl(route) {
  return route.path === "/" ? `${site.url}/` : `${site.url}${route.path}`;
}

function schemaFor(route) {
  const url = routeUrl(route);
  const image = absoluteUrl(route.image || site.defaultImage);
  const imageWidth = route.imageWidth || 1280;
  const imageHeight = route.imageHeight || 1280;
  const personId = `${site.url}/#nolan-weemaels`;
  const websiteId = `${site.url}/#website`;
  const graph = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${site.url}/`,
      name: site.name,
      inLanguage: "nl-BE",
      publisher: { "@id": personId },
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
      sameAs: [
        "https://www.instagram.com/nolanweemaelsdesign/",
        "https://www.linkedin.com/in/nolan-weemaels-1780511b4/",
      ],
    },
  ];

  const page = {
    "@type": route.type === "about" ? "ProfilePage" : route.type === "portfolio" ? "CollectionPage" : route.type === "contact" ? "ContactPage" : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: route.title,
    description: route.description,
    isPartOf: { "@id": websiteId },
    about: { "@id": personId },
    primaryImageOfPage: { "@type": "ImageObject", url: image, width: imageWidth, height: imageHeight },
    inLanguage: "nl-BE",
  };

  if (route.type === "home" || route.type === "about") page.mainEntity = { "@id": personId };
  graph.push(page);

  if (route.type === "project") {
    graph.push({
      "@type": "CreativeWork",
      "@id": `${url}#project`,
      url,
      name: route.heading,
      description: route.intro,
      image,
      creator: { "@id": personId },
      copyrightHolder: { "@id": personId },
      inLanguage: "nl-BE",
    });
  }

  if (route.type === "portfolio") {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#projects`,
      name: "Portfolio van Nolan Design",
      itemListElement: routes
        .filter((item) => item.type === "project" && item.index)
        .map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.heading,
          url: routeUrl(item),
        })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function replaceTag(html, id, replacement) {
  const pattern = new RegExp(`<[^>]+id=["']${id}["'][^>]*>`, "i");
  return html.replace(pattern, replacement);
}

function replaceScript(html, id, content) {
  const pattern = new RegExp(`<script[^>]+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, "i");
  return html.replace(pattern, `<script id="${id}" type="application/ld+json">${JSON.stringify(content)}</script>`);
}

function fallbackMarkup(route) {
  const projects = routes.filter((item) => item.type === "project" && item.index);
  const projectLinks = projects
    .map((item) => `<li><a href="${item.path}">${escapeHtml(item.heading)}</a></li>`)
    .join("");
  const related = route.type === "portfolio"
    ? `<section><h2>Projecten</h2><ul>${projectLinks}</ul></section>`
    : route.type === "project"
      ? `<p><a href="/portfolio/">Bekijk het volledige portfolio</a></p>`
      : `<p><a href="/portfolio/">Bekijk mijn portfolio</a> of <a href="/contact/">neem contact op</a>.</p>`;
  const image = route.image
    ? `<img src="${route.image}" alt="${escapeHtml(route.imageAlt || route.heading)}" width="${route.imageWidth || 1280}" height="${route.imageHeight || 1280}" />`
    : "";

  return `<div id="root"><noscript><main class="seo-fallback"><article><h1>${escapeHtml(route.heading)}</h1><p>${escapeHtml(route.intro)}</p>${image}${related}</article></main></noscript></div>`;
}

function renderRouteHtml(template, route) {
  const canonical = routeUrl(route);
  const image = absoluteUrl(route.image || site.defaultImage);
  const imageWidth = route.imageWidth || 1280;
  const imageHeight = route.imageHeight || 1280;
  const robots = route.index ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, nofollow";
  let html = template.replace(/<html lang="[^"]*">/, '<html lang="nl-BE">');

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  html = replaceTag(html, "meta-description", `<meta id="meta-description" name="description" content="${escapeHtml(route.description)}" />`);
  html = replaceTag(html, "meta-robots", `<meta id="meta-robots" name="robots" content="${robots}" />`);
  html = replaceTag(html, "canonical-url", `<link id="canonical-url" rel="canonical" href="${canonical}" />`);
  html = replaceTag(html, "og-type", `<meta id="og-type" property="og:type" content="${route.type === "project" ? "article" : "website"}" />`);
  html = replaceTag(html, "og-title", `<meta id="og-title" property="og:title" content="${escapeHtml(route.title)}" />`);
  html = replaceTag(html, "og-description", `<meta id="og-description" property="og:description" content="${escapeHtml(route.description)}" />`);
  html = replaceTag(html, "og-url", `<meta id="og-url" property="og:url" content="${canonical}" />`);
  html = replaceTag(html, "og-image", `<meta id="og-image" property="og:image" content="${image}" />`);
  html = replaceTag(html, "og-image-alt", `<meta id="og-image-alt" property="og:image:alt" content="${escapeHtml(route.imageAlt || route.heading)}" />`);
  html = replaceTag(html, "og-image-width", `<meta id="og-image-width" property="og:image:width" content="${imageWidth}" />`);
  html = replaceTag(html, "og-image-height", `<meta id="og-image-height" property="og:image:height" content="${imageHeight}" />`);
  html = replaceTag(html, "twitter-title", `<meta id="twitter-title" name="twitter:title" content="${escapeHtml(route.title)}" />`);
  html = replaceTag(html, "twitter-description", `<meta id="twitter-description" name="twitter:description" content="${escapeHtml(route.description)}" />`);
  html = replaceTag(html, "twitter-image", `<meta id="twitter-image" name="twitter:image" content="${image}" />`);
  html = replaceTag(html, "twitter-image-alt", `<meta id="twitter-image-alt" name="twitter:image:alt" content="${escapeHtml(route.imageAlt || route.heading)}" />`);
  html = replaceScript(html, "seo-schema", schemaFor(route));
  const routeAsset = buildManifest[pageSourceByType[route.type]];
  const resourceHints = [
    routeAsset?.file ? `<link rel="modulepreload" href="/${routeAsset.file}" />` : "",
    route.type === "home" ? '<link rel="preload" as="image" type="image/webp" href="/assets/logos/main-logo-white.webp" fetchpriority="high" />' : "",
  ].filter(Boolean).join("");
  html = html.replace("</head>", `${resourceHints}</head>`);
  html = html.replace('<div id="root"></div>', fallbackMarkup(route));
  return html;
}

function renderAliasHtml(template, route) {
  const canonical = routeUrl(route);
  let html = renderRouteHtml(template, route);
  html = replaceTag(html, "meta-robots", '<meta id="meta-robots" name="robots" content="noindex, follow" />');
  return html.replace(
    "</head>",
    `<meta http-equiv="refresh" content="0; url=${canonical}" /><script>window.location.replace(${JSON.stringify(canonical)})</script></head>`,
  );
}

function sitemapXml() {
  const urls = routes
    .filter((route) => route.index)
    .map((route) => `  <url>\n    <loc>${routeUrl(route)}</loc>\n    <lastmod>${site.lastModified}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

if (mode === "--public") {
  await writeFile(join(root, "public/sitemap.xml"), sitemapXml());
} else if (mode === "--dist") {
  const dist = join(root, "dist");
  buildManifest = JSON.parse(await readFile(join(dist, ".vite/manifest.json"), "utf8"));
  const template = await readFile(join(dist, "index.html"), "utf8");
  await writeFile(join(dist, "sitemap.xml"), sitemapXml());

  for (const route of routes) {
    const output = route.path === "/" ? join(dist, "index.html") : join(dist, route.path, "index.html");
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, renderRouteHtml(template, route));

    for (const alias of route.aliases || []) {
      const aliasOutput = join(dist, alias, "index.html");
      await mkdir(dirname(aliasOutput), { recursive: true });
      await writeFile(aliasOutput, renderAliasHtml(template, route));
    }
  }

  await writeFile(join(dist, "404.html"), await readFile(join(root, "public/404.html"), "utf8"));
} else {
  throw new Error("Gebruik --public of --dist");
}
