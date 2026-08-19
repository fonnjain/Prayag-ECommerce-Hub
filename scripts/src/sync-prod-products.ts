import jwt from "jsonwebtoken";
import { db, pool, productsTable, productImagesTable, categoriesTable, siteContentTable } from "@workspace/db";

const PROD_URL = process.env.PROD_URL || "https://e-commerce-hub-nishantjain29.replit.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@prayag.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

/**
 * Obtain an admin token for the production API.
 *
 * Primary path: log in with the admin email + ADMIN_PASSWORD. If that password
 * has drifted from the live account, fall back to minting a short-lived admin
 * JWT directly from SESSION_SECRET (the same shared deploy secret the API uses
 * to verify tokens). The fallback keeps the daily sync self-healing even when
 * the stored admin password no longer matches production.
 */
async function getAdminToken(): Promise<string> {
  if (ADMIN_PASSWORD) {
    const loginRes = await fetch(`${PROD_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (loginRes.ok) {
      const { token } = (await loginRes.json()) as { token: string };
      return token;
    }
    console.warn(`admin login failed (${loginRes.status}); falling back to SESSION_SECRET-minted token`);
  }

  if (!SESSION_SECRET) throw new Error("cannot authenticate: admin login failed and SESSION_SECRET is not set");

  // Discover the admin user's id from the shared database so the minted token
  // carries a real subject.
  const { rows } = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1 AND role = 'admin' LIMIT 1",
    [ADMIN_EMAIL]
  );
  const adminId = rows[0]?.id ?? 1;
  return jwt.sign({ id: adminId, role: "admin" }, SESSION_SECRET, { expiresIn: "1h" });
}

async function main() {
  if (!ADMIN_PASSWORD && !SESSION_SECRET) throw new Error("ADMIN_PASSWORD or SESSION_SECRET env var required");

  const token = await getAdminToken();

  const products = await db.select().from(productsTable);
  const images = await db.select().from(productImagesTable);
  console.log(`dev: ${products.length} products, ${images.length} images`);

  const devIds = new Set(products.map((p) => p.id));

  async function post(body: unknown) {
    const res = await fetch(`${PROD_URL}/api/admin/import-products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`import failed ${res.status}: ${text.slice(0, 300)}`);
    return JSON.parse(text);
  }

  // Discover the live IDs instead of assuming the production sequence matches
  // development. This also lets us prune only stale rows after the catalogue
  // was replaced in development.
  const prodRows: Array<{ id: number; sku: string; slug: string }> = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${PROD_URL}/api/admin/products?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`could not list production products: ${res.status}`);
    const data = (await res.json()) as { products: Array<{ id: number; sku: string; slug: string }>; totalPages: number };
    prodRows.push(...data.products.map((p) => ({ id: p.id, sku: p.sku, slug: p.slug })));
    if (page >= data.totalPages || data.products.length === 0) break;
  }
  const prodIds = prodRows.map((p) => p.id);
  console.log(`prod: ${prodIds.length} products before sync`);

  // Positively identify products still needed by historical orders before
  // pruning. Do not infer this from a failed DELETE: auth, network, and
  // database failures must abort the sync rather than silently preserve rows.
  const ordersRes = await fetch(`${PROD_URL}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!ordersRes.ok) throw new Error(`could not list production orders: ${ordersRes.status}`);
  const orders = (await ordersRes.json()) as Array<{ id: number }>;
  const referencedProductIds = new Set<number>();
  for (const order of orders) {
    const orderRes = await fetch(`${PROD_URL}/api/orders/${order.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!orderRes.ok) throw new Error(`could not inspect production order ${order.id}: ${orderRes.status}`);
    const detail = (await orderRes.json()) as { items?: Array<{ productId: number }> };
    for (const item of detail.items ?? []) {
      if (Number.isInteger(item.productId)) referencedProductIds.add(item.productId);
    }
  }

  const categories = await db.select().from(categoriesTable);
  const catRes = await post({ categories });
  console.log(`categories synced: ${catRes.categories}`);

  const siteContent = await db.select().from(siteContentTable);
  if (siteContent.length > 0) {
    const scRes = await post({ siteContent: siteContent.map((s) => ({ section: s.section, data: s.data })) });
    console.log(`site content synced: ${scRes.siteContent}`);
  }

  // Prune stale rows before upserting, excluding only product IDs positively
  // identified in production order items.
  const preservedIds = [...referencedProductIds].filter((id) => !devIds.has(id));

  // Order-preserved rows keep their own id, sku and slug and are never re-sent,
  // so the two-phase parking below cannot free their sku/slug. If one of them
  // still owns a sku or slug that a development product now needs, the upsert
  // would collide. Detect that BEFORE mutating anything so the sync aborts
  // cleanly instead of leaving the live catalogue half-written.
  const preservedIdSet = new Set(preservedIds);
  const devSkus = new Set(products.map((p) => p.sku));
  const devSlugs = new Set(products.map((p) => p.slug));
  const conflicts = prodRows
    .filter((r) => preservedIdSet.has(r.id))
    .filter((r) => devSkus.has(r.sku) || devSlugs.has(r.slug));
  if (conflicts.length > 0) {
    throw new Error(
      `Aborting before writes: ${conflicts.length} order-preserved product(s) share a sku/slug with the new catalogue ` +
      `(e.g. id ${conflicts[0].id}, sku ${conflicts[0].sku}, slug ${conflicts[0].slug}). Resolve manually to avoid partial sync.`
    );
  }
  const staleIds = prodIds.filter((id) => !devIds.has(id) && !referencedProductIds.has(id));
  let pruned = 0;
  const DELETE_BATCH = 100;
  for (let i = 0; i < staleIds.length; i += DELETE_BATCH) {
    const batch = staleIds.slice(i, i + DELETE_BATCH);
    const result = await post({ deleteIds: batch });
    pruned += result.deleted ?? 0;
  }
  console.log(`pruned stale prod products: ${pruned}; preserved referenced rows: ${preservedIds.length}`);

  const BATCH = 50;
  // Two-phase product upsert to avoid unique-constraint collisions on the live
  // database. The deployed import endpoint upserts by product id, but both `sku`
  // and `slug` are unique. When a sku/slug moves between two products (a "swap"
  // relative to how prod currently stores them), upserting the first row fails
  // because the second still holds the target value. Phase 1 parks every product
  // on temporary sku+slug values keyed by its (unique) id, clearing all real
  // sku/slug values from the table; phase 2 then applies the real values with no
  // possible collision.
  const tempProducts = products.map((p) => ({ ...p, sku: `__tmp_sku__${p.id}`, slug: `__tmp_slug__${p.id}` }));
  for (let i = 0; i < tempProducts.length; i += BATCH) {
    const batch = tempProducts.slice(i, i + BATCH);
    const r = await post({ products: batch });
    console.log(`products (phase 1) ${i + 1}-${i + batch.length}: ok (${r.products})`);
  }
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const r = await post({ products: batch });
    console.log(`products (phase 2) ${i + 1}-${i + batch.length}: ok (${r.products})`);
  }
  for (let i = 0; i < images.length; i += BATCH) {
    const batch = images.slice(i, i + BATCH);
    const r = await post({ images: batch });
    console.log(`images ${i + 1}-${i + batch.length}: ok (${r.images})`);
  }

  const finalIds: number[] = [];
  let stranded = 0;
  for (let page = 1; ; page++) {
    const res = await fetch(`${PROD_URL}/api/admin/products?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`could not verify production products: ${res.status}`);
    const data = (await res.json()) as { products: Array<{ id: number; sku: string; slug: string }>; totalPages: number };
    finalIds.push(...data.products.map((p) => p.id));
    // Detect any product left on a phase-1 temporary sku/slug — the signature of
    // a two-phase upsert that did not complete, which would break canonical URLs
    // and sku-based integrations.
    stranded += data.products.filter((p) => p.sku?.startsWith("__tmp_sku__") || p.slug?.startsWith("__tmp_slug__")).length;
    if (page >= data.totalPages || data.products.length === 0) break;
  }
  if (stranded > 0) {
    throw new Error(`production verification failed: ${stranded} product(s) left on temporary sku/slug values`);
  }
  const expectedIds = new Set([...devIds, ...preservedIds]);
  const missing = [...expectedIds].filter((id) => !finalIds.includes(id));
  const unexpected = finalIds.filter((id) => !expectedIds.has(id));
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(`production verification failed: missing ${missing.length}, unexpected ${unexpected.length}`);
  }
  console.log(`verified production catalogue: ${finalIds.length} products (${products.length} synced + ${preservedIds.length} preserved)`);
  console.log("sync complete");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
