import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import type { BlogPost } from "../../utils/blog";
import seoData from "../../data/seoRoutes.json";

export function BlogMeta({ title, description, index = true, post }: { title: string; description: string; index?: boolean; post?: BlogPost }) {
  const { language } = useLanguage();
  const { pathname } = useLocation();

  // Runs after Seo's layout effect so route/language changes cannot overwrite article metadata.
  useEffect(() => {
    document.title = `${title} | Nolan Design`;
    const robots = index ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, follow";
    for (const [name, content] of Object.entries({ description, googlebot: robots, robots })) {
      let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!meta) { meta = document.createElement("meta"); meta.name = name; document.head.append(meta); }
      meta.content = content;
    }
    for (const [property, content] of Object.entries({ "og:title": document.title, "og:description": description, "og:type": post ? "article" : "website", "twitter:title": document.title, "twitter:description": description })) {
      const meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"], meta[name="${property}"]`);
      if (meta) meta.content = content;
    }

    if (!post) return;
    const url = `${seoData.site.url}/blog/${encodeURIComponent(post.slug)}/`;
    const schema = document.createElement("script");
    schema.id = "blog-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      url,
      headline: post.title,
      description: post.summary,
      mainEntityOfPage: { "@id": `${url}#webpage` },
      author: { "@id": `${seoData.site.url}/#nolan-weemaels` },
      publisher: { "@id": `${seoData.site.url}/#nolan-design` },
      ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
      ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    });
    document.head.append(schema);
    return () => schema.remove();
  }, [title, description, index, post, language, pathname]);
  return null;
}
