import assert from "node:assert/strict";
import test from "node:test";
import { sourceProductFacets } from "../src/product-facets.js";

test("PTMT series words are not inferred outside the PTMT category", () => {
  const accessory = sourceProductFacets({
    category: "Sanitaryware",
    productName: "Ultra Cascade",
  });
  assert.equal(accessory.series, null);
  assert.equal(accessory.collection, null);

  const ptmt = sourceProductFacets({
    category: "PTMT Faucets",
    productName: "Ultra Cascade",
    deriveKnownPtmtNameFacets: true,
  });
  assert.equal(ptmt.series, "Ultra Series");
});