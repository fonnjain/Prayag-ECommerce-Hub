import assert from "node:assert/strict";
import test from "node:test";
import { shouldReturnFacetGroup } from "../src/lib/facet-visibility.js";

test("hides sparse dynamic facet groups even when they have multiple values", () => {
  assert.equal(shouldReturnFacetGroup({
    category: "bathroom-accessories",
    key: "series",
    valueCount: 2,
    populatedProductCount: 4,
    totalProducts: 495,
  }), false);
});

test("retains verified sparse PTMT taxonomy groups", () => {
  assert.equal(shouldReturnFacetGroup({
    category: "ptmt-faucets",
    key: "series",
    valueCount: 7,
    populatedProductCount: 143,
    totalProducts: 2084,
  }), true);
});

test("omits a group with only one selectable value", () => {
  assert.equal(shouldReturnFacetGroup({
    category: "ptmt-faucets",
    key: "series",
    valueCount: 1,
    populatedProductCount: 143,
    totalProducts: 2084,
  }), false);
});