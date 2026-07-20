import { Router, type IRouter } from "express";
import { db, siteContentTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/site-content", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteContentTable);
  const map: Record<string, unknown> = {};
  for (const row of rows) map[row.section] = row.data;
  res.json(map);
});

export default router;
