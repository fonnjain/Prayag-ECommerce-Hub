import { db, normalizeLocality } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

/**
 * Idempotent data cleanup: normalize distributors.territory (district) and
 * distributors.city — collapse casing duplicates, strip postal-office
 * suffixes/admin tags, and null out placeholder values. Runs at startup so
 * production gets fixed on the next publish; once clean it updates zero rows.
 */
export async function normalizeDealerLocalities(): Promise<void> {
  let total = 0;
  for (const column of ["territory", "city"] as const) {
    const colSql = sql.raw(column);
    const distinct = await db.execute<{ v: string; n: number }>(sql`
      SELECT ${colSql} AS v, count(*)::int AS n FROM distributors
      WHERE ${colSql} IS NOT NULL GROUP BY 1
    `);
    const rows = (distinct as unknown as { rows: { v: string; n: number }[] }).rows;

    // Pass 1: rule-based normalization of each raw value.
    const normalized = new Map<string, string | null>();
    for (const { v } of rows) {
      const norm = normalizeLocality(v);
      if (norm !== v) normalized.set(v, norm);
    }

    // Pass 2: collapse remaining case-insensitive duplicates among mixed-case
    // values ("Kulti MC" vs "Kulti Mc") to the most frequent variant.
    const byKey = new Map<string, Map<string, number>>();
    for (const { v, n } of rows) {
      const eff = normalized.has(v) ? normalized.get(v) : v;
      if (eff == null) continue;
      const key = eff.toUpperCase();
      const variants = byKey.get(key) ?? new Map<string, number>();
      variants.set(eff, (variants.get(eff) ?? 0) + n);
      byKey.set(key, variants);
    }
    const canonicalByKey = new Map<string, string>();
    for (const [key, variants] of byKey) {
      let best: string | null = null;
      let bestScore = -1;
      for (const [variant, n] of variants) {
        // Prefer the most frequent variant; tie-break toward Title Case words.
        const titleBonus = /^[A-Z]/.test(variant) && !/\s[a-z]/.test(variant) ? 0.5 : 0;
        const score = n + titleBonus;
        if (score > bestScore) { bestScore = score; best = variant; }
      }
      if (best !== null) canonicalByKey.set(key, best);
    }

    // Build final raw → canonical mapping for values that change.
    const mapping: [string, string | null][] = [];
    for (const { v } of rows) {
      const eff = normalized.has(v) ? normalized.get(v)! : v;
      const canon = eff == null ? null : (canonicalByKey.get(eff.toUpperCase()) ?? eff);
      if (canon !== v) mapping.push([v, canon]);
    }
    if (mapping.length === 0) continue;

    const BATCH = 500;
    for (let i = 0; i < mapping.length; i += BATCH) {
      const chunk = mapping.slice(i, i + BATCH);
      const valuesSql = sql.join(
        chunk.map(([from, to]) => sql`(${from}, ${to})`),
        sql`, `,
      );
      const result = await db.execute(sql`
        UPDATE distributors d SET ${colSql} = m.canon
        FROM (VALUES ${valuesSql}) AS m(raw, canon)
        WHERE d.${colSql} = m.raw
      `);
      total += (result as unknown as { rowCount?: number }).rowCount ?? 0;
    }
  }
  if (total > 0) logger.info({ count: total }, "Normalized dealer district/city names");
}
