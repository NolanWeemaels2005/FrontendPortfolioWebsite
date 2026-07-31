import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { site, routes } = JSON.parse(await readFile(join(root, "src/data/seoRoutes.json"), "utf8"));
const dist = join(root, "dist");
const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
const robots = await readFile(join(dist, "robots.txt"), "utf8");
const llms = await readFile(join(dist, "llms.txt"), "utf8").catch(() => "");
const errors = [];
const indexableRoutes = routes.filter((route) => route.index);
const titles = new Set();
const descriptions = new Set();

function routeFile(path) {
  return path === "/" ? join(dist, "index.html") : join(dist, path, "index.html");
}

function decodeHtml(value) {
  return value
    ?.replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function match(html, pattern, label, route) {
  const value = html.match(pattern)?.[1];
  if (!value) errors.push(`${route.path}: ${label} ontbreekt`);
  return value;
}

for (const route of routes) {
  const html = await readFile(routeFile(route.path), "utf8");
  const canonical = route.path === "/" ? `${site.url}/` : `${site.url}${route.path}`;
  const title = decodeHtml(match(html, /<title>([^<]+)<\/title>/i, "title", route));
  const description = decodeHtml(match(html, /<meta[^>]+name="description"[^>]+content="([^"]+)"/i, "description", route));
  const robotsValue = match(html, /<meta[^>]+name="robots"[^>]+content="([^"]+)"/i, "robots", route);
  const canonicalValue = match(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i, "canonical", route);
  const schemaText = match(html, /<script[^>]+id="seo-schema"[^>]*>([\s\S]*?)<\/script>/i, "JSON-LD", route);

  if (title !== route.title) errors.push(`${route.path}: title wijkt af van seoRoutes.json`);
  if (description !== route.description) errors.push(`${route.path}: description wijkt af van seoRoutes.json`);
  if (canonicalValue !== canonical) errors.push(`${route.path}: canonical is ${canonicalValue || "leeg"}`);
  if (route.index && !robotsValue?.startsWith("index, follow")) errors.push(`${route.path}: indexeerbare route staat niet op index, follow`);
  if (!route.index && !robotsValue?.startsWith("noindex")) errors.push(`${route.path}: niet-indexeerbare route mist noindex`);

  if (schemaText) {
    try {
      const schema = JSON.parse(schemaText);
      if (schema["@context"] !== "https://schema.org" || !Array.isArray(schema["@graph"])) {
        errors.push(`${route.path}: JSON-LD heeft geen geldige graph`);
      }
    } catch {
      errors.push(`${route.path}: JSON-LD is geen geldige JSON`);
    }
  }

  if (route.index) {
    if (!sitemap.includes(`<loc>${canonical}</loc>`)) errors.push(`${route.path}: ontbreekt in sitemap`);
    if (titles.has(title)) errors.push(`${route.path}: dubbele title`);
    if (descriptions.has(description)) errors.push(`${route.path}: dubbele description`);
    titles.add(title);
    descriptions.add(description);
  } else if (sitemap.includes(`<loc>${canonical}</loc>`)) {
    errors.push(`${route.path}: noindex-route staat in sitemap`);
  }

  for (const alias of route.aliases || []) {
    const aliasHtml = await readFile(routeFile(alias), "utf8");
    if (!aliasHtml.includes('content="noindex, follow"')) errors.push(`${alias}: alias mist noindex, follow`);
    if (!aliasHtml.includes(`href="${canonical}"`)) errors.push(`${alias}: alias mist canonical naar ${route.path}`);
  }
}

const sitemapUrlCount = (sitemap.match(/<loc>/g) || []).length;
if (sitemapUrlCount !== indexableRoutes.length) {
  errors.push(`sitemap bevat ${sitemapUrlCount} URL's in plaats van ${indexableRoutes.length}`);
}
if (!robots.includes(`Sitemap: ${site.url}/sitemap.xml`)) errors.push("robots.txt mist de sitemap-URL");
if (!robots.includes("Disallow: /beheer")) errors.push("robots.txt blokkeert /beheer niet");
if (!llms.includes("# Nolan Design")) errors.push("llms.txt ontbreekt of mist de titel");
if (!llms.includes(`${site.url}/portfolio/`)) errors.push("llms.txt mist de portfolio-URL");

if (errors.length) {
  console.error(`SEO-audit mislukt:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

const aliasCount = routes.reduce((count, route) => count + (route.aliases?.length || 0), 0);
console.log(`SEO-audit geslaagd: ${indexableRoutes.length} indexeerbare routes, ${aliasCount} aliases en ${sitemapUrlCount} sitemap-URL's.`);
