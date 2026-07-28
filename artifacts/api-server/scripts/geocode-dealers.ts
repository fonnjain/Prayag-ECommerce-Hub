// Batch-geocode dealer addresses via Nominatim (~1 req/sec), resumable.
// Run: cd artifacts/api-server && npx tsx scripts/geocode-dealers.ts
// Only processes rows where latitude IS NULL, so re-running resumes where it left off.
import { db, distributorsTable } from "@workspace/db";
import { isNull, eq, sql } from "drizzle-orm";

const SLEEP_MS = 1100;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function cleanArea(area: string | null) {
  return (area || "").replace(/\s*[BS]\.?O\.?$/i, "").trim();
}

type Row = typeof distributorsTable.$inferSelect;

// Try progressively simpler queries: full address → area+city → city+pincode
function queries(d: Row): string[] {
  const base = [d.city, d.territory, d.state, d.pincode, "India"];
  const dedupe = (parts: (string | null | undefined)[]) =>
    parts.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
  const out = [
    dedupe([d.address, cleanArea(d.area), ...base]),
    dedupe([cleanArea(d.area), ...base]),
    dedupe(base),
  ];
  return [...new Set(out)].filter(q => q.length > 6);
}

async function geocode(q: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "User-Agent": "PrayagDealerLocator/1.0 (batch)" } });
  if (!r.ok) throw new Error(`nominatim ${r.status}`);
  const data = (await r.json()) as { lat: string; lon: string }[];
  return data[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
}

async function main() {
  const limit = parseInt(process.env.GEOCODE_LIMIT || "0", 10) || Infinity;
  let done = 0, failed = 0;
  for (;;) {
    if (done + failed >= limit) break;
    const rows = await db.select().from(distributorsTable)
      .where(isNull(distributorsTable.latitude))
      .orderBy(distributorsTable.id)
      .limit(50);
    if (rows.length === 0) break;
    for (const d of rows) {
      if (done + failed >= limit) break;
      let coords: { lat: number; lon: number } | null = null;
      for (const q of queries(d)) {
        try {
          coords = await geocode(q);
        } catch (e) {
          console.error(`id=${d.id} geocode error: ${(e as Error).message}`);
          await sleep(5000);
        }
        await sleep(SLEEP_MS);
        if (coords) break;
      }
      if (coords) {
        await db.update(distributorsTable)
          .set({ latitude: String(coords.lat), longitude: String(coords.lon) })
          .where(eq(distributorsTable.id, d.id));
        done++;
      } else {
        // Mark as attempted-but-failed so we don't loop forever; sentinel 0,0 excluded by API.
        await db.update(distributorsTable)
          .set({ latitude: "0", longitude: "0" })
          .where(eq(distributorsTable.id, d.id));
        failed++;
      }
      if ((done + failed) % 25 === 0) {
        const remaining = await db.select({ c: sql<number>`count(*)::int` })
          .from(distributorsTable).where(isNull(distributorsTable.latitude));
        console.log(`progress: ok=${done} failed=${failed} remaining=${remaining[0]?.c}`);
      }
    }
  }
  console.log(`finished: ok=${done} failed=${failed}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
