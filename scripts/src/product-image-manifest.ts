import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type ProductImageManifest = Record<string, string[]>;
export type ProductImageOverrides = Record<string, string[]>;

export interface ProductImageCandidate {
  folder: string;
  file: string;
  path: string;
}

export interface ProductImageReviewGroup {
  normalizedCode: string;
  candidates: ProductImageCandidate[];
  reviewedPaths: string[];
}

export const PROJECT_ROOT = resolve(import.meta.dirname, "../..");
export const DRIVE_IMAGE_ROOT = resolve(PROJECT_ROOT, "artifacts/prayag/public/images/drive");
export const PRODUCT_IMAGE_MANIFEST_PATH = resolve(DRIVE_IMAGE_ROOT, "manifest.json");
export const PRODUCT_IMAGE_OVERRIDES_PATH = resolve(DRIVE_IMAGE_ROOT, "product-image-overrides.json");
export const PRODUCT_IMAGE_REVIEW_PATH = resolve(DRIVE_IMAGE_ROOT, "ambiguous-image-review.json");

export function normalizedItemCode(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function readProductImageManifest(): ProductImageManifest {
  return JSON.parse(readFileSync(PRODUCT_IMAGE_MANIFEST_PATH, "utf8")) as ProductImageManifest;
}

export function readProductImageOverrides(): ProductImageOverrides {
  return JSON.parse(readFileSync(PRODUCT_IMAGE_OVERRIDES_PATH, "utf8")) as ProductImageOverrides;
}

export function buildImageCandidates(manifest: ProductImageManifest): Map<string, ProductImageCandidate[]> {
  const candidates = new Map<string, ProductImageCandidate[]>();
  for (const [folder, files] of Object.entries(manifest)) {
    for (const file of files) {
      const normalizedCode = normalizedItemCode(file.replace(/\.[^.]+$/, ""));
      if (!normalizedCode) continue;
      const candidate = { folder, file, path: `${folder}/${file}` };
      candidates.set(normalizedCode, [...(candidates.get(normalizedCode) ?? []), candidate]);
    }
  }
  return candidates;
}

export function buildImageReviewGroups(
  manifest: ProductImageManifest,
  overrides: ProductImageOverrides,
): ProductImageReviewGroup[] {
  const candidates = buildImageCandidates(manifest);
  return [...candidates.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([normalizedCode, paths]) => ({
      normalizedCode,
      candidates: paths.sort((a, b) => a.path.localeCompare(b.path)),
      reviewedPaths: overridesForNormalizedCode(overrides, normalizedCode),
    }))
    .sort((a, b) => a.normalizedCode.localeCompare(b.normalizedCode, undefined, { numeric: true }));
}

export function overridesForNormalizedCode(
  overrides: ProductImageOverrides,
  normalizedCode: string,
): string[] {
  return Object.entries(overrides)
    .filter(([sku]) => normalizedItemCode(sku) === normalizedCode)
    .flatMap(([, paths]) => paths);
}

export function validateProductImageOverrides(
  overrides: ProductImageOverrides,
  candidates: Map<string, ProductImageCandidate[]>,
): void {
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    throw new Error("Product image overrides must be a JSON object keyed by exact SKU");
  }
  const seenCodes = new Set<string>();
  const knownPaths = new Set([...candidates.values()].flat().map((candidate) => candidate.path));

  for (const [sku, paths] of Object.entries(overrides)) {
    const normalizedCode = normalizedItemCode(sku);
    if (!normalizedCode) throw new Error(`Image override SKU must contain letters or numbers: ${sku}`);
    if (seenCodes.has(normalizedCode)) throw new Error(`Duplicate normalized image override SKU: ${sku}`);
    seenCodes.add(normalizedCode);
    if (!Array.isArray(paths) || paths.length === 0) {
      throw new Error(`Image override must contain at least one asset path: ${sku}`);
    }

    const seenOverridePaths = new Set<string>();
    for (const path of paths) {
      if (typeof path !== "string" || path.includes("\\") || path.startsWith("/") || path.includes("..")) {
        throw new Error(`Unsafe image override path for ${sku}: ${String(path)}`);
      }
      if (!knownPaths.has(path)) throw new Error(`Image override asset is missing from manifest: ${sku} → ${path}`);
      if (seenOverridePaths.has(path)) throw new Error(`Duplicate image override path for ${sku}: ${path}`);
      seenOverridePaths.add(path);
    }
  }
}