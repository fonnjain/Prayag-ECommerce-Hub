import { pool } from "@workspace/db";
import { buildShortProductName } from "./product-name.js";

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function sourceCategory(specifications: string | null): string | null {
  return specifications?.match(/^Category:\s*(.+)$/m)?.[1]?.trim() ?? null;
}

function sourceSize(specifications: string | null): string | null {
  return specifications?.match(/^Size:\s*(.+)$/m)?.[1]?.trim() ?? null;
}

async function main() {
  const { rows } = await pool.query<{
    id: number;
    sku: string;
    name: string;
    slug: string;
    description: string;
    specifications: string | null;
  }>("SELECT id, sku, name, slug, description, specifications FROM products");

  const planned = rows
    .map((product) => {
      const name = buildShortProductName({
        productName: product.name,
        category: sourceCategory(product.specifications),
        size: sourceSize(product.specifications),
      });
      if (!name || name === product.name) return null;
      return {
        ...product,
        name,
        slug: `${slugify(name)}-${slugify(product.sku)}`,
        description: product.description === `${product.name} — genuine PRAYAG product.`
          ? `${name} — genuine PRAYAG product.`
          : product.description,
      };
    })
    .filter((product): product is NonNullable<typeof product> => product !== null);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const product of planned) {
      await client.query(
        `UPDATE products
         SET name = $1, slug = $2, description = $3, updated_at = now()
         WHERE id = $4`,
        [product.name, product.slug, product.description, product.id]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  console.log(`Shortened ${planned.length} product names; ${rows.length - planned.length} were already concise.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});