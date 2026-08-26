/**
 * Replace the store catalogue with real products (and real MRP) from the
 * external Prayag product database API (prayag-competition-analysis app).
 *
 * Run: pnpm --filter @workspace/scripts run import-external-products
 * Requires: PRAYAG_COMP_KEY env secret, DATABASE_URL
 */
import { db, pool, productsTable, productImagesTable, categoriesTable } from "@workspace/db";
import { buildShortProductName } from "./product-name.js";
import { compactSku } from "./sku.js";
import { sourceProductFacets } from "./product-facets.js";

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
const KITCHEN_SINK_PRODUCT_CODES = new Set(["FT-31", "FT-31M", "FT-32", "FT-32M"]);

function categorySlugForProduct(product: ExtProduct): string | undefined {
  const productText = [product.productName, product.category].filter(Boolean).join(" ");
  if (KITCHEN_SINK_PRODUCT_CODES.has(product.itemCode.trim().toUpperCase())) {
    return "kitchen-sinks";
  }
  if (/\bcockroach\s+trap\b/i.test(productText)) {
    return "kitchen-sinks";
  }
  if (/^WT-/i.test(product.itemCode.trim()) || /\bwater\s+tanks?\b/i.test(productText)) {
    return "storage-tanks";
  }
  return DIVISION_TO_CATEGORY_SLUG[product.division ?? ""];
}

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
    if (page % 20 === 0) console.log(`fetched ${rows.length}/${data.total}...`);
  }
  return rows;
}

async function main() {
  console.log("Fetching external catalogue...");
  const ext = await fetchAll();
  console.log(`Fetched ${ext.length} products`);

  const withMrp = ext
    .filter((r) => r.currentMrp != null && r.currentMrp > 0 && r.itemCode && r.productName)
    .map((r) => ({ ...r, itemCode: compactSku(r.itemCode) }));
  console.log(`${withMrp.length} products have a real MRP — importing those`);

  const cats = await db.select().from(categoriesTable);
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));
  const fallbackCat = catBySlug.get("bathroom-accessories") ?? cats[0].id;

  // de-dup itemCodes defensively
  const seen = new Set<string>();
  const items = withMrp.filter((r) => (seen.has(r.itemCode) ? false : (seen.add(r.itemCode), true)));

  console.log("Clearing old catalogue (cart, wishlist, order items, images, products)...");
  await pool.query("DELETE FROM cart_items");
  await pool.query("DELETE FROM wishlist");
  await pool.query("DELETE FROM order_items");
  await db.delete(productImagesTable);
  await db.delete(productsTable);

  console.log(`Inserting ${items.length} products...`);
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH).map((r) => {
      const name = buildShortProductName(r);
      if (!name) throw new Error(`Missing product name for ${r.itemCode}`);
      const mrp = r.currentMrp!.toFixed(2);
      const facets = sourceProductFacets({ category: r.category, size: r.size, productName: r.productName });
      const specs = [
        r.division ? `Division: ${r.division}` : null,
        r.category ? `Category: ${r.category}` : null,
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
        categoryId: catBySlug.get(categorySlugForProduct(r) ?? "") ?? fallbackCat,
        subCategory: facets.subCategory,
        sizeLabel: facets.sizeLabel,
        series: facets.series,
        collection: facets.collection,
        imageUrl: null as string | null,
        inStock: r.isActive,
      };
    });
    await db.insert(productsTable).values(batch);
    inserted += batch.length;
    if (inserted % 2000 < BATCH) console.log(`inserted ${inserted}/${items.length}`);
  }

  // mark a few as featured/new so homepage sections aren't empty
  await pool.query("UPDATE products SET is_featured = true WHERE id IN (SELECT id FROM products ORDER BY mrp DESC LIMIT 12)");
  await pool.query("UPDATE products SET is_new = true WHERE id IN (SELECT id FROM products ORDER BY id DESC LIMIT 12)");

  const { rows: [{ count }] } = await pool.query("SELECT count(*)::int AS count FROM products");
  console.log(`Done. products table now has ${count} rows.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
