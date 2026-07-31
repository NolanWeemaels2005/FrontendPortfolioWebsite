import { useEffect, useState } from "react";
import { allProjects, featuredProjects } from "./projects";
import { isSiteSettingProject } from "./siteSettings";
import type { Project } from "../types/project";
import { webpImageUrl } from "../utils/asset";
import { apiUrl } from "../utils/api";

type BackendProject = {
  _id: string;
  title: string;
  slug: string;
  text: string;
  textNl?: string;
  textFr?: string;
  textEn?: string;
  summaryNl?: string;
  summaryFr?: string;
  summaryEn?: string;
  translations?: {
    nl?: { text?: string; summary?: string };
    fr?: { text?: string; summary?: string };
    en?: { text?: string; summary?: string };
  };
  heroImage: string;
  clientLogoSvg?: string | null;
  images: string[];
};

const projectDataVersion = "v11";
const fallbackLatestProjectSlug = "shift-festival-2026";
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

type ProjectResource<T> = {
  data: T;
  promise: Promise<T> | null;
  subscribers: Set<() => void>;
};

const projectCache = new Map<string, ProjectResource<unknown>>();

let backendProjectsRequest: Promise<Project[]> | null = null;

function cacheKey(parts: Array<string | undefined>) {
  return [projectDataVersion, ...parts].join(":");
}

function getProjectResource<T>(key: string, placeholderData: T): ProjectResource<T> {
  const existing = projectCache.get(key) as ProjectResource<T> | undefined;
  if (existing) return existing;

  const resource: ProjectResource<T> = {
    data: placeholderData,
    promise: null,
    subscribers: new Set(),
  };
  projectCache.set(key, resource as ProjectResource<unknown>);
  return resource;
}

function useProjectResource<T>(key: string, load: () => Promise<T>, placeholderData: T, enabled = true) {
  const [resource] = useState(() => getProjectResource(key, placeholderData));
  const [data, setData] = useState(resource.data);
  const [isFetching, setIsFetching] = useState(Boolean(enabled && resource.promise));

  useEffect(() => {
    if (!enabled) return;

    const notify = () => {
      setData(resource.data);
      setIsFetching(Boolean(resource.promise));
    };
    resource.subscribers.add(notify);

    if (!resource.promise) {
      resource.promise = load()
        .then((nextData) => {
          resource.data = nextData;
          resource.subscribers.forEach((subscriber) => subscriber());
          return nextData;
        })
        .finally(() => {
          resource.promise = null;
          resource.subscribers.forEach((subscriber) => subscriber());
        });
      setIsFetching(true);
    }

    return () => {
      resource.subscribers.delete(notify);
    };
  }, [enabled, resource]);

  return { data, isLoading: enabled && isFetching && data === undefined, isFetching };
}

export function invalidateProjectQueries() {
  projectCache.clear();
}

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
  const backendHeroImage = webpImageUrl(project.heroImage, 1600);
  const backendLogo = webpImageUrl(project.clientLogoSvg, 900);
  const cover = isLocalFeaturedProject ? localProject?.cover || backendHeroImage : undefined;
  const logo = isLocalFeaturedProject
    ? backendLogo || localProject?.logo || backendHeroImage
    : localProject?.logo || backendLogo || "";

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
    summaryTranslations: {
      nl: project.summaryNl || project.translations?.nl?.summary,
      fr: project.summaryFr || project.translations?.fr?.summary,
      en: project.summaryEn || project.translations?.en?.summary,
    },
    text: project.text,
    textTranslations: {
      nl: project.textNl || project.translations?.nl?.text,
      fr: project.textFr || project.translations?.fr?.text,
      en: project.textEn || project.translations?.en?.text,
    },
    heroImage: backendHeroImage,
    clientLogoSvg: backendLogo || null,
    images: project.images.map((image) => webpImageUrl(image, 1600)),
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
  if (backendProjectsRequest) return backendProjectsRequest;

  backendProjectsRequest = (async () => {
    try {
      const response = await fetch(`${apiUrl}/projects`);
      if (!response.ok) return [];
      const data = await response.json();
      const projects = Array.isArray(data) ? data : Array.isArray(data?.projects) ? data.projects : [];
      return (projects as BackendProject[]).filter((project) => !isSiteSettingProject(project)).map(mapBackendProject);
    } catch {
      return [];
    }
  })();

  try {
    return await backendProjectsRequest;
  } finally {
    backendProjectsRequest = null;
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
  return useProjectResource(
    cacheKey(["featured"]),
    async () => {
      const backendProjects = await fetchBackendProjects();
      const mergedProjects = mergeBackendProjects(backendProjects, featuredProjects);
      return mergedProjects.filter((project) => project.featured || featuredProjects.some((featuredProject) => featuredProject.slug === project.slug));
    },
    featuredProjects,
  );
}

export function useAllProjectsQuery() {
  return useProjectResource(
    cacheKey(["all"]),
    async () => {
      const backendProjects = await fetchBackendProjects();
      return mergeBackendProjects(backendProjects, allProjects);
    },
    sortProjects(allProjects),
  );
}

export function useCombinedProjectsQuery() {
  return useProjectResource(
    cacheKey(["combined"]),
    async () => {
      const backendProjects = await fetchBackendProjects();
      const localProjects = getCombinedProjects();
      return mergeBackendProjects(backendProjects, localProjects);
    },
    getCombinedProjects(),
  );
}

export function getFallbackLatestProject() {
  return getCombinedProjects().find((project) => project.slug === fallbackLatestProjectSlug) || getCombinedProjects()[0];
}

export function useLatestProjectQuery() {
  return useProjectResource(
    cacheKey(["latest"]),
    async () => {
      const backendProjects = await fetchBackendProjects();
      return backendProjects.find((project) => project.logo || project.clientLogoSvg) || getFallbackLatestProject();
    },
    getFallbackLatestProject(),
  );
}

export function useProjectQuery(slug: string | undefined) {
  return useProjectResource(
    cacheKey(["detail", slug]),
    async () => {
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
    getCombinedProjects().find((project) => project.slug === slug),
    Boolean(slug),
  );
}
