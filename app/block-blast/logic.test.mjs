// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { SIZE, emptyGrid, canPlace, fitsAnywhere, place } from "./logic.ts";

const bar = { shape: [[0, 0], [0, 1], [0, 2], [0, 3]], color: "x" };

test("canPlace respects edges and filled cells", () => {
  const g = emptyGrid();
  assert.ok(canPlace(g, bar.shape, 0, 4));
  assert.ok(!canPlace(g, bar.shape, 0, 5));
  g[2] = "x";
  assert.ok(!canPlace(g, bar.shape, 0, 0));
});

test("full row and column blast together", () => {
  let g = emptyGrid();
  for (let c = 0; c < 4; c++) g[c] = "x"; // row 0: cols 0-3
  for (let r = 1; r < SIZE; r++) g[r * SIZE + 7] = "x"; // col 7: rows 1-7
  const res = place(g, bar, 0, 4); // fills row 0 and col 7
  assert.equal(res.points, 4 + 2 * 2 * 10);
  assert.equal(res.blasted.length, SIZE * 2 - 1);
  assert.ok(res.grid.every((cell) => cell === null));
});

test("fitsAnywhere is false on a full board", () => {
  const g = emptyGrid().fill("x");
  assert.ok(!fitsAnywhere(g, [[0, 0]]));
});
