/**
 * Validate the static Drive product-image manifest before a catalogue sync.
 *
 * The manifest is intentionally limited to public WebP paths. Catalogue syncs
 * only use filename-derived SKU candidates that occur exactly once, so repeated
 * codes are reported for manual review rather than being guessed.
 */
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildImageCandidates,
  buildImageReviewGroups,
  DRIVE_IMAGE_ROOT,
  PRODUCT_IMAGE_REVIEW_PATH,
  readProductImageManifest,
  readProductImageOverrides,
  validateProductImageOverrides,
} from "./product-image-manifest.js";

function isSafeFolder(folder: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folder);
}

function isSafeWebpFile(file: string): boolean {
  return !file.includes("/") && !file.includes("\\") && file.toLowerCase().endsWith(".webp");
}

function main(): void {
  const manifest = readProductImageManifest();
  const overrides = readProductImageOverrides();
  const candidates = buildImageCandidates(manifest);
  const seenPaths = new Set<string>();
  let images = 0;

  for (const [folder, files] of Object.entries(manifest)) {
    if (!isSafeFolder(folder)) throw new Error(`Unsafe manifest folder: ${folder}`);
    if (!Array.isArray(files)) throw new Error(`Manifest folder must contain an array: ${folder}`);

    for (const file of files) {
      if (!isSafeWebpFile(file)) throw new Error(`Manifest entry must be a public WebP filename: ${folder}/${file}`);
      const assetPath = `${folder}/${file}`;
      if (seenPaths.has(assetPath)) throw new Error(`Duplicate manifest asset path: ${assetPath}`);
      seenPaths.add(assetPath);

      const absolutePath = resolve(DRIVE_IMAGE_ROOT, folder, file);
      if (!absolutePath.startsWith(`${DRIVE_IMAGE_ROOT}/`) || !existsSync(absolutePath)) {
        throw new Error(`Manifest asset is missing: ${assetPath}`);
      }

      images++;
    }
  }

  validateProductImageOverrides(overrides, candidates);
  const ambiguous = [...candidates.entries()].filter(([, paths]) => paths.length > 1);
  const unambiguous = candidates.size - ambiguous.length;
  const reviewGroups = buildImageReviewGroups(manifest, overrides);
  if (process.argv.includes("--write-review")) {
    writeFileSync(
      PRODUCT_IMAGE_REVIEW_PATH,
      `${JSON.stringify({ version: 1, groups: reviewGroups }, null, 2)}\n`,
    );
    console.log(`Wrote ${reviewGroups.length} ambiguous image groups to ${PRODUCT_IMAGE_REVIEW_PATH}`);
  }
  console.log(
    `Validated ${images} Drive WebP assets in ${Object.keys(manifest).length} folders; ` +
    `${unambiguous} unambiguous SKU candidates and ${ambiguous.length} ambiguous codes held for review.`
  );
}

main();