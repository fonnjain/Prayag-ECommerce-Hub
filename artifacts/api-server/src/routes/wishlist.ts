import { Router, type IRouter } from "express";
import { db, wishlistTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/wishlist", async (req, res): Promise<void> => {
  const userId = (req as any).userId || 1;
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(wishlistTable)
    .innerJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(wishlistTable.userId, userId));
  res.json(rows.map(({ p, catName }) => ({
    id: p.id, name: p.name, slug: p.slug, sku: p.sku,
    price: parseFloat(p.price as string), mrp: parseFloat(p.mrp as string),
    discount: parseFloat(p.mrp as string) > parseFloat(p.price as string)
      ? Math.round(((parseFloat(p.mrp as string) - parseFloat(p.price as string)) / parseFloat(p.mrp as string)) * 100)
      : null,
    categoryId: p.categoryId, categoryName: catName ?? null,
    imageUrl: p.imageUrl, rating: parseFloat(p.rating as string),
    reviewCount: p.reviewCount, inStock: p.inStock, isFeatured: p.isFeatured, isNew: p.isNew,
  })));
});

router.post("/wishlist", async (req, res): Promise<void> => {
  const { productId } = req.body;
  const userId = (req as any).userId || 1;
  const [existing] = await db.select().from(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
  if (!existing) await db.insert(wishlistTable).values({ userId, productId });
  res.json({ success: true, message: "Added to wishlist" });
});

router.delete("/wishlist/:productId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(rawId, 10);
  const userId = (req as any).userId || 1;
  await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
  res.json({ success: true, message: "Removed from wishlist" });
});

export default router;
