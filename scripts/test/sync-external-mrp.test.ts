import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { pool } from "@workspace/db";
import {
  buildProductImageIndex,
  productImageUrls,
  reconcileProductImages,
  syncProductImagesInTransaction,
} from "../src/product-image-sync.js";
import {
  runCatalogueSyncTransaction,
  type PrayagProduct,
} from "../src/sync-external-mrp.js";

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

test("failed catalogue sync rolls back product, visibility, and image changes", async () => {
  const client = await pool.connect();
  const fixtureToken = randomUUID().slice(0, 8);
  const activeSku = `SYNC-ROLLBACK-A-${fixtureToken}`;
  const hiddenSku = `SYNC-ROLLBACK-H-${fixtureToken}`;
  const activeSlug = `sync-rollback-active-${fixtureToken}`;
  const hiddenSlug = `sync-rollback-hidden-${fixtureToken}`;
  const activePrimary = `/images/drive/rollback-fixture-old/${activeSku}.webp`;
  const activeStaleDetail = `/images/drive/rollback-fixture-old/${activeSku}-detail.webp`;
  const approvedPrimary = `/images/drive/rollback-fixture-reviewed/${activeSku}.webp`;
  let fixtureCommitted = false;

  try {
    await client.query("BEGIN");
    const { rows: categories } = await client.query<{ id: number }>(
      "SELECT id FROM categories WHERE slug = $1 LIMIT 1",
      ["bathroom-accessories"],
    );
    assert.ok(categories[0], "the fixture needs an existing product category");

    const { rows: products } = await client.query<{ id: number }>(
      `INSERT INTO products
         (name, slug, sku, description, specifications, price, mrp, category_id, image_url, in_stock, is_featured, is_new)
       VALUES
         ($1, $2, $3, $4, $5, $6, $6, $7, $8, true, true, false),
         ($9, $10, $11, $12, $13, $14, $14, $7, NULL, true, false, true)
       RETURNING id`,
      [
        "Rollback fixture before update",
        activeSlug,
        activeSku,
        "Disposable active rollback fixture",
        "Item Code: active fixture",
        "111.00",
        categories[0].id,
        activePrimary,
        "Rollback fixture to hide",
        hiddenSlug,
        hiddenSku,
        "Disposable hidden rollback fixture",
        "Item Code: hidden fixture",
        "222.00",
      ],
    );
    const activeProduct = products[0];
    const hiddenProduct = products[1];
    assert.ok(activeProduct && hiddenProduct, "both fixture products should be inserted");

    await client.query(
      `INSERT INTO product_images (product_id, image_url, sort_order)
       VALUES ($1, $2, $3), ($1, $4, $5)`,
      [activeProduct.id, activeStaleDetail, 3, "/images/curated/rollback-fixture-detail.webp", 4],
    );
    await client.query(
      `INSERT INTO product_images (product_id, image_url, sort_order)
       VALUES ($1, $2, $3)`,
      [hiddenProduct.id, "/images/curated/rollback-hidden-detail.webp", 2],
    );
    await client.query("COMMIT");
    fixtureCommitted = true;

    const beforeProducts = await client.query(
      `SELECT id, sku, name, slug, description, specifications, price, mrp, category_id,
              image_url, in_stock, is_featured, is_new, updated_at
       FROM products
       WHERE id = ANY($1::int[])
       ORDER BY id`,
      [[activeProduct.id, hiddenProduct.id]],
    );
    const beforeImages = await client.query(
      `SELECT id, product_id, image_url, sort_order
       FROM product_images
       WHERE product_id = ANY($1::int[])
       ORDER BY product_id, sort_order, id`,
      [[activeProduct.id, hiddenProduct.id]],
    );

    const imageIndex = buildProductImageIndex(
      {
        "rollback-fixture": [`${activeSku}.webp`],
        "rollback-fixture-reviewed": [`${activeSku}.webp`],
      },
      {
        [activeSku]: [`rollback-fixture-reviewed/${activeSku}.webp`],
      },
    );
    const feed: PrayagProduct[] = [{
      itemCode: activeSku,
      productName: "Rollback fixture updated",
      division: "Hardware",
      category: "Bathroom Accessory",
      seriesRange: null,
      size: null,
      uom: "PCS",
      isActive: true,
      hasPrice: true,
      currentMrp: 987.65,
      currentBasis: "MRP",
      effectiveDate: "2026-09-01",
    }];

    await assert.rejects(
      runCatalogueSyncTransaction({
        feed,
        categoryBySlug: new Map([["bathroom-accessories", categories[0].id]]),
        fallbackCategory: categories[0].id,
        local: [
          { id: activeProduct.id, sku: activeSku, slug: activeSlug, in_stock: true },
          { id: hiddenProduct.id, sku: hiddenSku, slug: hiddenSlug, in_stock: true },
        ],
        imageIndex,
        imageProductIds: [activeProduct.id, hiddenProduct.id],
        failAfterImageSync: new Error("controlled failure after image SQL"),
        client,
      }),
      /controlled failure after image SQL/,
    );

    const afterProducts = await client.query(
      `SELECT id, sku, name, slug, description, specifications, price, mrp, category_id,
              image_url, in_stock, is_featured, is_new, updated_at
       FROM products
       WHERE id = ANY($1::int[])
       ORDER BY id`,
      [[activeProduct.id, hiddenProduct.id]],
    );
    const afterImages = await client.query(
      `SELECT id, product_id, image_url, sort_order
       FROM product_images
       WHERE product_id = ANY($1::int[])
       ORDER BY product_id, sort_order, id`,
      [[activeProduct.id, hiddenProduct.id]],
    );
    assert.deepEqual(afterProducts.rows, beforeProducts.rows);
    assert.deepEqual(afterImages.rows, beforeImages.rows);
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    if (fixtureCommitted) {
      await client.query("BEGIN");
      await client.query("DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE sku IN ($1, $2))", [activeSku, hiddenSku]);
      await client.query("DELETE FROM products WHERE sku IN ($1, $2)", [activeSku, hiddenSku]);
      await client.query("COMMIT");
    }
    client.release();
  }
});