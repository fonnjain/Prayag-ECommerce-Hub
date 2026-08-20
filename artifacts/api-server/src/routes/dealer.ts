import { Router, type IRouter } from "express";
import { db, dealersTable, dealerSchemesTable, ordersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { currentUserId, requireDealer } from "../middleware/auth";

const router: IRouter = Router();

router.get("/dealer/dashboard", requireDealer, async (req, res): Promise<void> => {
  const userId = currentUserId(req);
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyOrders = orders.filter(o => o.createdAt >= monthStart).length;
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "confirmed").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const outstandingAmount = orders
    .filter(o => o.status !== "delivered" && o.status !== "cancelled")
    .reduce((s, o) => s + parseFloat(o.total as string), 0);
  res.json({ monthlyOrders, outstandingAmount, pendingOrders, deliveredOrders, totalOrders: orders.length });
});

router.get("/dealer/orders", requireDealer, async (req, res): Promise<void> => {
  const userId = currentUserId(req);
  const rows = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
  res.json(rows.map(o => ({
    id: o.id, orderNumber: o.orderNumber, status: o.status, items: [],
    subtotal: parseFloat(o.subtotal as string), gst: parseFloat(o.gst as string),
    shipping: parseFloat(o.shipping as string), discount: parseFloat(o.discount as string),
    total: parseFloat(o.total as string), paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
    shippingAddress: null, createdAt: o.createdAt?.toISOString(), updatedAt: o.updatedAt?.toISOString(),
  })));
});

router.post("/dealer/orders", requireDealer, async (req, res): Promise<void> => {
  res.status(201).json({ id: 999, orderNumber: `PRY${Date.now()}`, status: "pending", items: [], subtotal: 0, gst: 0, shipping: 0, discount: 0, total: 0, paymentMethod: "net_banking", paymentStatus: "pending", shippingAddress: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

router.get("/dealer/schemes", requireDealer, async (_req, res): Promise<void> => {
  const schemes = await db.select().from(dealerSchemesTable).where(eq(dealerSchemesTable.isActive, "true"));
  res.json(schemes.map(s => ({ id: s.id, title: s.title, description: s.description, discount: parseFloat(s.discount as string), validUntil: s.validUntil })));
});

router.post("/dealer/register", async (req, res): Promise<void> => {
  const { businessName, contactName, email, phone, city, state, pincode, gstNumber } = req.body;
  if (!businessName || !contactName || !email) { res.status(400).json({ error: "Required fields missing" }); return; }
  await db.insert(dealersTable).values({ businessName, contactName, email, phone, city, state, pincode, gstNumber });
  res.status(201).json({ success: true, message: "Dealer registration submitted" });
});

export default router;
