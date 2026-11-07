import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText).toString("base64")}`;
const utils = moduleUrl(await readFile(new URL("../src/utils/blog.ts", import.meta.url), "utf8"));
const apiSource = (await readFile(new URL("../src/data/blogApi.ts", import.meta.url), "utf8"))
  .replace('"../utils/api"', JSON.stringify(moduleUrl('export const apiUrl = "https://test.invalid/api";')))
  .replace('"../utils/adminAuth"', JSON.stringify(moduleUrl('export const getAdminToken = () => "test"; export const clearAdminToken = () => {};')))
  .replace('"../utils/blog"', JSON.stringify(utils));
const { blogApi } = await import(moduleUrl(apiSource));
const { blogFields } = await import(utils);
const fields = blogFields({ title: "Test", mediaLayout: [{ mediaId: "b", section: "context" }, { mediaId: "a", section: "context" }] });
const originalFetch = globalThis.fetch;
let persisted;
let calls;
globalThis.fetch = async (url, options) => {
  calls.push({ url, options });
  return new Response(JSON.stringify(options.method === "PUT" ? fields : persisted), { status: 200 });
};
try {
  for (const layout of [undefined, [], [...fields.mediaLayout].reverse(), [{ mediaId: "b", section: "process" }, fields.mediaLayout[1]]]) {
    persisted = { ...fields, mediaLayout: layout }; calls = [];
    await assert.rejects(blogApi.save("post", fields), /fotoposities niet bewaard/);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].options.cache, "no-store");
  }
  persisted = { ...fields, mediaLayout: fields.mediaLayout.map(item => ({ ...item, _id: "server-id" })) }; calls = [];
  assert.deepEqual(await blogApi.save("post", fields), persisted);
  assert.deepEqual(JSON.parse(calls[0].options.body).mediaLayout, fields.mediaLayout);
  assert.deepEqual(fields.mediaLayout.map(item => item.mediaId), ["b", "a"]);
  for (const heroMediaId of [undefined, "", "other"]) {
    persisted = { ...fields, heroMediaId }; calls = [];
    await assert.rejects(blogApi.save("post", { ...fields, heroMediaId: "hero" }), /hero-afbeelding niet bewaard/);
  }
  persisted = { ...fields, heroMediaId: "hero" }; calls = [];
  assert.equal((await blogApi.save("post", persisted)).heroMediaId, "hero");
  assert.equal(JSON.parse(calls[0].options.body).heroMediaId, "hero");
  persisted = { ...fields, heroMediaId: "" }; calls = [];
  assert.equal((await blogApi.save("post", fields)).heroMediaId, "");
  assert.equal(blogFields({}).heroMediaId, "");
  console.log("PASS hero selection, removal, legacy defaults and silently ignored saves.");
  console.log("PASS save verifies persisted photo order and section; ignored, reordered and missing layouts reject without changing editor input.");
} finally { globalThis.fetch = originalFetch; }
