import { db, CANONICAL_STATES, STATE_ALIASES } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

/**
 * Idempotent data cleanup: normalize distributors.state to canonical
 * Title Case names and map known non-state values to their real state.
 * Runs at startup so the fix also applies to the production database
 * on the next publish; once data is clean it updates zero rows.
 */
export async function normalizeDealerStates(): Promise<void> {
  const pairs: [string, string][] = [
    ...CANONICAL_STATES.map((s): [string, string] => [s.toUpperCase(), s]),
    ...Object.entries(STATE_ALIASES),
  ];
  const valuesSql = sql.join(
    pairs.map(([key, canon]) => sql`(${key}, ${canon})`),
    sql`, `,
  );
  // Rows where a locality leaked into the state column had the real state in
  // the district column — move it out before it gets overwritten.
  await db.execute(sql`
    UPDATE distributors SET territory = 'Mahendragarh'
    WHERE upper(btrim(state)) IN ('OLD MANDI', 'RAV TULA RAM CHOWK')
      AND upper(btrim(territory)) = 'HARYANA'
  `);
  const result = await db.execute(sql`
    UPDATE distributors d SET state = m.canon
    FROM (VALUES ${valuesSql}) AS m(key, canon)
    WHERE upper(btrim(d.state)) = m.key
      AND d.state IS DISTINCT FROM m.canon
  `);
  const count = (result as unknown as { rowCount?: number }).rowCount ?? 0;
  if (count > 0) logger.info({ count }, "Normalized dealer state names");
}
