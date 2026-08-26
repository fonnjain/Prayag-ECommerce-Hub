import assert from "node:assert/strict";
import test from "node:test";
import { ptmtOfficialFilters, selectedPtmtFilterSkus } from "../src/lib/ptmtOfficialFilters";

function allOfficialSkus() {
  return new Set(
    Object.values(ptmtOfficialFilters)
      .flatMap((group) => Object.values(group))
      .flat(),
  );
}

test("official PTMT filter inventory retains every paginated old-website code", () => {
  const skus = allOfficialSkus();

  // The official PTMT filters were crawled page by page. This count includes
  // the old site’s Shower item, whose card exposes item code 181 via its image.
  assert.equal(skus.size, 138);
  for (const sku of ["147-RQ", "1375-U", "181"]) {
    assert.ok(skus.has(sku), `missing official PTMT item code ${sku}`);
  }
});

test("old-website PTMT mappings preserve exact source filter membership", () => {
  assert.deepEqual(selectedPtmtFilterSkus("series", "Ovian Series"), [
    "121-R", "123-R", "124-R", "129-R", "130-R", "130-RN", "133-R",
    "134-R", "135-R", "1375-R", "144-R", "145-R", "147-R", "147-RQ", "400-R",
  ]);
  assert.deepEqual(selectedPtmtFilterSkus("series", "Ultra Series"), [
    "123-U", "124-U", "129-U", "130-U", "132-U", "133-U", "134-U",
    "135-U", "144-U", "145-U", "1375-U",
  ]);
  assert.deepEqual(selectedPtmtFilterSkus("type", "Shower"), ["181"]);
  assert.deepEqual(selectedPtmtFilterSkus("type", "Pillar Cock"), [
    "121-L", "123-L", "124-L", "129-L", "130", "130-D", "130-H", "130-L",
    "130-R", "130-U", "131", "131-H", "131-L", "131-N", "1311-H", "132-L",
    "133-L", "1375-R", "144-L", "147", "147-D", "147-HQ", "147-L", "147-LQ",
    "147-RQ", "147-SQ", "400-R",
  ]);
});