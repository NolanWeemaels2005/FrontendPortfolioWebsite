import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
const previousWindow = globalThis.window;
try {
  const { ProjectDetailPage } = await server.ssrLoadModule('/src/pages/ProjectDetailPage.tsx');
  const { LanguageProvider } = await server.ssrLoadModule('/src/i18n/LanguageContext.tsx');
  const { allProjects } = await server.ssrLoadModule('/src/data/projects.ts');
  const { projectStories } = await server.ssrLoadModule("/src/data/projectStories.ts");
  // API-only projects are seeded locally for offline rendering.
  allProjects.push({ slug: "n-wah", title: "N/WAH", color: "#008d45" },
    { slug: "find-your-light", title: "Find Your Light", color: "#000" });
  const { projectCaseStudies } = await server.ssrLoadModule('/src/data/projectCaseStudies.ts');
  const { backendProjectTranslations } = await server.ssrLoadModule('/src/data/backendProjectTranslations.ts');
  for (const [slug, translations] of Object.entries(backendProjectTranslations)) {
    for (const language of ['nl', 'fr', 'en']) {
      assert(translations[language]?.trim(), `${slug}: missing ${language} project description`);
    }
  }
  assert.equal(Object.keys(projectStories).length, Object.keys(projectCaseStudies).length);
  for (const [slug, story] of Object.entries(projectStories)) {
    const indices = [0, ...story.spreads.flatMap(spread => spread.images)];
    assert.equal(new Set(indices).size, story.images.length, `${slug}: repeated or omitted image`);
    assert.equal(indices.length, story.images.length, `${slug}: repeated image`);
    assert(indices.every(index => story.images[index]), `${slug}: invalid spread index`);
    for (const image of story.images) assert(image.src.startsWith('/assets/project-details/'), `${slug}: non-ZIP imagery`);
  }
  for (const language of ['nl', 'fr', 'en']) {
    globalThis.window = { localStorage: { getItem: () => language } };
    for (const project of allProjects) {
      const markup = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [`/portfolio/${project.slug}/`] },
        React.createElement(LanguageProvider, null,
          React.createElement(Routes, null, React.createElement(Route, { path: '/portfolio/:slug/', element: React.createElement(ProjectDetailPage) })))));
      const story = projectStories[projectCaseStudies[project.slug].heroImage];
      if (story) {
        assert(markup.includes("case-gallery"), `${project.slug}: missing curated layout`);
        for (const image of story.images) {
          assert(image.src.startsWith("https://") || existsSync(`public${image.src}`), `${project.slug}: missing artwork`);
          assert(markup.includes(`src="${image.src}"`), `${project.slug}: artwork not rendered`);
          for (const variant of image.srcSet?.split(", ") || []) assert(variant.startsWith("https://") || existsSync(`public${variant.split(" ")[0]}`));
        }
        if (story.video) {
          assert(existsSync(`public${story.video}`));
          assert(markup.includes(`src="${story.video}"`), "BNB animation missing");
          for (const attribute of ["muted", "loop", "playsInline", "controls"]) assert(markup.includes(attribute));
        }
        assert.equal((markup.match(/id="case-work"/g) || []).length, 1, `${project.slug}: duplicate work anchor`);
        assert(markup.indexOf(`src="${story.images[0].src}"`) < markup.indexOf('class="case-meta"'), `${project.slug}: opening image must precede metadata`);
      }
      for (const match of markup.matchAll(/<img[^>]+src="([^"]+)"/g)) {
        assert(match[1].startsWith('/assets/project-details/'), `${project.slug}: unauthorized image ${match[1]}`);
      }
      const recommendations = [...markup.matchAll(/<a\b[^>]*class="case-related__card"[^>]*>/g)].map(match => match[0].match(/href="([^"]+)"/)[1]);
      assert.equal(recommendations.length, 4, `${project.slug}: expected four recommendations`);
      assert.equal(new Set(recommendations).size, 4, `${project.slug}: duplicate recommendations`);
      assert(!recommendations.includes(`/portfolio/${project.slug}/`), `${project.slug}: self recommendation`);
      assert(markup.includes('class="case-intro"'), `${project.slug}: missing project introduction`);
      if (markup.includes('href="#case-story"')) {
        assert(markup.includes('id="case-story"'), `${project.slug}: broken story link`);
      }
      assert(!markup.includes('<figcaption>') && !markup.includes('class="case-index"'), `${project.slug}: decorative counters or captions remain`);
      assert(markup.includes('class="case-meta"'), `${project.slug}: missing project facts`);
      assert(!markup.includes('case.role') && !markup.includes('case.identity'), `${language}: missing translations`);
      assert(!markup.includes('undefined'), `${project.slug}: undefined content`);
      for (const collaborator of projectCaseStudies[project.slug]?.collaborators || []) {
        assert(markup.includes(collaborator), `${project.slug}: missing collaboration credit`);
      }
    }
  }
  assert.equal(projectCaseStudies.ferraaawri.context, 'concept');
  assert.equal(projectCaseStudies['find-your-light'].context, 'concept');
  console.log(`PASS: ${allProjects.length * 3} case renders; localized metadata, collaboration credits and concept labels.`);
} finally {
  globalThis.window = previousWindow;
  await server.close();
}
