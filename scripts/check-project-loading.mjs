import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
try {
  const { useProjectQuery, invalidateProjectQueries } = await server.ssrLoadModule("/src/data/projectQueries.ts");
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
  for (const slug of ["la-maison-des-trois-garcons", "find-your-light"]) {
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
  const disabled = readInitialQuery(undefined);
  assert.equal(disabled.isLoading, false);
  assert.equal(disabled.isFetching, false);
  console.log("Project loading checks passed: backend-only, repeat visits, local fallback and disabled query.");
} finally {
  await server.close();
}
