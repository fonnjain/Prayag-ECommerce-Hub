import {
  buildImageCandidates,
  normalizedItemCode,
  type ProductImageManifest,
  type ProductImageOverrides,
  validateProductImageOverrides,
} from "./product-image-manifest.js";
import type { PoolClient } from "@workspace/db";

export interface ProductImageIndex {
  unambiguous: Map<string, string[]>;
  reviewed: Map<string, string[]>;
  ambiguousCodes: number;
}

export interface ExistingProductDetailImage {
  imageUrl: string;
  sortOrder: number;
}

export interface ProductForImageSync {
  id: number;
  sku: string;
  imageUrl: string | null;
}

export interface ProductImageReconciliation {
  primaryImageUrl: string | null;
  preservedDetailImages: ExistingProductDetailImage[];
  driveImageUrls: string[];
}

export function buildProductImageIndex(
  manifest: ProductImageManifest,
  overrides: ProductImageOverrides,
): ProductImageIndex {
  const candidates = buildImageCandidates(manifest);
  validateProductImageOverrides(overrides, candidates);

  const unambiguous = new Map<string, string[]>();
  let ambiguousCodes = 0;
  for (const [key, paths] of candidates.entries()) {
    if (paths.length === 1) {
      unambiguous.set(key, [`/images/drive/${paths[0].path}`]);
    } else {
      ambiguousCodes++;
    }
  }

  const reviewed = new Map<string, string[]>();
  for (const [sku, paths] of Object.entries(overrides)) {
    reviewed.set(sku, paths.map((path) => `/images/drive/${path}`));
  }

  return { unambiguous, reviewed, ambiguousCodes };
}

export function productImageUrls(itemCode: string, index: ProductImageIndex): string[] {
  return index.reviewed.get(itemCode)
    ?? index.unambiguous.get(normalizedItemCode(itemCode))
    ?? [];
}

export function reconcileProductImages(
  primaryImageUrl: string | null,
  currentDetailImages: ExistingProductDetailImage[],
  desiredImageUrls: string[],
): ProductImageReconciliation {
  const preservedDetailImages = currentDetailImages.filter((image) => !image.imageUrl.startsWith("/images/drive/"));
  const hasDrivePrimary = primaryImageUrl?.startsWith("/images/drive/") ?? false;
  const drivePrimaryIsManaged = primaryImageUrl === null || hasDrivePrimary;

  return {
    primaryImageUrl: drivePrimaryIsManaged ? desiredImageUrls[0] ?? null : primaryImageUrl,
    preservedDetailImages,
    driveImageUrls: drivePrimaryIsManaged ? desiredImageUrls.slice(1) : desiredImageUrls,
  };
}

/**
 * Reconcile Drive-managed product images using an already-open sync transaction.
 *
 * Keeping the transaction ownership with the caller lets the catalogue sync
 * commit product, price, and image changes atomically. It also lets tests run
 * this exact SQL against disposable fixtures and roll the whole transaction
 * back without changing the development catalogue.
 */
export async function syncProductImagesInTransaction(
  client: PoolClient,
  productsForImages: ProductForImageSync[],
  imageIndex: ProductImageIndex,
): Promise<number> {
  const imageProductIds = productsForImages.map((product) => product.id);
  const { rows: currentDetailImages } = imageProductIds.length > 0
    ? await client.query<{ product_id: number; image_url: string; sort_order: number }>(
        `SELECT product_id, image_url, sort_order
         FROM product_images
         WHERE product_id = ANY($1::int[])
         ORDER BY product_id, sort_order, id`,
        [imageProductIds],
      )
    : { rows: [] };
  const detailImagesByProduct = new Map<number, Array<{ imageUrl: string; sortOrder: number }>>();
  for (const image of currentDetailImages) {
    detailImagesByProduct.set(image.product_id, [
      ...(detailImagesByProduct.get(image.product_id) ?? []),
      { imageUrl: image.image_url, sortOrder: image.sort_order },
    ]);
  }

  let productsWithReconciledImages = 0;
  for (const product of productsForImages) {
    const desired = productImageUrls(product.sku, imageIndex);
    const currentDetails = detailImagesByProduct.get(product.id) ?? [];
    const reconciliation = reconcileProductImages(product.imageUrl, currentDetails, desired);
    const currentDriveDetails = currentDetails.filter((image) => image.imageUrl.startsWith("/images/drive/"));
    if (
      product.imageUrl === reconciliation.primaryImageUrl &&
      currentDriveDetails.length === reconciliation.driveImageUrls.length &&
      currentDriveDetails.every((image, index) => image.imageUrl === reconciliation.driveImageUrls[index])
    ) continue;

    await client.query(
      "UPDATE products SET image_url = $1, updated_at = now() WHERE id = $2",
      [reconciliation.primaryImageUrl, product.id],
    );
    await client.query(
      "DELETE FROM product_images WHERE product_id = $1 AND image_url LIKE '/images/drive/%'",
      [product.id],
    );
    const nextSortOrder = Math.max(0, ...reconciliation.preservedDetailImages.map((image) => image.sortOrder));
    for (const [sortOrder, imageUrl] of reconciliation.driveImageUrls.entries()) {
      await client.query(
        "INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, $3)",
        [product.id, imageUrl, nextSortOrder + sortOrder + 1],
      );
    }
    productsWithReconciledImages++;
  }

  return productsWithReconciledImages;
}