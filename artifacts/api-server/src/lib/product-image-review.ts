import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export interface ProductImageCandidate {
  folder: string;
  file: string;
  path: string;
}

export interface ProductImageReviewGroup {
  normalizedCode: string;
  sku: string | null;
  candidates: ProductImageCandidate[];
  reviewedPaths: string[];
}

export interface ProductImageOverrides {
  [sku: string]: string[];
}

function findImageRoot(): string {
  let directory = resolve(import.meta.dirname);
  while (true) {
    const candidate = resolve(directory, "artifacts/prayag/public/images/drive");
    if (existsSync(resolve(candidate, "manifest.json"))) return candidate;

    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  throw new Error("Could not locate the public Drive product image manifest");
}

const imageRoot = findImageRoot();
const manifestPath = resolve(imageRoot, "manifest.json");
const overridesPath = resolve(imageRoot, "product-image-overrides.json");

export function normalizedItemCode(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function isSafeFolder(folder: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folder);
}

function isSafeWebpFile(file: string): boolean {
  return !file.includes("/") && !file.includes("\\") && file.toLowerCase().endsWith(".webp");
}

export function readProductImageManifest(): Record<string, string[]> {
  const manifest = readJsonFile<Record<string, string[]>>(manifestPath);
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Product image manifest must be a JSON object");
  }

  const seenPaths = new Set<string>();
  for (const [folder, files] of Object.entries(manifest)) {
    if (!isSafeFolder(folder)) throw new Error(`Unsafe manifest folder: ${folder}`);
    if (!Array.isArray(files)) throw new Error(`Manifest folder must contain an array: ${folder}`);
    for (const file of files) {
      if (typeof file !== "string" || !isSafeWebpFile(file)) {
        throw new Error(`Manifest entry must be a public WebP filename: ${folder}/${String(file)}`);
      }
      const assetPath = `${folder}/${file}`;
      if (seenPaths.has(assetPath)) throw new Error(`Duplicate manifest asset path: ${assetPath}`);
      seenPaths.add(assetPath);
      const absolutePath = resolve(imageRoot, folder, file);
      if (!absolutePath.startsWith(`${imageRoot}/`) || !existsSync(absolutePath)) {
        throw new Error(`Manifest asset is missing: ${assetPath}`);
      }
    }
  }
  return manifest;
}

export function readProductImageOverrides(): ProductImageOverrides {
  const overrides = readJsonFile<ProductImageOverrides>(overridesPath);
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    throw new Error("Product image overrides must be a JSON object keyed by exact SKU");
  }
  return overrides;
}

export function buildImageCandidates(
  manifest: Record<string, string[]>,
): Map<string, ProductImageCandidate[]> {
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

function overridesForNormalizedCode(overrides: ProductImageOverrides, normalizedCode: string): string[] {
  return Object.entries(overrides)
    .filter(([sku]) => normalizedItemCode(sku) === normalizedCode)
    .flatMap(([, paths]) => paths);
}

function validateOverrides(
  overrides: ProductImageOverrides,
  candidates: Map<string, ProductImageCandidate[]>,
): void {
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

    const seenPaths = new Set<string>();
    for (const path of paths) {
      if (typeof path !== "string" || path.includes("\\") || path.startsWith("/") || path.includes("..")) {
        throw new Error(`Unsafe image override path for ${sku}: ${String(path)}`);
      }
      if (!knownPaths.has(path)) throw new Error(`Image override asset is missing from manifest: ${sku} → ${path}`);
      if (seenPaths.has(path)) throw new Error(`Duplicate image override path for ${sku}: ${path}`);
      seenPaths.add(path);
    }
  }
}

export function buildImageReviewGroups(
  manifest: Record<string, string[]>,
  overrides: ProductImageOverrides,
  skus: string[],
): ProductImageReviewGroup[] {
  const candidates = buildImageCandidates(manifest);
  const skuMatches = new Map<string, string[]>();
  for (const sku of skus) {
    const normalizedCode = normalizedItemCode(sku);
    if (normalizedCode) skuMatches.set(normalizedCode, [...(skuMatches.get(normalizedCode) ?? []), sku]);
  }

  return [...candidates.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([normalizedCode, paths]) => ({
      normalizedCode,
      sku: skuMatches.get(normalizedCode)?.length === 1 ? skuMatches.get(normalizedCode)![0] : null,
      candidates: paths.sort((a, b) => a.path.localeCompare(b.path)),
      reviewedPaths: overridesForNormalizedCode(overrides, normalizedCode),
    }))
    .sort((a, b) => a.normalizedCode.localeCompare(b.normalizedCode, undefined, { numeric: true }));
}

export function readProductImageReview(skus: string[]): { version: number; groups: ProductImageReviewGroup[] } {
  const manifest = readProductImageManifest();
  const overrides = readProductImageOverrides();
  const candidates = buildImageCandidates(manifest);
  validateOverrides(overrides, candidates);
  return { version: 1, groups: buildImageReviewGroups(manifest, overrides, skus) };
}

let writeQueue = Promise.resolve();

export function saveProductImageOverride(sku: string, paths: string[]): Promise<string[]> {
  const operation = writeQueue.then(() => {
    const manifest = readProductImageManifest();
    const candidates = buildImageCandidates(manifest);
    const normalizedCode = normalizedItemCode(sku);
    const candidatePaths = new Set((candidates.get(normalizedCode) ?? []).map((candidate) => candidate.path));

    if (!normalizedCode || (candidates.get(normalizedCode)?.length ?? 0) < 2) {
      throw new Error(`No ambiguous image candidates found for SKU: ${sku}`);
    }
    if (new Set(paths).size !== paths.length || paths.some((path) => !candidatePaths.has(path))) {
      throw new Error(`Every approved image must be an exact candidate path for SKU: ${sku}`);
    }

    const current = readProductImageOverrides();
    validateOverrides(current, candidates);
    const next: ProductImageOverrides = Object.fromEntries(
      Object.entries(current).filter(([currentSku]) => normalizedItemCode(currentSku) !== normalizedCode),
    );
    if (paths.length > 0) next[sku] = paths;
    validateOverrides(next, candidates);

    const temporaryPath = `${overridesPath}.${process.pid}.tmp`;
    writeFileSync(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    renameSync(temporaryPath, overridesPath);
    return paths;
  });
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}