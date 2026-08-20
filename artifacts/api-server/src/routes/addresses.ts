import { Router, type IRouter } from "express";
import { db, addressesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { currentUserId, requireAuth } from "../middleware/auth";

const router: IRouter = Router();

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function positiveId(value: unknown): number | null {
  const id = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

router.get("/addresses", requireAuth, async (req, res): Promise<void> => {
  const userId = currentUserId(req);
  const rows = await db.select().from(addressesTable).where(eq(addressesTable.userId, userId));
  res.json(rows.map(a => ({ id: a.id, name: a.name, phone: a.phone, street: a.street, city: a.city, state: a.state, pincode: a.pincode, country: a.country, isDefault: a.isDefault === "true" })));
});

router.post("/addresses", requireAuth, async (req, res): Promise<void> => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const name = nonEmptyString(body.name);
  const phone = nonEmptyString(body.phone);
  const street = nonEmptyString(body.street);
  const city = nonEmptyString(body.city);
  const state = nonEmptyString(body.state);
  const pincode = typeof body.pincode === "string" ? body.pincode.trim() : "";
  const country = nonEmptyString(body.country) ?? "India";
  const isDefault = body.isDefault === true;
  if (!name || !phone || !street || !city || !state) {
    res.status(400).json({ error: "name, phone, street, city and state are required" });
    return;
  }

  const userId = currentUserId(req);
  const [addr] = await db.insert(addressesTable).values({
    userId, name, phone, street, city, state, pincode, country, isDefault: isDefault ? "true" : "false",
  }).returning();
  res.status(201).json({ id: addr.id, name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country, isDefault: addr.isDefault === "true" });
});

router.delete("/addresses/:id", requireAuth, async (req, res): Promise<void> => {
  const id = positiveId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const deleted = await db.delete(addressesTable)
    .where(and(eq(addressesTable.id, id), eq(addressesTable.userId, currentUserId(req))))
    .returning();
  if (!deleted.length) {
    res.status(404).json({ error: "Address not found" });
    return;
  }
  res.json({ success: true, message: "Address removed" });
});

export default router;
