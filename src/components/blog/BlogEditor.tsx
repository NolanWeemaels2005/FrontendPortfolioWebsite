import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BlogApiError, blogApi, uploadBlogMedia } from "../../data/blogApi";
import { blogFields, blogTextFields, fieldHelp, mediaRoles, publicationIssues, blogFileIssue, blogFileAccept, type BlogFields, type BlogPost, type BlogMedia, type BlogStatus, type MediaRole } from "../../utils/blog";
import { BlogMediaGallery } from "./BlogMediaGallery";
import { useUnsavedBlog } from "../../hooks/useUnsavedBlog";

type QueueItem = { key: string; file: File; role: MediaRole; caption: string; credit: string; state: "pending" | "uploading" | "done" | "failed" | "uncertain"; progress: number; error: string; checked?: boolean };
export function BlogEditor({ id, token }: { id: string; token: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [fields, setFields] = useState<BlogFields>(() => blogFields({}));
  const [saved, setSaved] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [retry, setRetry] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [deleted, setDeleted] = useState(false);
  const loaded = useRef(false);
  const locked = useRef(false);
  const alive = useRef(true);
  const uploadController = useRef<AbortController | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dirty = Boolean(post) && JSON.stringify(fields) !== saved;
  const queued = queue.some(item => item.state !== "done");
  useUnsavedBlog(!deleted && (dirty || queued || Boolean(busy)));
  useEffect(() => { alive.current = true; return () => { alive.current = false; uploadController.current?.abort(); }; }, []);
  useEffect(() => { if (deleted && !busy) navigate("/beheer?type=blog", { replace: true }); }, [deleted, busy, navigate]);
  useEffect(() => { if (errors.length) errorRef.current?.focus(); }, [errors]);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setErrors([]); setNotFound(false);
    blogApi.adminPost(id, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setPost(data);
      // Logging back in refreshes media, never the editor's unsaved text.
      if (!loaded.current) { const initial = blogFields(data); setFields(initial); setSaved(JSON.stringify(initial)); loaded.current = true; }
    }).catch(error => {
      if (controller.signal.aborted) return;
      setNotFound(error instanceof BlogApiError && error.status === 404);
      setErrors([error.message]);
    });
    return () => controller.abort();
  }, [id, token, retry]);

  function showError(error: unknown) {
    if (!alive.current) return;
    setErrors(error instanceof BlogApiError && error.issues.length ? error.issues : [error instanceof Error ? error.message : "Deze actie is mislukt. Probeer opnieuw."]);
  }
  function begin(action: string) { if (locked.current || !token) return false; locked.current = true; setBusy(action); setErrors([]); setMessage(""); return true; }
  function finish() { locked.current = false; if (alive.current) setBusy(""); }
  async function save(status: BlogStatus) {
    if (!post || !fields.title.trim()) { setErrors(["Een concept heeft altijd een titel nodig."]); return; }
    const next = { ...fields, status };
    const issues = status === "published" ? publicationIssues(next, post.media) : [];
    if (issues.length) { setErrors(issues); return; }
    if (!begin("save")) return;
    try {
      const updated = await blogApi.save(id, next);
      if (!alive.current) return;
      const snapshot = blogFields(updated);
      setPost(updated); setFields(snapshot); setSaved(JSON.stringify(snapshot));
      setMessage(status === "published" ? "Bericht gepubliceerd en opgeslagen." : "Concept opgeslagen.");
    } catch (error) { showError(error); } finally { finish(); }
  }
  async function removeMedia(item: BlogMedia) {
    if (!post || locked.current) return;
    const required = post.status === "published" && publicationIssues(blogFields(post), post.media.filter(media => media._id !== item._id)).length > 0;
    if (required) {
      if (!window.confirm("Deze afbeelding is verplicht voor publicatie. Wil je eerst je tekst als concept opslaan en daarna deze afbeelding verwijderen? Het bericht verdwijnt dan uit de publieke blog.")) return;
      if (!fields.title.trim()) { setErrors(["Vul een titel in om het concept op te slaan."]); return; }
    } else if (!window.confirm("Dit mediabestand verwijderen? Dit verwijdert het bestand ook uit de mediaopslag.")) return;
    if (!begin(required ? "save" : "media")) return;
    try {
      if (required) {
        const draft = await blogApi.save(id, { ...fields, status: "draft" });
        if (!alive.current) return;
        const snapshot = blogFields(draft);
        setPost(draft); setFields(snapshot); setSaved(JSON.stringify(snapshot));
      }
      const updated = await blogApi.removeMedia(id, item._id);
      if (alive.current) { setPost(updated); setMessage("Media verwijderd. Je formuliertekst is behouden."); }
    } catch (error) { showError(error); } finally { finish(); }
  }
  async function removePost() {
    if (locked.current || !post || !window.confirm(`“${post.title}” en alle bijbehorende media definitief verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    if (!begin("delete")) return;
    try { await blogApi.remove(id); if (alive.current) { setDeleted(true); setQueue([]); } }
    catch (error) { showError(error); } finally { finish(); }
  }
  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const items = Array.from(event.target.files || []).map(file => {
      const issue = blogFileIssue(file);
      return { key: crypto.randomUUID(), file, role: "process" as const, caption: "", credit: "", state: issue ? "failed" as const : "pending" as const, progress: 0, error: issue };
    });
    setQueue(current => [...current, ...items]);
    event.target.value = "";
  }
  function patchQueue(key: string, patch: Partial<QueueItem>) { if (alive.current) setQueue(current => current.map(item => item.key === key ? { ...item, ...patch } : item)); }
  async function upload(keys?: string[]) {
    const items = queue.filter(item => (!keys || keys.includes(item.key)) && (item.state === "pending" || item.state === "failed") && !blogFileIssue(item.file));
    if (!items.length || !begin("upload")) return;
    const controller = new AbortController(); uploadController.current = controller;
    let successes = 0;
    for (const item of items) {
      if (!alive.current || controller.signal.aborted) break;
      patchQueue(item.key, { state: "uploading", progress: 0, error: "" });
      try {
        const updated = await uploadBlogMedia(id, item.file, item, percent => patchQueue(item.key, { progress: percent }), controller.signal);
        if (!alive.current) break;
        setPost(updated); // Intentionally don't touch fields or the saved text snapshot.
        patchQueue(item.key, { state: "done", progress: 100 }); successes++;
      } catch (error) {
        if (!alive.current) break;
        const uncertain = error instanceof BlogApiError && (error.status === 0 || error.status >= 500 || (error.status >= 200 && error.status < 300));
        patchQueue(item.key, { state: uncertain ? "uncertain" : "failed", error: error instanceof Error ? error.message : "Upload mislukt." });
        if (error instanceof BlogApiError && error.status === 401) { showError(error); break; }
        if (uncertain) {
          try { const updated = await blogApi.adminPost(id); if (alive.current) setPost(updated); } catch { /* The queue explains that confirmation is required before retrying. */ }
        }
      }
    }
    if (alive.current) setMessage(`${successes} bestand${successes === 1 ? "" : "en"} geüpload. Geslaagde uploads zijn bewaard; controleer de uploadlijst voor eventuele fouten.`);
    finish();
  }
  async function checkUncertain(item: QueueItem) {
    if (!begin("media")) return;
    try {
      const updated = await blogApi.adminPost(id);
      if (alive.current) {
        setPost(updated);
        patchQueue(item.key, { checked: true, error: "De medialijst is vernieuwd. Staat dit bestand er al bij? Verwijder het dan uit de uploadlijst. Anders kun je opnieuw proberen." });
      }
    } catch (error) { showError(error); } finally { finish(); }
  }
  const submit = (event: FormEvent) => { event.preventDefault(); void save(fields.status); };
  const pendingCount = queue.filter(item => ["pending", "failed"].includes(item.state) && !blogFileIssue(item.file)).length;

  return <>
    <div className="blog-actions"><Link to="/beheer?type=blog">← Alle berichten</Link>{post?.status === "published" && <Link to={`/blog/${encodeURIComponent(post.slug)}/`}>Publiek bericht bekijken</Link>}</div>
    {errors.length > 0 && <div className="blog-notice blog-notice--error" role="alert" tabIndex={-1} ref={errorRef}><h2>{notFound ? "Bericht niet gevonden" : "Controleer je bericht"}</h2><ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul>{!post && !notFound && <button className="blog-button" onClick={() => setRetry(value => value + 1)}>Opnieuw laden</button>}</div>}
    {message && <p className="blog-notice" role="status">{message}</p>}
    {!post ? !errors.length && <p role="status">Concept laden…</p> : <>
      <div className="blog-editor-status"><span className="blog-badge">Op server: {post.status === "published" ? "Gepubliceerd" : "Concept"}</span><span role="status">{dirty ? "Niet-opgeslagen tekstwijzigingen" : "Tekst opgeslagen"}</span></div>
      <form className="blog-panel blog-form" onSubmit={submit}>
        <fieldset disabled={busy === "save" || busy === "delete"}><legend>Inhoud van je bericht</legend>
          {blogTextFields.filter(key => fields.aiUsed || !["aiContribution", "humanContribution"].includes(key)).map(key => <div className="blog-field" key={key}>
            <label htmlFor={`blog-${key}`}>{fieldHelp[key].label}{key === "planning" ? " (optioneel)" : ""}</label>
            <p id={`blog-${key}-help`} className="blog-muted">{fieldHelp[key].help}</p>
            {key === "title" ? <input id={`blog-${key}`} required aria-describedby={`blog-${key}-help`} value={fields[key]} onChange={event => setFields(current => ({ ...current, [key]: event.target.value }))} /> : <textarea id={`blog-${key}`} aria-describedby={`blog-${key}-help`} rows={key === "summary" ? 2 : 5} value={fields[key]} onChange={event => setFields(current => ({ ...current, [key]: event.target.value }))} />}
          </div>)}
          <label className="blog-checkbox"><input type="checkbox" checked={fields.aiUsed} onChange={event => setFields(current => ({ ...current, aiUsed: event.target.checked }))} /> Ik heb AI gebruikt voor dit project</label>
          <label htmlFor="blog-status">Status bij opslaan</label><select id="blog-status" value={fields.status} onChange={event => setFields(current => ({ ...current, status: event.target.value as BlogStatus }))}><option value="draft">Concept</option><option value="published">Gepubliceerd</option></select>
        </fieldset>
        <p className="blog-muted">Publicatie vereist alle onderdelen behalve planning, een voor- én na-afbeelding en bij AI-gebruik beide bijdragen. Video’s tellen niet als verplichte afbeeldingen.</p>
        <div className="blog-actions"><button className="blog-button" disabled={Boolean(busy)}>{busy === "save" ? "Opslaan…" : "Wijzigingen opslaan"}</button><button type="button" className="blog-button blog-button--quiet" disabled={Boolean(busy)} onClick={() => void save("draft")}>Als concept opslaan</button><button type="button" className="blog-button" disabled={Boolean(busy)} onClick={() => void save("published")}>{post.status === "published" ? "Publicatie bijwerken" : "Publiceren"}</button></div>
      </form>
      <section className="blog-panel blog-form" aria-labelledby="blog-upload-title"><h2 id="blog-upload-title">Foto’s en video’s toevoegen</h2>
        <p>Meerdere bestanden, één voor één geüpload. Maximaal 100 MB per bestand. JPG, PNG, WebP, GIF, AVIF, MP4, WebM en MOV.</p>
        <p className="blog-muted">Stel per bestand eerst de rol, het bijschrift en de credit in. Die metadata kun je na uploaden niet aanpassen; daarvoor moet je het bestand verwijderen en opnieuw uploaden.</p>
        <label htmlFor="blog-files">Bestanden kiezen</label><input id="blog-files" type="file" multiple accept={blogFileAccept} disabled={Boolean(busy)} onChange={addFiles} />
        <ul className="blog-upload-list">{queue.map(item => <li className="blog-upload-item" key={item.key}>
          <strong>{item.file.name}</strong><span>{(item.file.size / 1024 / 1024).toFixed(1)} MB</span>
          <fieldset disabled={Boolean(busy) || item.state === "done" || item.state === "uncertain"}><legend>Metadata voor {item.file.name}</legend>
            <label htmlFor={`role-${item.key}`}>Rol</label><select id={`role-${item.key}`} value={item.role} onChange={event => patchQueue(item.key, { role: event.target.value as MediaRole })}>{Object.entries(mediaRoles).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</select>
            <label htmlFor={`caption-${item.key}`}>Bijschrift (optioneel)</label><input id={`caption-${item.key}`} value={item.caption} onChange={event => patchQueue(item.key, { caption: event.target.value })} />
            <label htmlFor={`credit-${item.key}`}>Maker / credit (optioneel)</label><input id={`credit-${item.key}`} value={item.credit} onChange={event => patchQueue(item.key, { credit: event.target.value })} />
          </fieldset>
          <div role="status">{item.state === "uploading" ? <><progress max="100" value={item.progress} aria-label={`Upload ${item.file.name}`} /><span>{item.progress === 100 ? "Bestand verzonden, server verwerkt…" : `${item.progress}%`}</span></> : item.state === "done" ? "✓ Geüpload" : item.state === "pending" ? "Wacht op upload" : item.error}</div>
          <div className="blog-actions">{item.state === "failed" && !blogFileIssue(item.file) && <button className="blog-button" disabled={Boolean(busy)} onClick={() => void upload([item.key])}>Opnieuw proberen</button>}{item.state === "uncertain" && <><button className="blog-button" disabled={Boolean(busy)} onClick={() => void checkUncertain(item)}>Medialijst vernieuwen</button>{item.checked && <button className="blog-button" disabled={Boolean(busy)} onClick={() => { if (window.confirm("Staat dit bestand nog niet bij de opgeslagen media? Alleen dan opnieuw klaarzetten om dubbele uploads te vermijden.")) patchQueue(item.key, { state: "failed", checked: false, error: "Klaar om opnieuw te proberen." }); }}>Bestand ontbreekt: opnieuw klaarzetten</button>}</>}
            <button className="blog-button blog-button--quiet" disabled={Boolean(busy)} onClick={() => setQueue(current => current.filter(entry => entry.key !== item.key))}>{item.state === "done" ? "Uit uploadlijst halen" : "Bestand uit wachtrij halen"}</button>
          </div>
        </li>)}</ul>
        <button className="blog-button" disabled={Boolean(busy) || !pendingCount} onClick={() => void upload()}>{busy === "upload" ? "Bestanden uploaden…" : `Upload ${pendingCount} bestand${pendingCount === 1 ? "" : "en"}`}</button>
      </section>
      <section className="blog-panel" aria-labelledby="blog-media-title"><h2 id="blog-media-title">Opgeslagen media ({post.media.length})</h2>{post.media.length ? <BlogMediaGallery media={post.media} onRemove={item => void removeMedia(item)} disabled={Boolean(busy)} /> : <p>Nog geen media. Voeg voor publicatie minstens één voor- en één na-afbeelding toe.</p>}</section>
      <section className="blog-panel"><h2>Bericht verwijderen</h2><p>Dit verwijdert ook alle bijbehorende media uit de opslag.</p><button className="blog-button blog-button--danger" disabled={Boolean(busy)} onClick={() => void removePost()}>Bericht definitief verwijderen</button></section>
    </>}
  </>;
}
