import { useLanguage } from "../i18n/LanguageContext";
import { Hero } from "../components/Hero";
import { ScrollSectionEdge } from "../components/ScrollSectionEdge";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { blogApi } from "../data/blogApi";
import { blogDate, type BlogList } from "../utils/blog";
import { assetPath } from "../utils/asset";
import { BlogMeta } from "../components/blog/BlogMeta";

export function BlogPage() {
  const { language, t } = useLanguage();
  const [params] = useSearchParams();
  const raw = Number(params.get("page") || 1);
  const page = Number.isSafeInteger(raw) && raw > 0 ? raw : 1;
  const [data, setData] = useState<BlogList | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError("");
    blogApi.list(page, controller.signal).then(setData).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [page, retry]);
  return <div className="blog-page" lang={language}>
    <BlogMeta title={page > 1 ? `Blog — ${t("blog.page")} ${page}` : "Blog"} description={t("blog.description")} index={!error && (!data || page <= Math.max(1, data.pages))} />
    <div className="hero-overlap-scroll">
      <Hero title={t("blog.heroTitle")} script={t("blog.heroScript")} className="portfolio-showcase-hero blog-photo-hero" scrollTarget="blog-posts"
        visual={<div className="blog-photo-hero__media" aria-hidden="true">
          <img src={assetPath("assets/blog-hero/nolan-sketch-1920.jpg")} srcSet={`${assetPath("assets/blog-hero/nolan-sketch-960.jpg")} 960w, ${assetPath("assets/blog-hero/nolan-sketch-1920.jpg")} 1920w`} sizes="100vw" alt="" width="1920" height="1080" fetchPriority="high" decoding="async" />
        </div>}
      />
    </div>
    <ScrollSectionEdge color="#ee9d59" />
    <div id="blog-posts" className="blog-list-content">

    <header className="blog-editorial-intro">
      <div className="blog-container blog-editorial-intro__inner">
        <div><p className="eyebrow">Blog</p><h2 id="blog-posts-title">{t("blog.heading")}</h2></div>
        <p className="blog-intro">{t("blog.intro")}</p>
      </div>
    </header>
    <section className="blog-container blog-list-section" aria-labelledby="blog-posts-title" aria-busy={!data && !error}>
      {error ? <div className="blog-notice" role="alert"><p>{t("blog.error")}</p><button className="blog-button" onClick={() => setRetry(value => value + 1)}>{t("blog.retry")}</button></div> : !data ? <p role="status">{t("blog.loading")}</p> : <>
        {!data.posts.length ? <div className="blog-notice"><p>{page > 1 ? t("blog.emptyPage") : t("blog.empty")}</p>{page > 1 && <Link to="/blog/">{t("blog.first")}</Link>}</div> : <div className="blog-grid">{data.posts.map(post => <article className="blog-card" key={post._id}>
          {post.publishedAt && <time dateTime={post.publishedAt}>{blogDate(post.publishedAt, language)}</time>}
          <h3><Link to={`/blog/${encodeURIComponent(post.slug)}/`}>{post.title}</Link></h3><p>{post.summary}</p>
          <Link className="blog-read" to={`/blog/${encodeURIComponent(post.slug)}/`} aria-label={`${t("blog.readLabel")} ${post.title}`}>{t("blog.read")} <span aria-hidden="true">↗</span></Link>
        </article>)}</div>}
        {data.pages > 1 && <nav className="blog-pagination" aria-label={t("blog.pagination")}>
          {page > 1 && <Link to={`/blog/?page=${Math.min(page - 1, data.pages)}`} rel="prev">← {t("blog.previous")}</Link>}
          <span aria-current="page">{t("blog.page")} {page} {t("blog.of")} {data.pages}</span>
          {page < data.pages && <Link to={`/blog/?page=${page + 1}`} rel="next">{t("blog.next")} →</Link>}
        </nav>}
      </>}
    </section>
    </div>
  </div>;
}
