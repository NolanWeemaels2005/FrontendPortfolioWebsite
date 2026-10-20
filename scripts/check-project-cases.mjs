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
  const { projectCaseStudies } = await server.ssrLoadModule('/src/data/projectCaseStudies.ts');
  const { backendProjectTranslations } = await server.ssrLoadModule('/src/data/backendProjectTranslations.ts');
  for (const [slug, translations] of Object.entries(backendProjectTranslations)) {
    for (const language of ['nl', 'fr', 'en']) {
      assert(translations[language]?.trim(), `${slug}: missing ${language} project description`);
    }
  }
  for (const [slug, facts] of Object.entries(projectCaseStudies)) {
    assert(facts.heroImage, `${slug}: missing dedicated hero`);
    for (const width of [900, 1800]) {
      assert(existsSync(`public/assets/project-heroes/${facts.heroImage}-${width}.jpg`), `${slug}: missing ${width}px hero`);
    }
  }
  for (const language of ['nl', 'fr', 'en']) {
    globalThis.window = { localStorage: { getItem: () => language } };
    for (const project of allProjects) {
      const markup = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [`/portfolio/${project.slug}/`] },
        React.createElement(LanguageProvider, null,
          React.createElement(Routes, null, React.createElement(Route, { path: '/portfolio/:slug/', element: React.createElement(ProjectDetailPage) })))));
      assert(markup.includes(`/assets/project-heroes/${projectCaseStudies[project.slug].heroImage}-1800.jpg`), `${project.slug}: incorrect hero`);
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
