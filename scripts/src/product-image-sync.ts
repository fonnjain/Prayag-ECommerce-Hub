import {
  buildImageCandidates,
  normalizedItemCode,
  type ProductImageManifest,
  type ProductImageOverrides,
  validateProductImageOverrides,
} from "./product-image-manifest.js";

export interface ProductImageIndex {
  unambiguous: Map<string, string[]>;
  reviewed: Map<string, string[]>;
  ambiguousCodes: number;
}

export interface ExistingProductDetailImage {
  imageUrl: string;
  sortOrder: number;
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