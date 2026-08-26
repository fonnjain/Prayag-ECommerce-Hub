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
  PTMT_OFFICIAL_FILTER_URL,
} from "../src/lib/ptmtOfficialFilters.js";
import { hasPtmtAuditFindings } from "../src/lib/ptmtAuditNotification.js";
import { sendPtmtAuditNotification } from "../src/lib/email.js";
import { eq } from "drizzle-orm";

export async function runPtmtOfficialFilterAudit({ notify = false }: { notify?: boolean } = {}) {
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
  const auditReport = comparePtmtOfficialInventory(inventory, localProducts.map(({ sku }) => sku));

  const checkedAt = new Date().toISOString();
  const report = {
    checkedAt,
    officialFilterUrl: PTMT_OFFICIAL_FILTER_URL,
    filtersCrawled: inventory.filtersCrawled,
    pagesFetched: inventory.pagesFetched,
    ...auditReport,
  };
  console.log(JSON.stringify(report, null, 2));

  if (notify && hasPtmtAuditFindings(report)) {
    const reviewerEmail = process.env.PTMT_AUDIT_REVIEWER_EMAIL
      ?? process.env.ADMIN_EMAIL
      ?? "admin@prayag.com";
    const sent = await sendPtmtAuditNotification({
      to: reviewerEmail,
      report,
      checkedAt,
      officialFilterUrl: PTMT_OFFICIAL_FILTER_URL,
    });
    if (sent) {
      console.log(`PTMT audit notification sent to ${reviewerEmail}`);
    } else {
      // Notification delivery is deliberately non-blocking. The audit report
      // remains in the workflow logs for manual inspection or a later retry.
      console.error(`PTMT audit notification could not be delivered to ${reviewerEmail}`);
    }
  } else if (notify) {
    console.log("PTMT audit found no actionable changes; no notification sent");
  }

  return report;
}

if (process.argv[1] && process.argv[1].endsWith("check-ptmt-official-filters.ts")) {
  runPtmtOfficialFilterAudit({ notify: process.argv.includes("--notify") })
  .catch((error) => {
    console.error("PTMT official filter audit failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
}