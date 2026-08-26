/**
 * Populate structured catalogue facets without changing display names or slugs.
 *
 * The legacy full import stored the supplier product type under "Series:" in
 * specifications. Newer syncs use "Category:". This script accepts both,
 * derives only known PTMT series/collection words from a product name, and can
 * be run repeatedly without changing settled values.
 */
import { pool } from "@workspace/db";
import { knownNameFacets } from "./product-facets.js";
import { loadOfficialPtmtFacetLookup } from "./ptmt-official-facets.js";

type ProductRow = {
  id: number;
  name: string;
  sku: string;
  categorySlug: string;
  specifications: string | null;
};

function specificationValue(specifications: string | null, label: string): string | null {
  if (!specifications) return null;
  const line = specifications
    .split("\n")
    .find((value) => value.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  const value = line?.slice(label.length + 1).replace(/\s+/g, " ").trim();
  return value || null;
}

async function main() {
  const officialPtmtFacetForSku = await loadOfficialPtmtFacetLookup();

  const { rows } = await pool.query<ProductRow>(
    `SELECT product.id, product.name, product.sku, category.slug AS "categorySlug", product.specifications
     FROM products AS product
     JOIN categories AS category ON category.id = product.category_id
     ORDER BY product.id`,
  );

  const changes = rows.map((product) => {
    const nameFacets = knownNameFacets(product.name);
    const officialPtmt = product.categorySlug === "ptmt-faucets"
      ? officialPtmtFacetForSku(product.sku)
      : null;
    return {
      id: product.id,
      // The existing PTMT sidebar is a verified official SKU inventory. Legacy
      // supplier buckets (for example, "PTMT Taps") are not equivalent to its
      // product-type labels, so only verified PTMT memberships populate its
      // official Type / Series / Collection facets.
      subCategory: officialPtmt
        ? officialPtmt.subCategory
        : specificationValue(product.specifications, "Category")
          ?? specificationValue(product.specifications, "Series"),
      sizeLabel: specificationValue(product.specifications, "Size"),
      series: officialPtmt?.series ?? nameFacets.series,
      collection: officialPtmt?.collection ?? nameFacets.collection,
    };
  });

  const batchSize = 500;
  let updated = 0;
  for (let start = 0; start < changes.length; start += batchSize) {
    const batch = changes.slice(start, start + batchSize);
    const result = await pool.query(
      `UPDATE products AS product
       SET sub_category = value.sub_category,
           size_label = value.size_label,
           series = value.series,
           collection = value.collection,
           updated_at = now()
       FROM unnest($1::int[], $2::text[], $3::text[], $4::text[], $5::text[])
         AS value(id, sub_category, size_label, series, collection)
       WHERE product.id = value.id
         AND (
           product.sub_category IS DISTINCT FROM value.sub_category
           OR product.size_label IS DISTINCT FROM value.size_label
           OR product.series IS DISTINCT FROM value.series
           OR product.collection IS DISTINCT FROM value.collection
         )`,
      [
        batch.map((item) => item.id),
        batch.map((item) => item.subCategory),
        batch.map((item) => item.sizeLabel),
        batch.map((item) => item.series),
        batch.map((item) => item.collection),
      ],
    );
    updated += result.rowCount ?? 0;
  }

  console.log(`Facet backfill complete: ${updated} products updated; ${rows.length - updated} already current.`);
}

main()
  .catch((error) => {
    console.error("Facet backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });