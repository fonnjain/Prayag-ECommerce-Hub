import { Router, type IRouter } from "express";
import { db, addressesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/addresses", async (req, res): Promise<void> => {
  const userId = (req as any).userId || 1;
  const rows = await db.select().from(addressesTable).where(eq(addressesTable.userId, userId));
  res.json(rows.map(a => ({ id: a.id, name: a.name, phone: a.phone, street: a.street, city: a.city, state: a.state, pincode: a.pincode, country: a.country, isDefault: a.isDefault === "true" })));
});

router.post("/addresses", async (req, res): Promise<void> => {
  const { name, phone, street, city, state, pincode, country, isDefault } = req.body;
  const userId = (req as any).userId || 1;
  const [addr] = await db.insert(addressesTable).values({
    userId, name, phone, street, city, state, pincode: pincode || "", country: country || "India", isDefault: isDefault ? "true" : "false",
  }).returning();
  res.status(201).json({ id: addr.id, name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country, isDefault: addr.isDefault === "true" });
});

export default router;
