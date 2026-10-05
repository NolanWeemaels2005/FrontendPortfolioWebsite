import { useLanguage } from "../../i18n/LanguageContext";
import { httpLink, mediaRoles, type BlogMedia } from "../../utils/blog";

export function BlogMediaGallery({ media, onRemove, disabled = false }: { media: BlogMedia[]; onRemove?: (item: BlogMedia) => void; disabled?: boolean }) {
  const { t } = useLanguage();
  const roleLabel = (role: string) => t(`blog.${role === "process" ? "mediaProcess" : role}`);
  return <div className="blog-gallery">{media.map(item => {
    const url = httpLink(item.url);
    return <figure className={`blog-media blog-media--${item.role}`} key={item._id}>
      <span className="blog-badge">{roleLabel(item.role)} · {item.type === "video" ? t("blog.video") : t("blog.image")}</span>
      {url ? item.type === "video" ? <video controls preload="metadata" playsInline src={url} aria-label={item.caption || `${roleLabel(item.role)} — ${t("blog.video")}`}>
        {t("blog.videoFallback")} <a href={url}>{t("blog.openVideo")}</a>.
      </video> : <img src={url} alt={item.caption || `${roleLabel(item.role)} — ${t("blog.image")}`} loading="lazy" decoding="async" /> : <p>{t("blog.invalidMedia")}</p>}
      <figcaption>{item.caption && <p>{item.caption}</p>}{item.credit && <p className="blog-muted">Credit: {item.credit}</p>}
        {url && item.type === "video" && <a href={url} target="_blank" rel="noopener noreferrer">{t("blog.openVideo")}</a>}
      </figcaption>
      {onRemove && <button type="button" className="blog-button blog-button--quiet" disabled={disabled} onClick={() => onRemove(item)}>Verwijder {mediaRoles[item.role].toLowerCase()}-{item.type === "video" ? "video" : "afbeelding"}</button>}
    </figure>;
  })}</div>;
}
