import { writeFile } from 'node:fs/promises';

// Only public, published content. A failed refresh must not publish an incomplete sitemap.
const base = (process.env.VITE_API_URL || 'https://backendportfoliowebsite-production.up.railway.app/api').replace(/\/$/, '');
const routes = [];
const seen = new Set();
for (let page = 1, pages = 1; page <= pages; page++) {
  const response = await fetch(`${base}/blog?page=${page}`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Blog SEO refresh failed: HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.posts) || !Number.isInteger(data.pages) || data.pages < 0 || data.pages > 1000) throw new Error('Invalid public blog response');
  pages = data.pages;
  for (const post of data.posts) {
    if (!/^[a-z0-9-]+$/.test(post.slug) || !post.title || !post.summary || !post.publishedAt) throw new Error('Invalid published blog metadata');
    if (seen.has(post.slug)) throw new Error(`Duplicate blog slug: ${post.slug}`);
    seen.add(post.slug);
    routes.push({ path: `/blog/${post.slug}/`, type: 'blog-post', index: true, title: `${post.title} | Nolan Design`, description: post.summary, heading: post.title, intro: post.summary });
  }
}
await writeFile(new URL('../src/data/seoBlogRoutes.json', import.meta.url), `${JSON.stringify(routes, null, 2)}\n`);
console.log(`Refreshed ${routes.length} published blog routes.`);
