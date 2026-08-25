/**
 * Validate the static Drive product-image manifest before a catalogue sync.
 *
 * The manifest is intentionally limited to public WebP paths. Catalogue syncs
 * only use filename-derived SKU candidates that occur exactly once, so repeated
 * codes are reported for manual review rather than being guessed.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type ProductImageManifest = Record<string, string[]>;

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DRIVE_IMAGE_ROOT = resolve(PROJECT_ROOT, "artifacts/prayag/public/images/drive");
const MANIFEST_PATH = resolve(DRIVE_IMAGE_ROOT, "manifest.json");

function normalizedItemCode(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSafeFolder(folder: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folder);
}

function isSafeWebpFile(file: string): boolean {
  return !file.includes("/") && !file.includes("\\") && file.toLowerCase().endsWith(".webp");
}

function main(): void {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as ProductImageManifest;
  const candidates = new Map<string, string[]>();
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

      const key = normalizedItemCode(file.replace(/\.webp$/i, ""));
      if (key) candidates.set(key, [...(candidates.get(key) ?? []), assetPath]);
      images++;
    }
  }

  const ambiguous = [...candidates.entries()].filter(([, paths]) => paths.length > 1);
  const unambiguous = candidates.size - ambiguous.length;
  console.log(
    `Validated ${images} Drive WebP assets in ${Object.keys(manifest).length} folders; ` +
    `${unambiguous} unambiguous SKU candidates and ${ambiguous.length} ambiguous codes held for review.`
  );
}

main();