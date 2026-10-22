import { ArrowLeft } from "lucide-react";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { useLanguage } from "../i18n/LanguageContext";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { blogApi, BlogApiError } from "../data/blogApi";
import { blogDate, httpLink, type BlogPost } from "../utils/blog";
import { BlogMediaGallery } from "../components/blog/BlogMediaGallery";
import { BlogMeta } from "../components/blog/BlogMeta";

function Sources({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<>]+)/g);
  return <p className="blog-prose">{parts.map((part, index) => {
    const clean = part.replace(/[.,;!?)\]]+$/, "");
    const url = httpLink(clean);
    return url ? <span key={index}><a href={url} target="_blank" rel="noopener noreferrer">{clean}</a>{part.slice(clean.length)}</span> : part;
  })}</p>;
}
function Chapter({ title, children, highlight = false }: { title: string; children: ReactNode; highlight?: boolean }) {
  return <section className={`blog-chapter${highlight ? " blog-chapter--learning" : ""}`}><h2>{title}</h2><div className="blog-chapter__body">{children}</div></section>;
}
export function BlogPostPage() {
  const { language, t } = useLanguage();
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setPost(null); setError(""); setNotFound(false);
    blogApi.post(slug, controller.signal).then(setPost).catch(error => {
      if (controller.signal.aborted) return;
      setNotFound(error instanceof BlogApiError && error.status === 404); setError(error.message);
    });
    return () => controller.abort();
  }, [slug, retry]);
  if (!post) return <section className="blog-page blog-post blog-container blog-state" lang={language}>
    <BlogMeta title={notFound ? t("blog.notFound") : "Blog"} description={t("blog.description")} index={false} />
    <h1>{notFound ? t("blog.notFound") : error ? t("blog.unavailable") : t("blog.loadingPost")}</h1>
    {error && <p role="alert">{notFound ? t("blog.missing") : t("blog.error")}</p>}
    {!error && <p role="status">{t("blog.wait")}</p>}
    {error && !notFound && <button className="blog-button" onClick={() => setRetry(value => value + 1)}>{t("blog.retry")}</button>}
    <Link className="back-link" to="/blog/" data-cursor="soft"><ArrowLeft size={22} aria-hidden="true" /><ButtonTextStagger text={t("blog.all")} /></Link>
  </section>;
  return <article className="blog-page blog-post" lang={language}>
    <BlogMeta title={post.title} description={post.summary} />
    <header className="blog-post-header blog-container">
      <Link className="back-link" to="/blog/" data-cursor="soft">
        <ArrowLeft size={22} aria-hidden="true" /><ButtonTextStagger text={t("blog.all")} />
      </Link>
      <div className="blog-post-header__meta">
        <p className="eyebrow">Blog</p>
        {post.publishedAt && <time dateTime={post.publishedAt}>{blogDate(post.publishedAt, language)}</time>}
      </div>
      <h1>{post.title}</h1>
      <p className="blog-prose blog-post-summary">{post.summary}</p>
    </header>
    <div className="blog-container blog-article">
      <Chapter title={t("blog.context")}><p className="blog-prose">{post.context}</p></Chapter>
      <Chapter title={t("blog.process")}><p className="blog-prose">{post.process}</p>{post.media.length > 0 && <BlogMediaGallery media={post.media} />}</Chapter>
      <Chapter title={t("blog.learning")} highlight><p className="blog-prose">{post.learning}</p></Chapter>
      <Chapter title={t("blog.reflection")}><p className="blog-prose">{post.reflection}</p></Chapter>
      {post.aiUsed && <Chapter title={t("blog.ai")}><h3>{t("blog.aiContribution")}</h3><p className="blog-prose">{post.aiContribution}</p><h3>{t("blog.humanContribution")}</h3><p className="blog-prose">{post.humanContribution}</p></Chapter>}
      {post.planning.trim() && <Chapter title={t("blog.planning")}><p className="blog-prose">{post.planning}</p></Chapter>}
      <Chapter title={t("blog.sources")}><Sources text={post.sources} /></Chapter>
      <Link className="btn btn--primary" to="/blog/" data-cursor="merge"><ArrowLeft size={20} aria-hidden="true" /><ButtonTextStagger text={t("blog.all")} /></Link>
    </div>
  </article>;
}
