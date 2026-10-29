import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/utils/projectRevealLayout.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { projectRevealLayout } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const viewports = [[280, 568], [361, 852], [736, 390], [768, 1024], [1280, 720], [1920, 1080], [2560, 1440]];
for (const [width, height] of viewports) {
  for (const count of [6, 17, 18, 25]) {
    const positions = projectRevealLayout(count, width, height);
    assert.equal(positions.length, count);
    // Every row must use the same column centres, including incomplete rows.
    const columns = [...new Set(positions.map(p => p.x))].sort((a, b) => a - b);
    if (columns.length > 2) {
      const step = columns[1] - columns[0];
      for (let i = 2; i < columns.length; i++) assert(Math.abs(columns[i] - columns[i - 1] - step) < 0.001);
    }
    const exclusion = { left: width * .48, right: width * .94, top: height * .82, bottom: height * .98 };
    const reserved = projectRevealLayout(count, width, height, exclusion);
    assert.equal(reserved.length, count);
    for (const p of reserved) {
      const halfWidth = p.width / 2, halfHeight = p.width / .82 * .54;
      assert(p.x + halfWidth <= exclusion.left || p.x - halfWidth >= exclusion.right || p.y + halfHeight <= exclusion.top || p.y - halfHeight >= exclusion.bottom);
    }
    const boxes = positions.map(p => ({ left: p.x - p.width / 2, right: p.x + p.width / 2, top: p.y - p.width / 0.82 / 2, bottom: p.y + p.width / 0.82 / 2 }));
    for (const [index, box] of boxes.entries()) {
      assert(box.left >= 0 && box.top >= 0 && box.right <= width && box.bottom <= height, `Card outside ${width}×${height}`);
      for (const other of boxes.slice(index + 1)) {
        assert(box.right <= other.left || other.right <= box.left || box.bottom <= other.top || other.bottom <= box.top, `Overlapping cards in ${width}×${height}`);
      }
    }
    if (count === 17) {
      assert(Math.min(...boxes.map(p => p.left)) < width * 0.2);
      assert(Math.max(...boxes.map(p => p.right)) > width * 0.8);
      assert(Math.min(...boxes.map(p => p.top)) < height * 0.2);
      assert(Math.max(...boxes.map(p => p.bottom)) > height * 0.8);
    }
  }
}
assert.deepEqual(projectRevealLayout(0, 393, 852), []);
assert.deepEqual(projectRevealLayout(17, 0, 0), []);
console.log("PASS: 28 layouts; all projects have separate spaces, stay within bounds and cover the full section.");
