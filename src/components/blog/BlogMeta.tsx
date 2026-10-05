import { useEffect } from "react";
export function BlogMeta({ title, description, index = true }: { title: string; description: string; index?: boolean }) {
  useEffect(() => {
    document.title = `${title} | Nolan Design`;
    for (const [name, content] of Object.entries({ description, googlebot: index ? "index, follow" : "noindex, follow", robots: index ? "index, follow" : "noindex, follow" })) {
      let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!meta) { meta = document.createElement("meta"); meta.name = name; document.head.append(meta); }
      meta.content = content;
    }
    for (const [property, content] of Object.entries({ "og:title": document.title, "og:description": description, "twitter:title": document.title, "twitter:description": description })) {
      const meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"], meta[name="${property}"]`);
      if (meta) meta.content = content;
    }
  }, [title, description, index]);
  return null;
}
