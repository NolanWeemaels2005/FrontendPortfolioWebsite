# Project detail case studies

The detail-page presentation lives in `src/pages/ProjectDetailPage.tsx`,
`src/data/projectStories.ts`, and `src/styles/project-case.css`. Every style
selector is rooted at `.project-case`. Shared project data, thumbnails, shell,
fonts, tokens, and non-project routes are unchanged by this task.

`projectStories.ts` defines each project's hero, descriptive alt text, and ordered
full-width and compact paired spreads. Paired column widths follow image aspect ratios so row edges align without cropping. The lightbox follows that same
reading order. Short projects remain short. Existing descriptions, services,
years, contexts, translations, and collaborators remain the source of truth.

## Media provenance

`src/data/projectCaseAssets.json` maps every retained archive file to its project, original
SHA-256, dimensions, and responsive output paths. All generated files live under
`public/assets/project-details/`; nothing overwrites existing preview assets.
There are 83 retained source images and two videos, across 18 projects. The City To Ocean
image6 app view is omitted from the presentation in favour of the similar image8.
The original ZIP is read only.

The only media references outside that directory are the unchanged original
`assets/hall-of-fame/bnb-logo.webm` and `assets/hall-of-fame/fc-eisbar-logo.webm`.
Videjo and Ring TV videos are byte-for-byte copies from the ZIP. Video sources
retain their original timing; the existing CaseMotion player pauses offscreen
and respects reduced motion. Posters also come from the ZIP.

To rebuild optimized media, install Pillow into a temporary Python environment,
then run `python scripts/project-cases/prepare-assets.py '/path/to/images for projects.zip'`.
The pipeline emits WebP at up to 800, 1600 and 2400 pixels wide, without upscaling,
and preserves aspect ratios. Source hashes make the mapping auditable.

## Verification performed

- Production build, TypeScript and SEO audit pass.
- `node scripts/check-project-cases.mjs`: all 18 projects in three languages
  (54 renders), all curated images, variants, animation files, metadata,
  collaborators, anchor targets, and four unique random project recommendations (excluding the current project).
- Project loading and layout scripts pass, including existing aliases.
- All 245 retained responsive image variants checked for dimensions and aspect ratios.
- All detail stylesheet selectors checked for `.project-case` scoping.
- SHA-256 comparison against the working tree at task start: all 379 existing
  files outside the three detail implementation files and their test unchanged.
  Pre-existing unrelated working-tree edits were preserved.
- N/WAH desktop screenshot reviewed in Chrome. Lightbox opening, ArrowRight
  navigation, Escape closing and initial focus verified through native UI.
- Mobile visual review and comprehensive before/after screenshot comparisons
  were not completed: browser connector unavailable; native screenshot timed
  out and concurrent user browser activity prevented continued automation.
  Responsive CSS stacks all images and recommendation cards at 768px and adapts the header at 1024px,
  but this is not a substitute for completing visual review on devices.

No deployment or changes to the live website were performed.
