/**
 * Curated official Prayag bathroom-accessories content.
 *
 * Product identity, MRP, stock, and the category's existing UI remain owned by
 * the supplier catalogue. This only enriches exact official SKUs with content
 * sourced from their matching official product pages.
 */
import { pool } from "@workspace/db";

const officialAccessories = [
  {
    sku: "BA-48",
    description: "Brass Toilet Paper Holder",
    sourceUrl: "https://prayagindia.com/ba-48-toilet-paper-holder",
    productType: "Accessory",
    features: ["Chrome plating", "Long-lasting finish", "Effortless maintenance", "Stain resistance"],
  },
  {
    sku: "BA-47",
    description: "Brass Robe Hook",
    sourceUrl: "https://prayagindia.com/ba-47-robe-hook-0",
    productType: "Accessory",
    features: ["Chrome plating", "Long-lasting finish", "Effortless maintenance", "Stain resistance"],
  },
  {
    sku: "BA-46",
    description: "Keep your tumbler secure and accessible with the Prayag Brass Tumbler Holder. Crafted from corrosion-resistant brass, it provides reliable support and long-lasting shine. Wall-mounted for space efficiency, it is ideal for organizing toothbrushes or rinsing cups in bathrooms.",
    sourceUrl: "https://prayagindia.com/ba-46-tumble-holder",
    productType: "Accessory",
    features: ["Corrosion-resistant brass", "Wall-mounted design", "Space-saving storage"],
  },
  {
    sku: "BA-45",
    description: "The Prayag Brass Soap Dish offers a blend of style and durability. Its functional design keeps soap dry and reduces mess, while a polished brass finish resists rust and tarnish.",
    sourceUrl: "https://prayagindia.com/ba-45-soap-dish",
    productType: "Accessory",
    features: ["Ventilated soap support", "Polished brass finish", "Simple wall mounting"],
  },
  {
    sku: "BA-42",
    description: "Brass Towel Rack",
    sourceUrl: "https://prayagindia.com/ba-42-brass-towel-rack",
    productType: "Accessory",
    features: ["Solid brass construction", "Corrosion resistance", "Durable everyday use"],
  },
  {
    sku: "BA-41",
    description: "Brass Towel Ring",
    sourceUrl: "https://prayagindia.com/ba-41-towel-ring",
    productType: "Accessory",
    features: ["Chrome finish", "Brass construction", "Humid-environment durability"],
  },
  {
    sku: "BA-40",
    description: "Brass Towel Rail (600mm)",
    sourceUrl: "https://prayagindia.com/ba-40-towel-rail",
    productType: "Accessory",
    features: ["600mm rail", "Solid brass construction", "Chrome-plated finish"],
  },
  {
    sku: "BOS-42",
    description: "Enhance your bathroom décor with the Prayag 200mm Square Rain Shower. Its broad square design delivers a soothing, rain-like spray and is engineered for consistent water-flow performance.",
    sourceUrl: "https://prayagindia.com/bos-42-over-head-shower",
    productType: "Shower",
    features: ["200mm square rain head", "Stainless steel plate", "Easy-clean nozzles"],
  },
  {
    sku: "BS-78",
    description: "Upgrade your shower space with Prayag’s ABS Overhead Shower, 150mm in size, paired with a sturdy 225mm brass arm and flange for a gentle yet full water spray.",
    sourceUrl: "https://prayagindia.com/bs-78-over-head-shower",
    productType: "Shower",
    features: ["150mm ABS head", "225mm brass arm and flange", "Focused consistent spray"],
  },
] as const;

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows: categoryRows } = await client.query<{ id: number }>(
      "SELECT id FROM categories WHERE slug = 'bathroom-accessories'",
    );
    const category = categoryRows[0];
    if (!category) throw new Error("Bathroom Accessories category is missing");

    const skus = officialAccessories.map((product) => product.sku);
    const { rows: matches } = await client.query<{ sku: string }>(
      "SELECT sku FROM products WHERE sku = ANY($1::text[])",
      [skus],
    );
    const matchedSkus = new Set(matches.map((product) => product.sku));
    const missing = skus.filter((sku) => !matchedSkus.has(sku));
    if (missing.length > 0) {
      throw new Error(`Official bathroom-accessories SKUs are missing from the supplier catalogue: ${missing.join(", ")}`);
    }

    for (const product of officialAccessories) {
      const specifications = JSON.stringify({
        contentSource: "prayagindia.com",
        officialSourceUrl: product.sourceUrl,
        finish: "Chrome Finish",
        productType: product.productType,
        features: product.features,
      });
      await client.query(
        `UPDATE products
         SET description = $1,
             specifications = $2::jsonb,
             image_url = CASE WHEN image_url LIKE 'https://prayagindia.com/%' THEN NULL ELSE image_url END,
             category_id = $3,
             updated_at = now()
         WHERE sku = $4`,
        [product.description, specifications, category.id, product.sku],
      );
    }

    await client.query("COMMIT");
    console.log(`Enriched ${officialAccessories.length} official Bathroom Accessories products.`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});