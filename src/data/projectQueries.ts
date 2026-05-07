import { useQuery } from "@tanstack/react-query";
import { allProjects, featuredProjects } from "./projects";
import type { Project } from "../types/project";
import { apiUrl } from "../utils/api";

type BackendProject = {
  _id: string;
  title: string;
  slug: string;
  text: string;
  heroImage: string;
  clientLogoSvg?: string | null;
  images: string[];
};

const projectDataVersion = "v10";
const projectOrder = [
  "find your light",
  "fc eisbar",
  "videjo",
  "studio by cas",
  "kaai",
  "mentalite sportswear",
  "ring tv",
  "erasmus hogeschool",
  "shift festival 2026",
  "boit bobby",
  "city to ocean",
  "ferraaawri",
  "la maison des 3 garcons",
  "basisschool nieuwland",
  "happy dancers",
  "poutrel",
];

export const projectQueryKeys = {
  all: ["projects", projectDataVersion, "all"] as const,
  featured: ["projects", projectDataVersion, "featured"] as const,
  combined: ["projects", projectDataVersion, "combined"] as const,
  detail: (slug: string | undefined) => ["projects", projectDataVersion, "detail", slug] as const,
};

const queryOptions = {
  staleTime: 0,
  gcTime: 1000 * 60 * 30,
  refetchOnMount: "always" as const,
  refetchOnReconnect: "always" as const,
  refetchOnWindowFocus: true,
};

function normalizeTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\btrois\b/g, "3")
    .replace(/[._]/g, "")
    .replace(/\s+/g, " ");
}

function projectOrderIndex(project: Project) {
  const normalizedSlug = normalizeTitle(project.slug.replace(/-/g, " "));
  const normalizedTitle = normalizeTitle(project.title);
  const index = projectOrder.findIndex(
    (item) =>
      normalizedSlug === item ||
      normalizedTitle === item ||
      normalizedSlug.startsWith(`${item} `) ||
      normalizedTitle.startsWith(`${item} `),
  );

  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function sortProjects(projects: Project[]) {
  return [...projects].sort((projectA, projectB) => {
    const orderA = projectOrderIndex(projectA);
    const orderB = projectOrderIndex(projectB);
    const isUnknownBackendA = projectA.source === "backend" && !Number.isFinite(orderA);
    const isUnknownBackendB = projectB.source === "backend" && !Number.isFinite(orderB);

    if (isUnknownBackendA && !isUnknownBackendB) return -1;
    if (!isUnknownBackendA && isUnknownBackendB) return 1;

    if (orderA !== orderB) return orderA - orderB;
    if (Number.isFinite(orderA)) return 0;

    if (projectA.source === "backend" && projectB.source !== "backend") return -1;
    if (projectA.source !== "backend" && projectB.source === "backend") return 1;

    return 0;
  });
}

function findLocalProject(project: Pick<Project, "slug" | "title">) {
  const normalizedBackendTitle = normalizeTitle(project.title);

  return getCombinedProjects().find(
    (localProject) => {
      const normalizedLocalTitle = normalizeTitle(localProject.title);

      return (
        localProject.slug === project.slug ||
        project.slug.startsWith(`${localProject.slug}-`) ||
        normalizedLocalTitle === normalizedBackendTitle ||
        normalizedLocalTitle.includes(normalizedBackendTitle) ||
        normalizedBackendTitle.includes(normalizedLocalTitle)
      );
    },
  );
}

function mapBackendProject(project: BackendProject): Project {
  const localProject = findLocalProject(project);
  const isLocalFeaturedProject = Boolean(localProject?.featured);
  const cover = isLocalFeaturedProject ? localProject?.cover || project.heroImage : undefined;
  const logo = isLocalFeaturedProject
    ? project.clientLogoSvg || localProject?.logo || project.heroImage
    : localProject?.logo || project.clientLogoSvg || "";

  return {
    id: project._id,
    title: project.title,
    slug: project.slug,
    layoutSlug: localProject?.layoutSlug || localProject?.slug,
    logo,
    cover,
    color: localProject?.color || "#000",
    featured: localProject?.featured,
    titleKey: localProject?.titleKey,
    summaryKey: localProject?.summaryKey,
    summary: project.text,
    text: project.text,
    heroImage: project.heroImage,
    clientLogoSvg: project.clientLogoSvg || null,
    images: project.images,
    source: "backend",
  };
}

function mergeBackendProjects(backendProjects: Project[], localProjects: Project[]) {
  const backendSlugs = new Set(backendProjects.map((project) => project.slug));
  const backendTitles = new Set(backendProjects.map((project) => normalizeTitle(project.title)));

  return sortProjects([
    ...backendProjects,
    ...localProjects.filter((project) => !backendSlugs.has(project.slug) && !backendTitles.has(normalizeTitle(project.title))),
  ]);
}

async function fetchBackendProjects() {
  try {
    const response = await fetch(`${apiUrl}/projects`, { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    const projects = Array.isArray(data) ? data : Array.isArray(data?.projects) ? data.projects : [];
    return (projects as BackendProject[]).map(mapBackendProject);
  } catch {
    return [];
  }
}

async function fetchBackendProject(slug: string) {
  try {
    const response = await fetch(`${apiUrl}/projects/${slug}`, { cache: "no-store" });
    if (!response.ok) return undefined;
    const data = (await response.json()) as BackendProject;
    return mapBackendProject(data);
  } catch {
    return undefined;
  }
}

export function getCombinedProjects() {
  return sortProjects([
    ...featuredProjects,
    ...allProjects.filter((project) => !featuredProjects.some((item) => item.slug === project.slug)),
  ]);
}

export function useFeaturedProjectsQuery() {
  return useQuery({
    queryKey: projectQueryKeys.featured,
    queryFn: async () => {
      const backendProjects = await fetchBackendProjects();
      const mergedProjects = mergeBackendProjects(backendProjects, featuredProjects);
      return mergedProjects.filter((project) => project.featured || featuredProjects.some((featuredProject) => featuredProject.slug === project.slug));
    },
    initialData: featuredProjects,
    ...queryOptions,
  });
}

export function useAllProjectsQuery() {
  return useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: async () => {
      const backendProjects = await fetchBackendProjects();
      return mergeBackendProjects(backendProjects, allProjects);
    },
    initialData: sortProjects(allProjects),
    ...queryOptions,
  });
}

export function useCombinedProjectsQuery() {
  return useQuery({
    queryKey: projectQueryKeys.combined,
    queryFn: async () => {
      const backendProjects = await fetchBackendProjects();
      const localProjects = getCombinedProjects();
      return mergeBackendProjects(backendProjects, localProjects);
    },
    initialData: getCombinedProjects,
    ...queryOptions,
  });
}

export function useProjectQuery(slug: string | undefined) {
  return useQuery({
    queryKey: projectQueryKeys.detail(slug),
    queryFn: async () => {
      if (!slug) return undefined;
      const localProject = getCombinedProjects().find((project) => project.slug === slug);
      const backendProject = await fetchBackendProject(slug);

      if (backendProject) return backendProject;

      const backendProjects = await fetchBackendProjects();
      const backendProjectFromList = backendProjects.find(
        (project) =>
          project.slug === slug ||
          (localProject && normalizeTitle(project.title) === normalizeTitle(localProject.title)),
      );

      return backendProjectFromList || localProject;
    },
    initialData: () => getCombinedProjects().find((project) => project.slug === slug),
    enabled: Boolean(slug),
    ...queryOptions,
  });
}
