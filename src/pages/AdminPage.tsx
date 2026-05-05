import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
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
  heroSvg: File | null;
  images: File[];
};

type EditableProject = {
  _id?: string;
  title: string;
  slug: string;
  text?: string;
  heroImage?: string;
  clientLogoSvg?: string | null;
  images?: string[];
};

export function AdminPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const editSlug = new URLSearchParams(location.search).get("project");
  const [token, setTokenState] = useState(() => getAdminToken());
  const [editingProject, setEditingProject] = useState<EditableProject | null>(null);
  const [login, setLogin] = useState<LoginState>({ email: "", password: "" });
  const [project, setProject] = useState<ProjectFormState>({
    title: "",
    text: "",
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
      setProject({ title: "", text: "", heroSvg: null, images: [] });
      setEditingProject(null);
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.featured });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.combined });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(editingProject?.slug || editSlug || undefined) });
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
      const fallbackCover = assetPath("assets/project-covers/coverKAAI.png");
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
          <p>API: {apiUrl}</p>
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
              {submitting ? "Bezig..." : "Inloggen"}
            </button>
          </form>
        ) : (
          <form className="admin-panel admin-form" onSubmit={handleCreateProject}>
            <div className="admin-toolbar">
              <strong>Ingelogd</strong>
              <div className="admin-toolbar__actions">
                <button type="button" onClick={handleUploadLocalProjects} disabled={migrating || submitting}>
                  {migrating ? "Uploaden..." : "Upload lokale projecten"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAdminToken();
                    setTokenState("");
                  }}
                >
                  Uitloggen
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
                onChange={(event) => setProject((current) => ({ ...current, text: event.target.value }))}
                required
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

            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Opslaan..." : editingProject ? "Project bijwerken" : "Project toevoegen"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
