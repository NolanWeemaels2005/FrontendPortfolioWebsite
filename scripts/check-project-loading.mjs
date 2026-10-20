import assert from "node:assert/strict";
import React from "react";
import { existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
try {
  const { useProjectQuery, invalidateProjectQueries, selectFeaturedProjects, getCombinedProjects } = await server.ssrLoadModule("/src/data/projectQueries.ts");
  const { featuredProjects } = await server.ssrLoadModule("/src/data/projects.ts");
  function readInitialQuery(slug) {
    let result;
    function Probe() {
      result = useProjectQuery(slug);
      return null;
    }
    renderToStaticMarkup(React.createElement(Probe));
    return result;
  }

  // Backend-only projects must not look missing before their effect starts fetching.
  for (const slug of ["a-backend-only-project", "find-your-light"]) {
    invalidateProjectQueries();
    for (let visit = 0; visit < 2; visit += 1) {
      const query = readInitialQuery(slug);
      assert.equal(query.data, undefined);
      assert.equal(query.isLoading, true, `${slug} must wait for its first response`);
      assert.equal(query.isFetching, true);
    }
  }

  const localProject = readInitialQuery("brussel-noord-basket");
  assert.equal(localProject.data.slug, "brussel-noord-basket");
  assert.equal(localProject.isLoading, false, "Local content stays visible during refresh");
  const maison = readInitialQuery("la-maison-des-trois-garcons");
  assert.equal(maison.data.hallOfFame.key, "maison");
  assert.equal(maison.isLoading, false, "La Maison is now available offline too");

  assert.deepEqual(featuredProjects.map((project) => project.hallOfFame.key), [
    "bnb", "shift", "cto", "videjo", "ferraawri", "erasmus", "eisbar", "maison",
  ]);
  const alternateSlugs = [
    "b-n-b", "shift-festival", "city-2-ocean", "videjo", "ferraawri",
    "erasmushogeschool-brussel", "fc-eisbär", "la-maison-des-3-garcons",
  ];
  const backendProjects = featuredProjects.map((project, index) => ({
    ...project,
    id: `backend-${index}`,
    slug: alternateSlugs[index],
    source: "backend",
    cover: "/backend-image.jpg",
    logo: "",
    hallOfFame: undefined,
  }));
  backendProjects.unshift({ ...backendProjects[1], id: "shift-old", slug: "shift-festival-2025", title: "Shift Festival 2025" });
  backendProjects.push({ ...backendProjects[0], slug: "another-featured-project", title: "Another featured project" });
  const featured = selectFeaturedProjects(backendProjects);
  assert.equal(featured.length, 8, "Aliases and API feature flags cannot add cards");
  assert.equal(new Set(featured.map((project) => project.hallOfFame.key)).size, 8);
  for (const [index, project] of featured.entries()) {
    assert.equal(project.id, `backend-${index}`, "A known alias resolves to the correct API project");
    assert.equal(project.slug, alternateSlugs[index], "API detail routes stay intact");
    assert.equal(project.cover, featuredProjects[index].cover, "Curated covers survive the API merge");
    assert.deepEqual(project.hallOfFame, featuredProjects[index].hallOfFame);
    for (const asset of [project.logo, project.cover, project.hallOfFame.video, ...(project.hallOfFame.slides || [])].filter(Boolean)) {
      assert.ok(asset.startsWith("/assets/"), `${asset} must work without a remote API`);
      assert.ok(existsSync(`public${asset}`), `Missing local asset: ${asset}`);
    }
  }
  assert.ok(getCombinedProjects().some((project) => project.slug === "ring-tv"));
  assert.ok(getCombinedProjects().some((project) => project.slug === "mentalite-sportswear"));
  assert.deepEqual(selectFeaturedProjects([]), featuredProjects, "Network failure preserves the complete selection");

  const disabled = readInitialQuery(undefined);
  assert.equal(disabled.isLoading, false);
  assert.equal(disabled.isFetching, false);
  console.log("Project checks passed: loading, local fallback, eight unique featured projects, aliases, metadata and local assets.");
} finally {
  await server.close();
}
