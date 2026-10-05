import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(new URL("../src/utils/blog.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { blogFields, publicationIssues, blogFileIssue, blogMaxUploadBytes, blogApiBase, httpLink } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
let checks = 0;
function check(name, run) { run(); checks++; console.log(`PASS ${name}`); }
const complete = blogFields({ title: "Titel", summary: "Samenvatting", context: "Context", process: "Proces", learning: "Inzicht", reflection: "Feedback", sources: "https://example.com", status: "published" });
const media = [{ _id: "1", type: "image", role: "before" }, { _id: "2", type: "image", role: "after" }];
check("API base adds /api once", () => {
  for (const [input, output] of [["/api", "/api/blog"], ["/api/", "/api/blog"], ["https://example.com", "https://example.com/api/blog"], ["https://example.com/api/", "https://example.com/api/blog"]]) assert.equal(blogApiBase(input), output);
});
check("title-only drafts remain incomplete but editable", () => {
  const draft = blogFields({ title: "Eerste concept" }); assert.equal(draft.status, "draft"); assert.equal(draft.context, ""); assert(publicationIssues(draft, []).length > 0);
});
check("complete text and before/after images allow publication without planning", () => assert.deepEqual(publicationIssues(complete, media), []));
check("all seven required text fields reject whitespace", () => {
  for (const field of ["title", "summary", "context", "process", "learning", "reflection", "sources"]) assert(publicationIssues({ ...complete, [field]: " \n " }, media).length > 0);
});
check("videos never satisfy mandatory before/after images", () => {
  assert.equal(publicationIssues(complete, media.map(item => ({ ...item, type: "video" }))).length, 2);
  assert.equal(publicationIssues(complete, [media[0], { ...media[1], type: "video" }]).length, 1);
});
check("both AI contributions required only when AI is used", () => {
  assert(publicationIssues({ ...complete, aiUsed: true }, media).length);
  assert(publicationIssues({ ...complete, aiUsed: true, aiContribution: "AI" }, media).length);
  assert.deepEqual(publicationIssues({ ...complete, aiUsed: true, aiContribution: "AI", humanContribution: "Eigen werk" }, media), []);
});
check("required media deletion detected, alternative image allowed", () => {
  assert(publicationIssues(complete, [media[0]]).length);
  assert.deepEqual(publicationIssues(complete, [...media, { ...media[0], _id: "3" }].filter(item => item._id !== "1")), []);
});
check("save payload excludes server media and immutable slug", () => {
  const fields = blogFields({ ...complete, media, slug: "stable", _id: "id" });
  assert(!("media" in fields)); assert(!("slug" in fields)); assert(!("_id" in fields)); assert.equal(typeof fields.aiUsed, "boolean");
});
check("100 MB boundary and empty file validation", () => {
  assert.equal(blogFileIssue({ name: "image.jpg", type: "image/jpeg", size: blogMaxUploadBytes }), "");
  assert(blogFileIssue({ name: "image.jpg", type: "image/jpeg", size: blogMaxUploadBytes + 1 }));
  assert(blogFileIssue({ name: "image.jpg", type: "image/jpeg", size: 0 }));
});
check("all supported types accepted, SVG and disguised executables rejected", () => {
  for (const [ext, type] of [["jpg", "image/jpeg"], ["png", "image/png"], ["webp", "image/webp"], ["gif", "image/gif"], ["avif", "image/avif"], ["mp4", "video/mp4"], ["webm", "video/webm"], ["mov", "video/quicktime"]]) assert.equal(blogFileIssue({ name: `media.${ext}`, type, size: 100 }), "");
  assert.equal(blogFileIssue({ name: "MEDIA.MOV", type: "", size: 100 }), "");
  assert(blogFileIssue({ name: "script.svg", type: "image/svg+xml", size: 100 }));
  assert(blogFileIssue({ name: "image.jpg", type: "application/x-msdownload", size: 100 }));
});
check("only absolute HTTP(S) source links are enabled", () => {
  assert.equal(httpLink("https://example.com/path?q=1"), "https://example.com/path?q=1");
  for (const value of ["javascript:alert(1)", "data:text/html,test", "//evil.test", "/relative", "<script>"]) assert.equal(httpLink(value), null);
});
console.log(`${checks} blog checks passed.`);
