import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { db, distributorsTable, distributorSchemesTable, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET;

function isAdmin(req: any): boolean {
  if (!JWT_SECRET) return false;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    const payload = jwt.verify(authHeader.replace("Bearer ", ""), JWT_SECRET) as { role?: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

const router: IRouter = Router();

router.get("/distributor/dashboard", async (req, res): Promise<void> => {
  const userId = (req as any).userId || 1;
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyOrders = orders.filter(o => o.createdAt >= monthStart).length;
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "confirmed").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const totalRevenue = orders
    .filter(o => o.status === "delivered")
    .reduce((s, o) => s + parseFloat(o.total as string), 0);
  const outstandingAmount = orders
    .filter(o => o.status !== "delivered" && o.status !== "cancelled")
    .reduce((s, o) => s + parseFloat(o.total as string), 0);
  const distributor = await db.select().from(distributorsTable).where(eq(distributorsTable.userId, userId)).limit(1);
  const creditLimit = distributor[0] ? parseFloat(distributor[0].creditLimit as string || "0") : 500000;
  const annualTarget = distributor[0] ? parseFloat(distributor[0].annualTarget as string || "0") : 5000000;
  const territory = distributor[0]?.territory || "Not Assigned";
  res.json({ monthlyOrders, outstandingAmount, pendingOrders, deliveredOrders, totalOrders: orders.length, totalRevenue, creditLimit, annualTarget, territory });
});

router.get("/distributor/orders", async (req, res): Promise<void> => {
  const userId = (req as any).userId || 1;
  const rows = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
  res.json(rows.map(o => ({
    id: o.id, orderNumber: o.orderNumber, status: o.status, items: [],
    subtotal: parseFloat(o.subtotal as string), gst: parseFloat(o.gst as string),
    shipping: parseFloat(o.shipping as string), discount: parseFloat(o.discount as string),
    total: parseFloat(o.total as string), paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
    shippingAddress: null, createdAt: o.createdAt?.toISOString(), updatedAt: o.updatedAt?.toISOString(),
  })));
});

router.get("/distributor/schemes", async (_req, res): Promise<void> => {
  const schemes = await db.select().from(distributorSchemesTable).where(eq(distributorSchemesTable.isActive, "true"));
  res.json(schemes.map(s => ({
    id: s.id, title: s.title, description: s.description,
    discount: parseFloat(s.discount as string),
    minOrderValue: s.minOrderValue ? parseFloat(s.minOrderValue as string) : null,
    validUntil: s.validUntil,
  })));
});

router.post("/distributor/register", async (req, res): Promise<void> => {
  const { businessName, contactName, email, phone, city, state, pincode, gstNumber, territory, annualTarget, creditLimit } = req.body;
  if (!businessName || !contactName || !email) { res.status(400).json({ error: "Required fields missing" }); return; }
  await db.insert(distributorsTable).values({ businessName, contactName, email, phone, city, state, pincode, gstNumber, territory, annualTarget, creditLimit });
  res.status(201).json({ success: true, message: "Distributor registration submitted successfully" });
});

router.get("/admin/distributors", async (req, res): Promise<void> => {
  if (!isAdmin(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const rows = await db.select().from(distributorsTable);
  res.json(rows.map(d => ({
    id: d.id, businessName: d.businessName, contactName: d.contactName, email: d.email,
    phone: d.phone, city: d.city, state: d.state, territory: d.territory,
    creditLimit: d.creditLimit ? parseFloat(d.creditLimit as string) : null,
    annualTarget: d.annualTarget ? parseFloat(d.annualTarget as string) : null,
    status: d.status, createdAt: d.createdAt?.toISOString(),
  })));
});

export default router;
