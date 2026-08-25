import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable, productImagesTable } from "@workspace/db";
import { eq, ilike, and, or, gte, lte, sql, desc, asc } from "drizzle-orm";

const router: IRouter = Router();

const RELATED_NAME_STOP_WORDS = new Set([
  "and", "with", "without", "for", "the", "from", "wall", "table", "mounted",
  "mount", "body", "long", "short", "handle", "flange", "regular", "single",
  "double", "lever", "cock", "faucet", "tap", "bath", "shower", "hot", "cold",
  "way", "flow", "waste", "system",
]);

function getRelatedProductKeywords(name: string) {
  return [...new Set(
    (name.toLowerCase().match(/[a-z0-9]+/g) ?? [])
      .filter((word) => word.length >= 3 && !RELATED_NAME_STOP_WORDS.has(word) && !/^\d+$/.test(word)),
  )].slice(0, 6);
}

function buildProductRow(p: typeof productsTable.$inferSelect, catName?: string | null, images?: string[]) {
  const price = parseFloat(p.price as string);
  const mrp = parseFloat(p.mrp as string);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
  return {
    id: p.id, name: p.name, slug: p.slug, sku: p.sku,
    price, mrp, discount,
    categoryId: p.categoryId,
    categoryName: catName ?? null,
    imageUrl: p.imageUrl,
    rating: parseFloat(p.rating as string),
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    ...(images !== undefined ? {
      images: images.length > 0 ? images : (p.imageUrl ? [p.imageUrl] : []),
      description: p.description,
      specifications: p.specifications,
      warranty: p.warranty,
      gstPercent: parseFloat(p.gstPercent as string),
    } : {}),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const { category, minPrice, maxPrice, sortBy, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageLimit = Math.min(100, parseInt(limit, 10) || 20);

  const conditions = [];
  if (category) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category));
    if (cat) conditions.push(eq(productsTable.categoryId, cat.id));
  }
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (minPrice) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
  // The public catalogue never shows retired products; admin tooling uses the
  // authenticated /admin/products endpoints for the full inventory.
  conditions.push(eq(productsTable.inStock, true));

  let orderBy: any[] = [desc(productsTable.createdAt)];
  if (sortBy === "photo_ready") {
    // Keep the full catalogue available, while placing products with verified
    // catalogue photography first in the default browsing experience.
    orderBy = [
      sql`CASE WHEN ${productsTable.imageUrl} IS NULL THEN 1 ELSE 0 END`,
      desc(productsTable.createdAt),
    ];
  }
  if (sortBy === "price_asc") orderBy = [asc(productsTable.price as any)];
  if (sortBy === "price_desc") orderBy = [desc(productsTable.price as any)];
  if (sortBy === "rating") orderBy = [desc(productsTable.rating as any)];

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(whereClause);
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(pageLimit)
    .offset((pageNum - 1) * pageLimit);

  res.json({
    products: rows.map(r => buildProductRow(r.p, r.catName)),
    total: count,
    page: pageNum,
    totalPages: Math.ceil(count / pageLimit),
  });
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.isFeatured, true), eq(productsTable.inStock, true)))
    .limit(12);
  res.json(rows.map(r => buildProductRow(r.p, r.catName)));
});

router.get("/products/new-arrivals", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.isNew, true), eq(productsTable.inStock, true)))
    .limit(12);
  res.json(rows.map(r => buildProductRow(r.p, r.catName)));
});

router.get("/products/search-suggestions", async (req, res): Promise<void> => {
  const q = req.query.q as string;
  if (!q || q.length < 2) { res.json([]); return; }
  const rows = await db
    .select({ name: productsTable.name })
    .from(productsTable)
    .where(and(ilike(productsTable.name, `%${q}%`), eq(productsTable.inStock, true)))
    .limit(8);
  res.json(rows.map(r => r.name));
});

router.get("/products/:slug", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [row] = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.slug, rawSlug), eq(productsTable.inStock, true)));
  if (!row) { res.status(404).json({ error: "Product not found" }); return; }
  const imgs = await db.select().from(productImagesTable).where(eq(productImagesTable.productId, row.p.id)).orderBy(productImagesTable.sortOrder);
  const images = [row.p.imageUrl, ...imgs.map((image) => image.imageUrl)]
    .filter((image): image is string => Boolean(image))
    .filter((image, index, values) => values.indexOf(image) === index);
  res.json(buildProductRow(row.p, row.catName, images));
});

router.get("/products/:slug/related", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [product] = await db.select().from(productsTable).where(and(eq(productsTable.slug, rawSlug), eq(productsTable.inStock, true)));
  if (!product) { res.json([]); return; }

  const keywords = getRelatedProductKeywords(product.name);
  if (keywords.length === 0) { res.json([]); return; }

  const keywordConditions = keywords.map((keyword) => ilike(productsTable.name, `%${keyword}%`));
  const matchScore = sql<number>`(${sql.join(
    keywords.map((keyword) => sql`CASE WHEN lower(${productsTable.name}) LIKE ${`%${keyword}%`} THEN 1 ELSE 0 END`),
    sql` + `,
  )})`;
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(
      eq(productsTable.categoryId, product.categoryId),
      eq(productsTable.inStock, true),
      sql`${productsTable.id} != ${product.id}`,
      or(...keywordConditions),
    ))
    .orderBy(
      desc(matchScore),
      sql`ABS(${productsTable.price}::numeric - ${product.price}::numeric) ASC`,
      asc(productsTable.name),
    )
    .limit(8);
  res.json(rows.map(r => buildProductRow(r.p, r.catName)));
});

export default router;
