/**
 * Daily MRP auto-sync from the external Prayag product database API
 * (prayag-competition-analysis app).
 *
 * Unlike import-external-products.ts (destructive full re-import), this script
 * is a safe incremental sync, matching store `sku` = external `itemCode`:
 *   - updates products.mrp / products.price when the external MRP changed
 *   - upserts (inserts) new external items that aren't in the store yet
 *   - marks store products out of stock when missing/inactive externally
 *
 * Run once: pnpm --filter @workspace/scripts run sync-external-mrp
 * Scheduled: the "Daily MRP Sync" console workflow runs it every 24h.
 * Requires: PRAYAG_COMP_KEY env secret, DATABASE_URL
 */
import { db, pool, productsTable, categoriesTable } from "@workspace/db";

const API_BASE = "https://prayag-competition-analysis.replit.app/api/v1";
const KEY = process.env.PRAYAG_COMP_KEY;
if (!KEY) { console.error("PRAYAG_COMP_KEY not set"); process.exit(1); }

interface ExtProduct {
  id: number;
  itemCode: string;
  productName: string | null;
  division: string | null;
  category: string | null;
  size: string | null;
  uom: string | null;
  isActive: boolean;
  currentMrp: number | null;
}

const DIVISION_TO_CATEGORY_SLUG: Record<string, string> = {
  "PTMT & Plastic Fittings": "ptmt-faucets",
  "CP Fittings / Faucets": "cp-faucets",
  "Ceramic Sanitaryware": "sanitaryware",
  "Pipes & Fittings": "pipes-fittings",
  "Hardware": "bathroom-accessories",
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

async function fetchAll(): Promise<ExtProduct[]> {
  const rows: ExtProduct[] = [];
  let page = 1;
  for (;;) {
    const res = await fetch(`${API_BASE}/products?page=${page}&limit=50`, {
      headers: { "X-API-Key": KEY! },
    });
    if (!res.ok) throw new Error(`API ${res.status} on page ${page}`);
    const data = (await res.json()) as { rows: ExtProduct[]; total: number; pageSize: number };
    rows.push(...data.rows);
    if (rows.length >= data.total || data.rows.length === 0) break;
    page++;
  }
  return rows;
}

function buildName(r: ExtProduct): string {
  const nameParts = [r.productName!.trim()];
  if (r.category) nameParts.push(`- ${r.category}`);
  if (r.size && !r.productName!.includes(r.size)) nameParts.push(`(${r.size})`);
  return nameParts.join(" ");
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`[${startedAt}] Fetching external catalogue...`);
  const ext = await fetchAll();
  console.log(`Fetched ${ext.length} external products`);

  // usable external rows: real MRP + itemCode + name; de-dup itemCodes defensively
  const seen = new Set<string>();
  const usable = ext.filter((r) =>
    r.currentMrp != null && r.currentMrp > 0 && r.itemCode && r.productName &&
    (seen.has(r.itemCode) ? false : (seen.add(r.itemCode), true))
  );
  console.log(`${usable.length} external products have a real MRP`);

  const { rows: local } = await pool.query(
    "SELECT id, sku, mrp::text AS mrp, price::text AS price, in_stock FROM products"
  );
  const localBySku = new Map<string, { id: number; mrp: string; price: string; in_stock: boolean }>(
    local.map((r: any) => [r.sku, r])
  );

  const cats = await db.select().from(categoriesTable);
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));
  const fallbackCat = catBySlug.get("bathroom-accessories") ?? cats[0].id;

  let priceUpdates = 0, restocked = 0, inserted = 0, outOfStock = 0;

  // 1) update MRP/price + stock status for existing products; collect new items
  const toInsert: ExtProduct[] = [];
  for (const r of usable) {
    const existing = localBySku.get(r.itemCode);
    if (!existing) { toInsert.push(r); continue; }
    const newMrp = r.currentMrp!.toFixed(2);
    const mrpChanged = Number(existing.mrp) !== Number(newMrp);
    const stockChanged = existing.in_stock !== r.isActive;
    if (mrpChanged || stockChanged) {
      // price follows MRP (store sells at MRP; keep both in sync)
      await pool.query(
        "UPDATE products SET mrp = $1, price = $1, in_stock = $2, updated_at = now() WHERE id = $3",
        [newMrp, r.isActive, existing.id]
      );
      if (mrpChanged) priceUpdates++;
      if (stockChanged && r.isActive) restocked++;
    }
  }

  // 2) insert new external items
  if (toInsert.length > 0) {
    const BATCH = 500;
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH).map((r) => {
        const name = buildName(r);
        const mrp = r.currentMrp!.toFixed(2);
        const specs = [
          r.division ? `Division: ${r.division}` : null,
          r.category ? `Series: ${r.category}` : null,
          r.size ? `Size: ${r.size}` : null,
          `Item Code: ${r.itemCode}`,
        ].filter(Boolean).join("\n");
        return {
          name,
          slug: `${slugify(name)}-${slugify(r.itemCode)}`,
          sku: r.itemCode,
          description: `${name} — genuine PRAYAG product.`,
          specifications: specs,
          price: mrp,
          mrp,
          categoryId: catBySlug.get(DIVISION_TO_CATEGORY_SLUG[r.division ?? ""] ?? "") ?? fallbackCat,
          imageUrl: null as string | null,
          inStock: r.isActive,
        };
      });
      // onConflictDoNothing on slug/sku collisions keeps the sync resilient
      await db.insert(productsTable).values(batch).onConflictDoNothing();
      inserted += batch.length;
    }
  }

  // 3) mark products missing from the external feed as out of stock
  const extSkus = new Set(usable.map((r) => r.itemCode));
  const missingIds = local
    .filter((r: any) => r.in_stock && !extSkus.has(r.sku))
    .map((r: any) => r.id);
  if (missingIds.length > 0) {
    // guardrail: if the external feed looks broken (would deactivate >50% of
    // catalogue), skip step 3 instead of gutting the store
    if (missingIds.length > local.length / 2 && usable.length < local.length / 2) {
      console.warn(`SKIPPING out-of-stock step: external feed returned too few items (${usable.length}) vs local (${local.length}) — feed likely broken`);
    } else {
      const BATCH = 1000;
      for (let i = 0; i < missingIds.length; i += BATCH) {
        const slice = missingIds.slice(i, i + BATCH);
        await pool.query(
          "UPDATE products SET in_stock = false, updated_at = now() WHERE id = ANY($1::int[])",
          [slice]
        );
      }
      outOfStock = missingIds.length;
    }
  }

  console.log(`Sync done: ${priceUpdates} MRP updates, ${inserted} new products, ${restocked} back in stock, ${outOfStock} marked out of stock.`);
  process.exit(0);
}

main().catch((e) => { console.error("Sync failed:", e); process.exit(1); });
