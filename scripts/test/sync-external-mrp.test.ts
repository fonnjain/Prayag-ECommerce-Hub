import assert from "node:assert/strict";
import { after, test } from "node:test";
import { pool } from "@workspace/db";
import {
  buildProductImageIndex,
  productImageUrls,
  reconcileProductImages,
  syncProductImagesInTransaction,
} from "../src/product-image-sync.js";

after(async () => {
  await pool.end();
});

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

test("sync transaction replaces stale Drive images and preserves curated fixture images", async () => {
  const client = await pool.connect();
  const curatedPrimary = "/images/curated/sync-fixture-primary.webp";
  const curatedDetail = "/images/curated/sync-fixture-detail.webp";
  const staleDriveImage = "/images/drive/sync-fixture-old/P-200.webp";
  const staleDriveImage2 = "/images/drive/sync-fixture-stale/P-200.webp";
  const approvedDriveImage = "/images/drive/sync-fixture-reviewed/P-200.webp";

  try {
    await client.query("BEGIN");

    const { rows: categories } = await client.query<{ id: number }>(
      "SELECT id FROM categories WHERE slug = $1 LIMIT 1",
      ["bathroom-accessories"],
    );
    assert.ok(categories[0], "the fixture needs an existing product category");

    const { rows: products } = await client.query<{ id: number }>(
      `INSERT INTO products
         (name, slug, sku, description, specifications, price, mrp, category_id, image_url, in_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, true)
       RETURNING id`,
      [
        "Sync transaction fixture",
        "sync-transaction-fixture-p-200",
        "P-200",
        "Disposable sync transaction fixture",
        "Item Code: P-200",
        "999.00",
        categories[0].id,
        curatedPrimary,
      ],
    );
    const product = products[0];
    assert.ok(product, "the fixture product should be inserted");

    await client.query(
      `INSERT INTO product_images (product_id, image_url, sort_order)
       VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)`,
      [
        product.id,
        curatedDetail,
        4,
        staleDriveImage,
        5,
        staleDriveImage2,
        6,
      ],
    );

    const imageIndex = buildProductImageIndex(
      {
        "sync-fixture": ["P-200.webp"],
        "sync-fixture-reviewed": ["P-200.webp"],
      },
      {
        "P-200": ["sync-fixture-reviewed/P-200.webp"],
      },
    );
    assert.deepEqual(productImageUrls("P-200", imageIndex), [approvedDriveImage]);

    const reconciled = await syncProductImagesInTransaction(
      client,
      [{ id: product.id, sku: "P-200", imageUrl: curatedPrimary }],
      imageIndex,
    );
    assert.equal(reconciled, 1);

    const { rows: [updatedProduct] } = await client.query<{ image_url: string | null }>(
      "SELECT image_url FROM products WHERE id = $1",
      [product.id],
    );
    assert.equal(updatedProduct.image_url, curatedPrimary);

    const { rows: updatedImages } = await client.query<{ image_url: string; sort_order: number }>(
      `SELECT image_url, sort_order
       FROM product_images
       WHERE product_id = $1
       ORDER BY sort_order, id`,
      [product.id],
    );
    assert.deepEqual(updatedImages, [
      { image_url: curatedDetail, sort_order: 4 },
      { image_url: approvedDriveImage, sort_order: 5 },
    ]);
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }

  const { rows: remainingFixtures } = await pool.query<{ count: string }>(
    "SELECT count(*)::text AS count FROM products WHERE sku = $1",
    ["P-200"],
  );
  assert.equal(remainingFixtures[0].count, "0", "the disposable fixture must not persist");
});