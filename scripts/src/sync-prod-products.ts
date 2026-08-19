import { db, productsTable, productImagesTable, categoriesTable, siteContentTable } from "@workspace/db";

const PROD_URL = process.env.PROD_URL || "https://e-commerce-hub-nishantjain29.replit.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@prayag.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  if (!ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD env var required");

  const loginRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!loginRes.ok) throw new Error(`login failed: ${loginRes.status}`);
  const { token } = (await loginRes.json()) as { token: string };

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
  const prodIds: number[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${PROD_URL}/api/admin/products?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`could not list production products: ${res.status}`);
    const data = (await res.json()) as { products: Array<{ id: number }>; totalPages: number };
    prodIds.push(...data.products.map((p) => p.id));
    if (page >= data.totalPages || data.products.length === 0) break;
  }
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
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const r = await post({ products: batch });
    console.log(`products ${i + 1}-${i + batch.length}: ok (${r.products})`);
  }
  for (let i = 0; i < images.length; i += BATCH) {
    const batch = images.slice(i, i + BATCH);
    const r = await post({ images: batch });
    console.log(`images ${i + 1}-${i + batch.length}: ok (${r.images})`);
  }

  const finalIds: number[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${PROD_URL}/api/admin/products?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`could not verify production products: ${res.status}`);
    const data = (await res.json()) as { products: Array<{ id: number }>; totalPages: number };
    finalIds.push(...data.products.map((p) => p.id));
    if (page >= data.totalPages || data.products.length === 0) break;
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
