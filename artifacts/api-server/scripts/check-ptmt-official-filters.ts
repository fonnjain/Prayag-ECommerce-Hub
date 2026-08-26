/**
 * Read-only audit of the official PTMT filter inventory.
 *
 * This intentionally does not update the mapping or the customer catalogue.
 * A reviewer should verify every actionable addition or ambiguous source
 * against the official product page before editing ptmtOfficialFilters.
 */
import { db, pool, categoriesTable, productsTable } from "@workspace/db";
import {
  comparePtmtOfficialInventory,
  crawlOfficialPtmtFilterInventory,
} from "../src/lib/ptmtOfficialFilters.js";
import { eq } from "drizzle-orm";

async function main() {
  const inventory = await crawlOfficialPtmtFilterInventory();
  const [ptmtCategory] = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, "ptmt-faucets"))
    .limit(1);
  if (!ptmtCategory) throw new Error("PTMT Faucets category does not exist");

  const localProducts = await db
    .select({ sku: productsTable.sku })
    .from(productsTable)
    .where(eq(productsTable.categoryId, ptmtCategory.id));
  const report = comparePtmtOfficialInventory(inventory, localProducts.map(({ sku }) => sku));

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    officialFilterUrl: "https://prayagindia.com/ptmt-filter",
    filtersCrawled: inventory.filtersCrawled,
    pagesFetched: inventory.pagesFetched,
    ...report,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("PTMT official filter audit failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());