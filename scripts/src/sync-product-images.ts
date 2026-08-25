/**
 * Reconcile verified Drive photos into the current development catalogue
 * without changing supplier products, pricing, stock, or categories.
 */
import { pool } from "@workspace/db";
import {
  readProductImageManifest,
  readProductImageOverrides,
} from "./product-image-manifest.js";
import {
  buildProductImageIndex,
  syncProductImagesInTransaction,
} from "./product-image-sync.js";

async function main() {
  const manifest = readProductImageManifest();
  const overrides = readProductImageOverrides();
  const imageIndex = buildProductImageIndex(manifest, overrides);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: number; sku: string; image_url: string | null }>(
      "SELECT id, sku, image_url FROM products WHERE in_stock = true",
    );
    const reconciled = await syncProductImagesInTransaction(
      client,
      rows.map(({ id, sku, image_url: imageUrl }) => ({ id, sku, imageUrl })),
      imageIndex,
    );
    await client.query("COMMIT");
    console.log(
      `Reconciled ${reconciled} verified Drive photo sets across ${rows.length} active products ` +
      `(${imageIndex.unambiguous.size} unambiguous codes; ${imageIndex.reviewed.size} reviewed overrides).`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});