import { Router, type IRouter } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/banners", async (_req, res): Promise<void> => {
  const banners = await db.select().from(bannersTable).where(eq(bannersTable.isActive, true)).orderBy(bannersTable.sortOrder);
  res.json(banners.map(b => ({ id: b.id, title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, linkUrl: b.linkUrl, isActive: b.isActive, sortOrder: b.sortOrder })));
});

export default router;
