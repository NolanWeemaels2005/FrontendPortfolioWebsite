import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ButtonTextStagger } from "../components/ButtonTextStagger";
import { getCombinedProjects, projectQueryKeys } from "../data/projectQueries";
import { apiUrl, readApiError } from "../utils/api";
import { clearAdminToken, getAdminToken, setAdminToken } from "../utils/adminAuth";
import { assetPath } from "../utils/asset";

type LoginState = {
  email: string;
  password: string;
};

type ProjectFormState = {
  title: string;
  text: string;
  textNl: string;
  textFr: string;
  textEn: string;
  heroSvg: File | null;
  images: File[];
};

type EditableProject = {
  _id?: string;
  title: string;
  slug: string;
  text?: string;
  textNl?: string;
  textFr?: string;
  textEn?: string;
  heroImage?: string;
  clientLogoSvg?: string | null;
  images?: string[];
};

export function AdminPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const editSlug = new URLSearchParams(location.search).get("project");
  const [token, setTokenState] = useState(() => getAdminToken());
  const [editingProject, setEditingProject] = useState<EditableProject | null>(null);
  const [login, setLogin] = useState<LoginState>({ email: "", password: "" });
  const [project, setProject] = useState<ProjectFormState>({
    title: "",
    text: "",
    textNl: "",
    textFr: "",
    textEn: "",
    heroSvg: null,
    images: [],
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const selectedImages = useMemo(() => project.images.map((file) => file.name).join(", "), [project.images]);

  useEffect(() => {
    const updateLoginState = () => setTokenState(getAdminToken());
    window.addEventListener("admin-auth-change", updateLoginState);
    return () => window.removeEventListener("admin-auth-change", updateLoginState);
  }, []);

  useEffect(() => {
    if (!token || !editSlug) {
      setEditingProject(null);
      return;
    }

    let cancelled = false;

    async function loadProjectForEdit() {
      setError("");
      setStatus("");

      try {
        const response = await fetch(`${apiUrl}/projects/${editSlug}`);

        if (response.ok) {
          const data = (await response.json()) as EditableProject;
          if (cancelled) return;
          setEditingProject(data);
          setProject({
            title: data.title,
            text: data.text || "",
            textNl: data.textNl || data.text || "",
            textFr: data.textFr || "",
            textEn: data.textEn || "",
            heroSvg: null,
            images: [],
          });
          return;
        }

        const localProject = getCombinedProjects().find((item) => item.slug === editSlug);
        if (!localProject) {
          throw new Error(await readApiError(response));
        }

        if (cancelled) return;
        setEditingProject({
          title: localProject.title,
          slug: localProject.slug,
          text: localProject.summary || "",
          heroImage: localProject.cover,
          clientLogoSvg: localProject.logo,
          images: localProject.cover ? [localProject.cover, localProject.cover, localProject.cover] : [],
        });
        setProject({
          title: localProject.title,
          text: localProject.summary || "",
          textNl: localProject.summary || "",
          textFr: "",
          textEn: "",
          heroSvg: null,
          images: [],
        });
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Project laden mislukt.");
        }
      }
    }

    loadProjectForEdit();

    return () => {
      cancelled = true;
    };
  }, [editSlug, token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = (await response.json()) as { token: string };
      setAdminToken(data.token);
      setTokenState(data.token);
      setStatus("Je bent ingelogd.");
      setLogin({ email: "", password: "" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login mislukt.");
    } finally {
      setSubmitting(false);
    }
  }

  function invalidateProjectData(slug?: string) {
    queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: projectQueryKeys.featured });
    queryClient.invalidateQueries({ queryKey: projectQueryKeys.combined });
    queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(slug || editSlug || undefined) });
  }

  function handleCloseEdit() {
    setEditingProject(null);
    setProject({ title: "", text: "", textNl: "", textFr: "", textEn: "", heroSvg: null, images: [] });
    setError("");
    setStatus("Bewerken geannuleerd.");
    navigate("/beheer", { replace: true });
  }

  async function handleDeleteProject() {
    if (!token) {
      setError("Je bent niet ingelogd.");
      return;
    }

    if (!editingProject?._id) {
      setError("Dit project staat niet als backend-project klaar om te verwijderen.");
      return;
    }

    const confirmed = window.confirm(`Project "${editingProject.title}" definitief verwijderen?`);
    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch(`${apiUrl}/projects/${editingProject._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const deletedSlug = editingProject.slug;
      setEditingProject(null);
      setProject({ title: "", text: "", textNl: "", textFr: "", textEn: "", heroSvg: null, images: [] });
      invalidateProjectData(deletedSlug);
      setStatus("Project is verwijderd.");
      navigate("/beheer", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Project verwijderen mislukt.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      if (!token) throw new Error("Je bent niet ingelogd.");
      const formData = await createProjectFormData();

      if (editingProject?._id) {
        const deleteResponse = await fetch(`${apiUrl}/projects/${editingProject._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!deleteResponse.ok) {
          throw new Error(await readApiError(deleteResponse));
        }
      }

      const response = await fetch(`${apiUrl}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      setStatus(editingProject ? "Project is bijgewerkt." : "Project is toegevoegd.");
      setProject({ title: "", text: "", textNl: "", textFr: "", textEn: "", heroSvg: null, images: [] });
      setEditingProject(null);
      invalidateProjectData(editingProject?.slug);
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Project toevoegen mislukt.");
    } finally {
      setSubmitting(false);
    }
  }

  async function createProjectFormData() {
    if (!project.heroSvg && !editingProject?.clientLogoSvg) {
      throw new Error("Upload een SVG/logo.");
    }

    if (project.images.length !== 3 && (editingProject?.images?.length || 0) !== 3) {
      throw new Error("Upload exact 3 foto's.");
    }

    const selectedImagesForUpload =
      project.images.length === 3
        ? project.images
        : await Promise.all((editingProject?.images || []).map((image, index) => fileFromUrl(image, `${editingProject?.slug || "project"}-${index + 1}.jpg`)));
    const logoFile =
      project.heroSvg ||
      (editingProject?.clientLogoSvg
        ? await fileFromUrl(editingProject.clientLogoSvg, `${editingProject.slug || "project"}-logo.svg`)
        : null);

    if (!logoFile) throw new Error("Upload een SVG/logo.");

    const editingTitle = editingProject?.title || project.title;
    const localProject = getCombinedProjects().find(
      (item) =>
        item.slug === editingProject?.slug ||
        item.slug === editSlug ||
        item.title.trim().toLowerCase() === editingTitle.trim().toLowerCase(),
    );
    const heroFile = localProject?.cover
      ? await fileFromUrl(localProject.cover, `${localProject.slug || "project"}-hero.png`)
      : selectedImagesForUpload[0];

    const formData = new FormData();
    formData.append("title", project.title);
    formData.append("text", project.text);
    formData.append("textNl", project.textNl || project.text);
    formData.append("textFr", project.textFr);
    formData.append("textEn", project.textEn);
    formData.append("heroImage", heroFile);
    formData.append("clientLogoSvg", logoFile);
    selectedImagesForUpload.forEach((image) => formData.append("images", image));

    return formData;
  }

  async function fileFromUrl(url: string, filename: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Asset ophalen mislukt: ${filename}`);
    }

    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || "image/png" });
  }

  async function handleUploadLocalProjects() {
    setMigrating(true);
    setError("");
    setStatus("");

    try {
      if (!token) throw new Error("Je bent niet ingelogd.");

      const existingResponse = await fetch(`${apiUrl}/projects`);
      if (!existingResponse.ok) {
        throw new Error(await readApiError(existingResponse));
      }

      const existingProjects = (await existingResponse.json()) as Array<{ slug: string }>;
      const existingSlugs = new Set(existingProjects.map((projectItem) => projectItem.slug));
      const localProjects = getCombinedProjects();
      const fallbackCover = assetPath("assets/project-covers/coverKAAI.webp");
      let uploaded = 0;
      let skipped = 0;

      for (const localProject of localProjects) {
        if (existingSlugs.has(localProject.slug)) {
          skipped += 1;
          continue;
        }

        const coverUrl = localProject.cover || fallbackCover;
        const heroFile = await fileFromUrl(coverUrl, `${localProject.slug || "project"}-hero.png`);
        const imageFile = await fileFromUrl(coverUrl, `${localProject.slug || "project"}-image.png`);
        const logoFile = await fileFromUrl(localProject.logo, `${localProject.slug || "project"}-logo.svg`);
        const formData = new FormData();

        formData.append("title", localProject.title);
        formData.append("text", localProject.summary || "Project uit de bestaande portfolio.");
        formData.append("heroImage", heroFile);
        formData.append("clientLogoSvg", logoFile);
        formData.append("images", imageFile);
        formData.append("images", imageFile);
        formData.append("images", imageFile);

        const response = await fetch(`${apiUrl}/projects`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`${localProject.title}: ${await readApiError(response)}`);
        }

        uploaded += 1;
      }

      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.featured });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.combined });
      getCombinedProjects().forEach((project) => {
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(project.slug) });
      });
      setStatus(`${uploaded} projecten geupload. ${skipped} projecten stonden al in de database.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Lokale projecten uploaden mislukt.");
    } finally {
      setMigrating(false);
    }
  }

  return (
    <section className="admin-page section-black">
      <div className="section-container admin-shell">
        <div className="admin-heading">
          <p className="eyebrow">Beheer</p>
          <h1>{editingProject ? "Project bewerken" : "Projecten toevoegen"}</h1>
          
        </div>

        {status ? <p className="admin-message admin-message--success">{status}</p> : null}
        {error ? <p className="admin-message admin-message--error">{error}</p> : null}

        {!token ? (
          <form className="admin-panel admin-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={login.email}
                onChange={(event) => setLogin((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Wachtwoord
              <input
                type="password"
                value={login.password}
                onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              <ButtonTextStagger text={submitting ? "Bezig..." : "Inloggen"} />
            </button>
          </form>
        ) : (
          <form className="admin-panel admin-form" onSubmit={handleCreateProject}>
            <div className="admin-toolbar">
              <strong>Ingelogd</strong>
              <div className="admin-toolbar__actions">
                <button type="button" onClick={handleUploadLocalProjects} disabled={migrating || submitting}>
                  <ButtonTextStagger text={migrating ? "Uploaden..." : "Upload lokale projecten"} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAdminToken();
                    setTokenState("");
                  }}
                >
                  <ButtonTextStagger text="Uitloggen" />
                </button>
              </div>
            </div>

            <label>
              Naam
              <input
                type="text"
                value={project.title}
                onChange={(event) => setProject((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>

            <label>
              Tekst
              <textarea
                value={project.text}
                onChange={(event) => {
                  const nextText = event.target.value;
                  setProject((current) => ({ ...current, text: nextText, textNl: current.textNl || nextText }));
                }}
                required
              />
            </label>

            <label>
              Beschrijving NL
              <textarea
                value={project.textNl}
                onChange={(event) => setProject((current) => ({ ...current, textNl: event.target.value }))}
                required
              />
            </label>

            <label>
              Beschrijving FR
              <textarea
                value={project.textFr}
                onChange={(event) => setProject((current) => ({ ...current, textFr: event.target.value }))}
                placeholder="Franse beschrijving"
              />
            </label>

            <label>
              Beschrijving EN
              <textarea
                value={project.textEn}
                onChange={(event) => setProject((current) => ({ ...current, textEn: event.target.value }))}
                placeholder="Engelse beschrijving"
              />
            </label>

            <label>
              SVG/logo
              <input
                type="file"
                accept=".svg,image/svg+xml"
                onChange={(event) => setProject((current) => ({ ...current, heroSvg: event.target.files?.[0] || null }))}
                required={!editingProject?.clientLogoSvg}
              />
              <span>{editingProject?.clientLogoSvg && !project.heroSvg ? "Huidige SVG blijft behouden als je niets kiest." : "Upload een SVG voor dit project."}</span>
            </label>

            <label>
              3 foto's
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setProject((current) => ({ ...current, images: Array.from(event.target.files || []).slice(0, 3) }))
                }
                required={!editingProject?.images?.length}
              />
              <span>
                {selectedImages ||
                  (editingProject?.images?.length === 3
                    ? "Huidige 3 foto's blijven behouden als je niets kiest."
                    : "Nog geen foto's gekozen.")}
              </span>
            </label>

            <div className="admin-form__actions">
              {editingProject ? (
                <>
                  <button type="button" className="admin-action admin-action--ghost" onClick={handleCloseEdit} disabled={submitting}>
                    <ButtonTextStagger text="Close" />
                  </button>
                  <button type="button" className="admin-action admin-action--danger" onClick={handleDeleteProject} disabled={submitting || !editingProject._id}>
                    <ButtonTextStagger text="Verwijder project" />
                  </button>
                </>
              ) : null}
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                <ButtonTextStagger text={submitting ? "Opslaan..." : editingProject ? "Project bijwerken" : "Project toevoegen"} />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
