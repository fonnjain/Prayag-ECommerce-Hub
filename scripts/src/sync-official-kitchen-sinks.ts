import { pool } from "@workspace/db";

export const OFFICIAL_KITCHEN_SINK_MARKER = "Catalogue source: Official Prayag Kitchen Sinks";

type OfficialKitchenSink = {
  sku: string;
  slug: string;
  name: string;
  collection: string;
  colors: string;
  size?: string;
  thickness?: string;
  weight?: string;
  imageUrl: string;
};

export const OFFICIAL_KITCHEN_SINKS: OfficialKitchenSink[] = [
  { sku: "Q716 MB", slug: "q716-mb-single-bowl", name: "Q716 MB Single Bowl", collection: "Quartz Collection", colors: "Black · White · Grey", imageUrl: "/images/drive/kitchen-sinks-web/single-bowl.webp" },
  { sku: "Q716 GB", slug: "q716-gb-single-bowl", name: "Q716 GB Single Bowl", collection: "Quartz Collection", colors: "Bianco · Pluto", imageUrl: "/images/drive/kitchen-sinks-web/single-bowl-0.webp" },
  { sku: "Q720 MB", slug: "q720-mb-single-bowl", name: "Q720 MB Single Bowl", collection: "Sand Unico", colors: "Black · White", imageUrl: "/images/drive/kitchen-sinks-web/sand-unico-single-bowl.webp" },
  { sku: "Q720 GB", slug: "q720-gb-single-bowl", name: "Q720 GB Single Bowl", collection: "Sand Unico", colors: "Bianco · Pluto", imageUrl: "/images/drive/kitchen-sinks-web/sand-unico-single-bowl-0.webp" },
  { sku: "Q724 MB", slug: "q724-mb-single-bowl", name: "Q724 MB Single Bowl", collection: "Dark Choco", colors: "Black · White · Grey", imageUrl: "/images/drive/kitchen-sinks-web/dark-choco-single-bowl.webp" },
  { sku: "Q728 MB", slug: "q728-mb-double-bowl", name: "Q728 MB Double Bowl", collection: "Sand Valentine", colors: "Black · White · Grey", imageUrl: "/images/drive/kitchen-sinks-web/sand-valentine-double-bowl.webp" },
  { sku: "Q728 GB", slug: "q728-gb-double-bowl", name: "Q728 GB Double Bowl", collection: "Sand Valentine", colors: "Bianco · Pluto", imageUrl: "/images/drive/kitchen-sinks-web/sand-valentine-double-bowl.webp" },
  { sku: "Q732 MB", slug: "q732-mb-double-bowl", name: "Q732 MB Double Bowl", collection: "Sand Azaro", colors: "Bianco · Pluto", size: "34 × 19.5 × 8.5", thickness: "10 mm", weight: "9 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/sand-azaro-double-bowl.webp" },
  { sku: "Q736 MB", slug: "q736-mb-single-bowl-drain-board", name: "Q736 MB Single Bowl with Drain Board", collection: "Crystal Vanilla", colors: "Official finish", size: "34 × 19.5 × 8.5", thickness: "10 mm", weight: "9 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/crystal-vanilla-singe-bowl-with-drain-board-0.webp" },
  { sku: "Q740 MB", slug: "q740-mb-double-bowl", name: "Q740 MB Double Bowl", collection: "Sand Unico-Twin", colors: "Black · White · Grey", size: "37 × 18 × 8.5", thickness: "14 mm", weight: "22 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/sand-unico-twin-double-bowl.webp" },
  { sku: "Q740 GB", slug: "q740-gb-double-bowl", name: "Q740 GB Double Bowl", collection: "Sand Unico-Twin", colors: "Bianco · Pluto", size: "37 × 18 × 8.5", thickness: "14 mm", weight: "22 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/sand-unico-twin-double-bowl.webp" },
  { sku: "Q744 MB", slug: "q744-mb-double-bowl", name: "Q744 MB Double Bowl", collection: "Coke Smudge", colors: "Black · White · Grey", size: "40 × 18 × 8.5", thickness: "10 mm", weight: "21 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/coke-smudge-double-bowl.webp" },
  { sku: "Q744 GB", slug: "q744-gb-double-bowl", name: "Q744 GB Double Bowl", collection: "Coke Smudge", colors: "Bianco · Pluto", size: "40 × 18 × 8.5", thickness: "10 mm", weight: "21 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/coke-smudge-double-bowl.webp" },
  { sku: "Q748 MB", slug: "q748-mb-double-bowl-drain-board", name: "Q748 MB Double Bowl with Drain Board", collection: "Ivory Lucid", colors: "Bianco · Pluto", size: "45 × 20 × 8.5", thickness: "10 mm", weight: "21.5 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/ivory-lucid-double-bowl-with-drain-board.webp" },
  { sku: "Q752 MB", slug: "q752-mb-double-bowl", name: "Q752 MB Double Bowl", collection: "Sand Soul", colors: "Black · White · Grey", size: "45 × 20 × 8.5", thickness: "10 mm", weight: "30.5 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/sand-soul-double-bowl.webp" },
  { sku: "Q752 GB", slug: "q752-gb-double-bowl", name: "Q752 GB Double Bowl", collection: "Sand Soul", colors: "Bianco · Pluto", size: "45 × 20 × 8.5", thickness: "10 mm", weight: "30.5 kg approx.", imageUrl: "/images/drive/kitchen-sinks-web/sand-soul-double-bowl.webp" },
];

function specifications(item: OfficialKitchenSink) {
  return [
    "Material: Quartz",
    `Collection: ${item.collection}`,
    `Colours: ${item.colors}`,
    item.size ? `Size: ${item.size}` : null,
    item.thickness ? `Thickness: ${item.thickness}` : null,
    item.weight ? `Weight: ${item.weight}` : null,
    "Catalogue availability: Price on request",
    OFFICIAL_KITCHEN_SINK_MARKER,
  ].filter(Boolean).join("\n");
}

export async function syncOfficialKitchenSinks() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of OFFICIAL_KITCHEN_SINKS) {
      const sku = item.sku.replace(/\s+/g, "");
      const description = `Official Prayag ${item.collection} quartz kitchen sink. Pricing is available on request.`;
      await client.query(
        `INSERT INTO products (
           name, slug, sku, description, specifications, warranty, price, mrp,
            category_id, sub_category, size_label, series, collection,
            image_url, rating, review_count, in_stock, is_featured, is_new
         )
         VALUES (
           $1, $2, $3, $4, $5, NULL, 0, 0,
           (SELECT id FROM categories WHERE slug = 'kitchen-sinks'),
            'Kitchen Sink', $6, NULL, $7, $8, 0, 0, true, false, false
         )
         ON CONFLICT (sku) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           specifications = EXCLUDED.specifications,
           warranty = NULL,
           price = CASE WHEN products.price > 0 THEN products.price ELSE EXCLUDED.price END,
           mrp = CASE WHEN products.mrp > 0 THEN products.mrp ELSE EXCLUDED.mrp END,
           category_id = EXCLUDED.category_id,
            sub_category = EXCLUDED.sub_category,
            size_label = EXCLUDED.size_label,
            series = EXCLUDED.series,
            collection = EXCLUDED.collection,
           image_url = EXCLUDED.image_url,
           in_stock = true,
           updated_at = now()`,
         [item.name, item.slug, sku, description, specifications(item), item.size ?? null, item.collection, item.imageUrl],
      );
    }
    await client.query("COMMIT");
    console.log(`Synced ${OFFICIAL_KITCHEN_SINKS.length} official Kitchen Sinks catalogue records.`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  syncOfficialKitchenSinks().catch((error) => {
    console.error("Official kitchen-sink sync failed:", error);
    process.exit(1);
  });
}