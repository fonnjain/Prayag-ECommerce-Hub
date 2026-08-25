import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildProductImageIndex,
  productImageUrls,
  reconcileProductImages,
} from "../src/product-image-sync.js";

test("exact photo approval preserves curated primary and detail images", () => {
  const index = buildProductImageIndex(
    {
      "ptmt-faucets": ["P-100.webp"],
      "ptmt-faucets-alt": ["P-100.webp"],
    },
    {
      "P-100": ["ptmt-faucets-alt/P-100.webp"],
    },
  );

  const approvedImageUrls = productImageUrls("P-100", index);
  assert.deepEqual(approvedImageUrls, ["/images/drive/ptmt-faucets-alt/P-100.webp"]);

  const reconciliation = reconcileProductImages(
    "/images/curated/p-100-primary.webp",
    [
      { imageUrl: "/images/curated/p-100-detail.webp", sortOrder: 4 },
      { imageUrl: "/images/drive/ptmt-faucets/P-100.webp", sortOrder: 5 },
      { imageUrl: "/images/drive/legacy/P-100.webp", sortOrder: 6 },
    ],
    approvedImageUrls,
  );

  assert.equal(reconciliation.primaryImageUrl, "/images/curated/p-100-primary.webp");
  assert.deepEqual(reconciliation.preservedDetailImages, [
    { imageUrl: "/images/curated/p-100-detail.webp", sortOrder: 4 },
  ]);
  assert.deepEqual(reconciliation.driveImageUrls, [
    "/images/drive/ptmt-faucets-alt/P-100.webp",
  ]);
});