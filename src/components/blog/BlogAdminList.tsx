import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { blogApi } from "../../data/blogApi";
import { blogDate, type BlogAdminSummary } from "../../utils/blog";
import { useUnsavedBlog } from "../../hooks/useUnsavedBlog";

export function BlogAdminList({ token }: { token: string }) {
  const [posts, setPosts] = useState<BlogAdminSummary[] | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [createdId, setCreatedId] = useState("");
  const locked = useRef(false);
  const navigate = useNavigate();
  useUnsavedBlog(Boolean(title.trim()) || busy);
  useEffect(() => { if (createdId && !busy) navigate(`/beheer?type=blog&post=${createdId}`); }, [createdId, busy, navigate]);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setError("");
    blogApi.adminList(controller.signal).then(setPosts).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [token, retry]);
  async function create(event: FormEvent) {
    event.preventDefault();
    if (locked.current || !title.trim()) return;
    locked.current = true; setBusy(true); setError("");
    try { const post = await blogApi.create(title.trim()); setTitle(""); setCreatedId(post._id); }
    catch (error) { setError(error instanceof Error ? error.message : "Concept aanmaken mislukt."); }
    finally { locked.current = false; setBusy(false); }
  }
  return <>
    <form className="blog-panel blog-form" onSubmit={create}>
      <h2>Nieuw concept</h2>
      <label htmlFor="new-blog-title">Titel</label>
      <p id="new-blog-help" className="blog-muted">Geef concreet aan wat de lezer leert. Je kunt de rest later schrijven.</p>
      <input id="new-blog-title" aria-describedby="new-blog-help" required value={title} disabled={busy} onChange={event => setTitle(event.target.value)} />
      <button className="blog-button" disabled={busy || !title.trim()}>{busy ? "Concept aanmaken…" : "Concept aanmaken"}</button>
    </form>
    {error && <div className="blog-notice" role="alert"><p>{error}</p><button className="blog-button" disabled={busy} onClick={() => setRetry(value => value + 1)}>Overzicht opnieuw laden</button></div>}
    <section aria-labelledby="blog-admin-list-title"><h2 id="blog-admin-list-title">Alle berichten</h2>
      {!posts && !error ? <p role="status">Berichten laden…</p> : posts?.length === 0 ? <p>Je hebt nog geen blogberichten. Maak hierboven je eerste concept.</p> : <ul className="blog-admin-list">{posts?.map(post => <li key={post._id}>
        <div><span className="blog-badge">{post.status === "published" ? "Gepubliceerd" : "Concept"}</span><h3><Link to={`/beheer?type=blog&post=${post._id}`}>{post.title}</Link></h3><p className="blog-muted">Laatst aangepast: {blogDate(post.updatedAt)}</p></div>
        <div className="blog-actions"><Link className="blog-button" to={`/beheer?type=blog&post=${post._id}`}>Bewerken</Link>{post.status === "published" && <Link to={`/blog/${encodeURIComponent(post.slug)}/`}>Bekijken</Link>}</div>
      </li>)}</ul>}
    </section>
  </>;
}
