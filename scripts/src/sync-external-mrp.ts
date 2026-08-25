/**
 * Safe PRAYAG catalogue and MRP synchronisation.
 *
 * Uses only the stable Prayag /api/v1/products feed and its currentMrp field.
 * It never calls the competitor comparison API and never uses currentNet.
 *
 * Before 01 Sep 2026, the approved 01 Sep MRP is intentionally applied early.
 * On and after that date, the sync follows the MRP effective for the current
 * India date. Set PRAYAG_MRP_AS_OF=YYYY-MM-DD only for a deliberate override.
 *
 * Sanitaryware variant note: the variant price sheet contains separate Ivory,
 * White-with-Jet, and Pink/Green/Blue prices, but the source app currently
 * stores one MRP per item code (the White price). Those colour prices cannot be
 * imported into the website until the source app exposes variant pricing or
 * creates variant item codes, as it does for sink variants such as -D/-DM.
 */
import { db, pool, productsTable, categoriesTable } from "@workspace/db";
import { buildShortProductName } from "./product-name.js";
import {
  buildImageCandidates,
  normalizedItemCode,
  readProductImageManifest,
  readProductImageOverrides,
  validateProductImageOverrides,
} from "./product-image-manifest.js";

const API_BASE = "https://prayag-competition-analysis.replit.app/api/v1";
const KEY = process.env.PRAYAG_COMP_KEY;
const APPROVED_ROLLOUT_DATE = "2026-09-01";
const PAGE_SIZE = 200;

if (!KEY) throw new Error("PRAYAG_COMP_KEY is required");

interface PrayagProduct {
  itemCode: string;
  productName: string | null;
  division: string | null;
  category: string | null;
  seriesRange: string | null;
  size: string | null;
  uom: string | null;
  isActive: boolean;
  hasPrice: boolean;
  currentMrp: number | null;
  currentBasis: string | null;
  effectiveDate: string | null;
}

const DIVISION_TO_CATEGORY_SLUG: Record<string, string> = {
  "PTMT & Plastic Fittings": "ptmt-faucets",
  "CP Fittings / Faucets": "cp-faucets",
  "Ceramic Sanitaryware": "sanitaryware",
  "Pipes & Fittings": "pipes-fittings",
  "Hardware": "bathroom-accessories",
};

function categorySlugForProduct(product: PrayagProduct): string | undefined {
  const productText = [product.productName, product.category, product.seriesRange].filter(Boolean).join(" ");
  if (/^WT-/i.test(product.itemCode.trim()) || /\bwater\s+tanks?\b/i.test(productText)) {
    return "storage-tanks";
  }
  return DIVISION_TO_CATEGORY_SLUG[product.division ?? ""];
}

function indiaDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (kind: string) => parts.find((part) => part.type === kind)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function selectedAsOf(): string {
  const override = process.env.PRAYAG_MRP_AS_OF;
  if (override && !/^\d{4}-\d{2}-\d{2}$/.test(override)) {
    throw new Error("PRAYAG_MRP_AS_OF must use YYYY-MM-DD");
  }
  return override ?? (indiaDate() < APPROVED_ROLLOUT_DATE ? APPROVED_ROLLOUT_DATE : indiaDate());
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function loadProductImageIndex(): { unambiguous: Map<string, string[]>; reviewed: Map<string, string[]> } {
  const manifest = readProductImageManifest();
  const overrides = readProductImageOverrides();
  const candidates = buildImageCandidates(manifest);
  validateProductImageOverrides(overrides, candidates);

  const unambiguous = new Map<string, string[]>();
  let ambiguousCodes = 0;
  for (const [key, paths] of candidates.entries()) {
    // A repeated filename can be a colour variation, but it can also be an
    // unrelated asset from a different range. Without an explicit reviewed
    // association, only a one-to-one SKU/file match is safe to publish.
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

  console.log(
    `Loaded ${unambiguous.size} unambiguous product-photo codes; skipped ${ambiguousCodes} ambiguous manifest codes; ` +
    `applied ${reviewed.size} exact-SKU reviewed overrides.`,
  );
  return { unambiguous, reviewed };
}

const PRODUCT_IMAGE_INDEX = loadProductImageIndex();

function productImageUrls(itemCode: string): string[] {
  return PRODUCT_IMAGE_INDEX.reviewed.get(itemCode)
    ?? PRODUCT_IMAGE_INDEX.unambiguous.get(normalizedItemCode(itemCode))
    ?? [];
}

function buildName(row: PrayagProduct): string | null {
  return buildShortProductName(row);
}

function fallbackName(row: PrayagProduct): string {
  const division = row.division?.split("|")[0]?.trim();
  return `PRAYAG ${division || "Product"} ${row.itemCode}`;
}

function specifications(row: PrayagProduct): string {
  return [
    row.division ? `Division: ${row.division}` : null,
    row.category ? `Category: ${row.category}` : null,
    row.seriesRange ? `Series: ${row.seriesRange}` : null,
    row.size ? `Size: ${row.size}` : null,
    row.uom ? `UOM: ${row.uom}` : null,
    `Item Code: ${row.itemCode}`,
  ].filter(Boolean).join("\n");
}

async function fetchCompleteFeed(asOf: string | null): Promise<PrayagProduct[]> {
  const rows: PrayagProduct[] = [];
  let expectedTotal: number | undefined;

  for (let page = 1; ; page++) {
    const url = new URL(`${API_BASE}/products`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(PAGE_SIZE));
    if (asOf) url.searchParams.set("asOf", asOf);
    const response = await fetch(url, { headers: { "X-API-Key": KEY! } });
    if (!response.ok) throw new Error(`Prayag products API returned ${response.status} on page ${page}`);
    const data = await response.json() as { rows?: PrayagProduct[]; total?: number; pageSize?: number };
    if (!Array.isArray(data.rows) || typeof data.total !== "number" || !Number.isInteger(data.total) || data.total < 1) {
      throw new Error(`Prayag products API returned an invalid page ${page}`);
    }
    if (expectedTotal !== undefined && expectedTotal !== data.total) {
      throw new Error(`Prayag products API total changed mid-sync (${expectedTotal} → ${data.total})`);
    }
    expectedTotal = data.total;
    rows.push(...data.rows);
    if (rows.length >= data.total) break;
    if (data.rows.length === 0) throw new Error(`Prayag products API ended early at ${rows.length}/${data.total}`);
  }

  if (rows.length !== expectedTotal) throw new Error(`Prayag products API is incomplete (${rows.length}/${expectedTotal})`);
  return rows;
}

function validateFeed(rows: PrayagProduct[], asOf: string): PrayagProduct[] {
  const invalid: string[] = [];
  const seen = new Set<string>();
  const active: PrayagProduct[] = [];

  for (const row of rows) {
    const code = row.itemCode?.trim();
    if (!code || seen.has(code)) {
      invalid.push(`duplicate/missing item code: ${code || "(blank)"}`);
      continue;
    }
    seen.add(code);
    if (!row.isActive) continue;
    if (!row.hasPrice || row.currentBasis !== "MRP" || row.currentMrp == null || row.currentMrp <= 0) {
      invalid.push(`${code}: expected active Prayag MRP`);
      continue;
    }
    active.push({ ...row, itemCode: code });
  }

  if (invalid.length > 0) throw new Error(`Prayag MRP feed failed validation for ${invalid.length} rows (${invalid.slice(0, 5).join("; ")})`);
  if (active.length === 0) throw new Error("Prayag MRP feed has no active products");
  console.log(`Validated ${active.length}/${rows.length} active Prayag MRP products as of ${asOf}`);
  return active;
}

async function main() {
  const asOf = selectedAsOf();
  console.log(`[${new Date().toISOString()}] Fetching Prayag MRP feed as of ${asOf}...`);
  const asOfRows = await fetchCompleteFeed(asOf);
  // Quirk in the source API: some newly added item codes (e.g. the -D/-DM sink
  // variants added Mar 2026) are returned by the default (no-asOf) query but are
  // absent from an explicit future-dated asOf query, even though their effective
  // date is in the past. Merge in any code the dated snapshot misses, taking its
  // current price from the default snapshot.
  const defaultRows = await fetchCompleteFeed(null);
  const seenCodes = new Set(asOfRows.map((r) => r.itemCode?.trim()));
  const merged = [...asOfRows];
  for (const row of defaultRows) {
    const code = row.itemCode?.trim();
    if (code && !seenCodes.has(code)) {
      seenCodes.add(code);
      merged.push(row);
      console.log(`merged code missing from asOf snapshot: ${code} (MRP ${row.currentMrp}, effective ${row.effectiveDate})`);
    }
  }
  const feed = validateFeed(merged, asOf);

  const categories = await db.select().from(categoriesTable);
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const fallbackCategory = categoryBySlug.get("bathroom-accessories") ?? categories[0]?.id;
  if (!fallbackCategory) throw new Error("No product category exists for Prayag catalogue sync");

  const { rows: local } = await pool.query<{ id: number; sku: string; slug: string; in_stock: boolean }>(
    "SELECT id, sku, slug, in_stock FROM products"
  );
  const localBySku = new Map(local.map((row) => [row.sku, row]));
  const activeCodes = new Set(feed.map((row) => row.itemCode));
  const missingIds = local.filter((row) => row.in_stock && !activeCodes.has(row.sku)).map((row) => row.id);

  // Refuse a feed that would unexpectedly remove most of the visible catalogue.
  if (missingIds.length > local.length / 2 && feed.length < local.length / 2) {
    throw new Error(`Refusing unsafe feed: ${feed.length} active rows versus ${local.length} local rows`);
  }

  // Assign every slug up front in JS so unique-constraint collisions cannot
  // happen mid-transaction. Slugs of rows we are NOT renaming stay reserved;
  // renamed/inserted rows pick the first free "-2", "-3", ... suffix.
  const renamedIds = new Set<number>();
  for (const row of feed) {
    const existing = localBySku.get(row.itemCode);
    if (existing && buildName(row)) renamedIds.add(existing.id);
  }
  const reserved = new Set<string>();
  for (const row of local) {
    if (!renamedIds.has(row.id)) reserved.add(row.slug);
  }
  const claimSlug = (base: string): string => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      if (!reserved.has(candidate)) {
        reserved.add(candidate);
        return candidate;
      }
    }
    throw new Error(`Slug space exhausted for ${base}`);
  };

  let updated = 0;
  let inserted = 0;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const row of feed) {
      const apiName = buildName(row);
      const name = apiName ?? fallbackName(row);
      const mrp = row.currentMrp!.toFixed(2);
      const categoryId = categoryBySlug.get(categorySlugForProduct(row) ?? "") ?? fallbackCategory;
      const existing = localBySku.get(row.itemCode);

      if (existing) {
        if (apiName) {
          const slug = claimSlug(`${slugify(name)}-${slugify(row.itemCode)}`);
          await client.query(
            `UPDATE products
             SET name = $1, slug = $2, description = $3, specifications = $4,
                 price = $5, mrp = $5, category_id = $6, in_stock = true, updated_at = now()
             WHERE id = $7`,
            [name, slug, `${name} — genuine PRAYAG product.`, specifications(row), mrp, categoryId, existing.id]
          );
        } else {
          // Feed has no name for this code — refresh price/category but keep
          // the existing display name/slug instead of a placeholder.
          reserved.add(existing.slug);
          await client.query(
            `UPDATE products
             SET specifications = $1, price = $2, mrp = $2, category_id = $3, in_stock = true, updated_at = now()
             WHERE id = $4`,
            [specifications(row), mrp, categoryId, existing.id]
          );
        }
        updated++;
      } else {
        const slug = claimSlug(`${slugify(name)}-${slugify(row.itemCode)}`);
        await client.query(
          `INSERT INTO products (name, slug, sku, description, specifications, price, mrp, category_id, image_url, in_stock)
           VALUES ($1, $2, $3, $4, $5, $6, $6, $7, NULL, true)`,
          [name, slug, row.itemCode, `${name} — genuine PRAYAG product.`, specifications(row), mrp, categoryId]
        );
        inserted++;
      }
    }

    if (missingIds.length > 0) {
      await client.query(
        "UPDATE products SET in_stock = false, is_featured = false, is_new = false, updated_at = now() WHERE id = ANY($1::int[])",
        [missingIds]
      );
    }

    // The Drive manifest contains real catalogue photos named with their Prayag
    // item code. Product pages use these exact matches; the public Gallery is
    // reserved for a separate curated photoshoot collection.
    //
    // Do not replace manually managed product imagery. Drive-managed images
    // are reconciled on every sync, so a later approval replacement/removal
    // changes only the images this sync previously published.
    const { rows: productsForImages } = await client.query<{ id: number; sku: string; image_url: string | null }>(
      "SELECT id, sku, image_url FROM products WHERE in_stock = true",
    );
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
      const desired = productImageUrls(product.sku);
      const currentDetails = detailImagesByProduct.get(product.id) ?? [];
      const driveDetails = currentDetails.filter((image) => image.imageUrl.startsWith("/images/drive/"));
      const manualDetails = currentDetails.filter((image) => !image.imageUrl.startsWith("/images/drive/"));
      const hasDrivePrimary = product.image_url?.startsWith("/images/drive/") ?? false;
      const nextPrimary = product.image_url === null || hasDrivePrimary ? desired[0] ?? null : product.image_url;
      const nextDriveDetails = product.image_url === null || hasDrivePrimary ? desired.slice(1) : desired;
      if (
        product.image_url === nextPrimary &&
        driveDetails.length === nextDriveDetails.length &&
        driveDetails.every((image, index) => image.imageUrl === nextDriveDetails[index])
      ) continue;

      await client.query(
        "UPDATE products SET image_url = $1, updated_at = now() WHERE id = $2",
        [nextPrimary, product.id],
      );
      await client.query(
        "DELETE FROM product_images WHERE product_id = $1 AND image_url LIKE '/images/drive/%'",
        [product.id],
      );
      const nextSortOrder = Math.max(0, ...manualDetails.map((image) => image.sortOrder));
      for (const [sortOrder, imageUrl] of nextDriveDetails.entries()) {
        await client.query(
          "INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, $3)",
          [product.id, imageUrl, nextSortOrder + sortOrder + 1],
        );
      }
      productsWithReconciledImages++;
    }

    await client.query("UPDATE products SET is_featured = false, is_new = false WHERE in_stock = true");
    await client.query("UPDATE products SET is_featured = true WHERE id IN (SELECT id FROM products WHERE in_stock = true ORDER BY mrp::numeric DESC LIMIT 12)");
    await client.query("UPDATE products SET is_new = true WHERE id IN (SELECT id FROM products WHERE in_stock = true ORDER BY updated_at DESC, id DESC LIMIT 12)");

    const { rows: [summary] } = await client.query<{ total: string; active: string }>(
      "SELECT count(*)::text AS total, count(*) FILTER (WHERE in_stock)::text AS active FROM products"
    );
    if (Number(summary.active) !== feed.length) {
      throw new Error(`Post-sync verification failed: expected ${feed.length} active products, got ${summary.active}`);
    }
    await client.query("COMMIT");
    console.log(`Sync complete: ${updated} updated, ${inserted} inserted, ${missingIds.length} hidden; ${productsWithReconciledImages} Drive-managed product photo sets reconciled; ${summary.active} active Prayag products (${summary.total} stored including order-safe history).`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

main().catch((error) => {
  console.error("Prayag MRP sync failed:", error);
  process.exit(1);
});