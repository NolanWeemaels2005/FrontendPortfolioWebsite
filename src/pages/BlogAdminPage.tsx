import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { getAdminToken } from "../utils/adminAuth";
import { AdminPage } from "./AdminPage";
import { BlogAdminList } from "../components/blog/BlogAdminList";
import { BlogEditor } from "../components/blog/BlogEditor";

export function BlogAdminPage() {
  const { id: legacyId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get("post") || legacyId;
  const isBlog = params.get("type") === "blog" || location.pathname.startsWith("/beheer/blog");
  const [token, setToken] = useState(getAdminToken);
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const sync = () => { const next = getAdminToken(); setToken(next); if (!next) setExpired(true); };
    window.addEventListener("admin-auth-change", sync);
    return () => window.removeEventListener("admin-auth-change", sync);
  }, []);
  return <div className="blog-admin admin-workspace" lang="nl">
    <nav className="admin-content-switch blog-container" aria-label="Type inhoud beheren">
      <Link className="blog-button" aria-current={!isBlog ? "page" : undefined} to="/beheer">Projecten</Link>
      <Link className="blog-button" aria-current={isBlog ? "page" : undefined} to="/beheer?type=blog">Blog</Link>
    </nav>
    {!isBlog && <AdminPage loginTitle="Inloggen voor beheer" />}
    {isBlog && <>
    {!token && <><p className="blog-auth-notice" role="status">{expired ? "Je sessie is verlopen. Log opnieuw in met je bestaande account. Je tekst en uploadlijst blijven in dit scherm bewaard." : "Log in met je bestaande adminaccount om de blog te beheren."}</p><AdminPage loginTitle="Inloggen voor beheer" /></>}
    {/* Keep the editor mounted during reauthentication so no unsaved content is lost. */}
    <section className="blog-container blog-admin-shell" hidden={!token}>
      <header className="blog-admin-heading"><p className="eyebrow">Beheer</p><h1>{id ? "Blogbericht bewerken" : "Blog beheren"}</h1><nav className="blog-actions" aria-label="Beheernavigatie"><Link to="/blog/">Publieke blog</Link></nav></header>
      {id ? <BlogEditor key={id} id={id} token={token} /> : <BlogAdminList token={token} />}
    </section>
    </>}
  </div>;
}
