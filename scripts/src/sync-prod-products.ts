import { db, productsTable, productImagesTable } from "@workspace/db";

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

  // prune anything in prod that's not in dev FIRST, so stale rows can't cause slug/sku conflicts
  const prune = await post({ keepOnlyIds: [...devIds] });
  console.log(`pruned stale prod products: ${prune.deleted}`);

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
  console.log("sync complete");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
