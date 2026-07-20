import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder, categoriesTable.id);
  res.json(cats.map(c => ({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.imageUrl, description: c.description, sortOrder: c.sortOrder })));
});

router.get("/categories/with-counts", async (_req, res): Promise<void> => {
  const result = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      imageUrl: categoriesTable.imageUrl,
      sortOrder: categoriesTable.sortOrder,
      productCount: sql<number>`count(${productsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, sql`${productsTable.categoryId} = ${categoriesTable.id}`)
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.sortOrder, categoriesTable.id);
  res.json(result);
});

export default router;
