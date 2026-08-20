import { Router, type IRouter } from "express";
import { db, wishlistTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { currentUserId, requireAuth } from "../middleware/auth";

const router: IRouter = Router();

function positiveId(value: unknown): number | null {
  const id = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

router.get("/wishlist", requireAuth, async (req, res): Promise<void> => {
  const userId = currentUserId(req);
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

router.post("/wishlist", requireAuth, async (req, res): Promise<void> => {
  const productId = req.body?.productId;
  if (typeof productId !== "number" || !Number.isSafeInteger(productId) || productId <= 0) {
    res.status(400).json({ error: "Valid productId is required" });
    return;
  }

  const userId = currentUserId(req);
  const [product] = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [existing] = await db.select().from(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
  if (!existing) await db.insert(wishlistTable).values({ userId, productId });
  res.json({ success: true, message: "Added to wishlist" });
});

router.delete("/wishlist/:productId", requireAuth, async (req, res): Promise<void> => {
  const productId = positiveId(req.params.productId);
  if (!productId) {
    res.status(400).json({ error: "Invalid productId" });
    return;
  }
  const userId = currentUserId(req);
  await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
  res.json({ success: true, message: "Removed from wishlist" });
});

export default router;
