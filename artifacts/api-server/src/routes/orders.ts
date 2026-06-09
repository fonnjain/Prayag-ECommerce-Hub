import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, cartSessionsTable, productsTable, addressesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function getSessionId(req: any): string {
  return req.headers["x-session-id"] as string || req.ip || "default";
}

const STATUSES = ["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled"];

async function buildOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db.select({ oi: orderItemsTable })
    .from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const addr = order.shippingAddressId
    ? (await db.select().from(addressesTable).where(eq(addressesTable.id, order.shippingAddressId)))[0]
    : null;
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    items: items.map(({ oi }) => ({
      id: oi.id,
      productId: oi.productId,
      productName: oi.productName,
      imageUrl: oi.imageUrl,
      price: parseFloat(oi.price as string),
      quantity: oi.quantity,
      subtotal: parseFloat(oi.subtotal as string),
    })),
    subtotal: parseFloat(order.subtotal as string),
    gst: parseFloat(order.gst as string),
    shipping: parseFloat(order.shipping as string),
    discount: parseFloat(order.discount as string),
    total: parseFloat(order.total as string),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    shippingAddress: addr ? {
      id: addr.id, name: addr.name, phone: addr.phone, street: addr.street,
      city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country,
      isDefault: addr.isDefault === "true",
    } : null,
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const userId = (req as any).userId || 1;
  const rows = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
  const built = await Promise.all(rows.map(buildOrder));
  res.json(built);
});

router.post("/orders", async (req, res): Promise<void> => {
  const { addressId, paymentMethod, couponCode, notes } = req.body;
  const userId = (req as any).userId || 1;
  const sessionId = getSessionId(req);

  const [cart] = await db.select().from(cartSessionsTable).where(eq(cartSessionsTable.sessionId, sessionId));
  const cartItems = cart
    ? await db.select({ ci: cartItemsTable, p: productsTable })
        .from(cartItemsTable)
        .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
        .where(eq(cartItemsTable.cartId, cart.id))
    : [];

  if (!cartItems.length) { res.status(400).json({ error: "Cart is empty" }); return; }

  const subtotal = cartItems.reduce((s, { ci, p }) => s + parseFloat(p.price as string) * ci.quantity, 0);
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal > 5000 ? 0 : 150;
  const discount = couponCode === "PRAYAG10" ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const total = subtotal + gst + shipping - discount;
  const orderNumber = `PRY${Date.now()}`;

  const [order] = await db.insert(ordersTable).values({
    orderNumber, userId, status: "pending",
    subtotal: subtotal.toString(), gst: gst.toString(), shipping: shipping.toString(),
    discount: discount.toString(), total: total.toString(),
    paymentMethod: paymentMethod || "cod", paymentStatus: "pending",
    shippingAddressId: addressId || null, couponCode: couponCode || null, notes: notes || null,
  }).returning();

  for (const { ci, p } of cartItems) {
    const price = parseFloat(p.price as string);
    await db.insert(orderItemsTable).values({
      orderId: order.id, productId: p.id, productName: p.name,
      imageUrl: p.imageUrl, price: price.toString(),
      quantity: ci.quantity, subtotal: (price * ci.quantity).toString(),
    });
  }

  if (cart) await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));

  res.status(201).json(await buildOrder(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await buildOrder(order));
});

router.get("/orders/:id/tracking", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  const currentIdx = STATUSES.indexOf(order.status);
  const labels: Record<string, string> = {
    pending: "Order Placed", confirmed: "Order Confirmed", packed: "Packed",
    dispatched: "Dispatched", delivered: "Delivered", cancelled: "Cancelled"
  };
  const timeline = STATUSES.filter(s => s !== "cancelled").map((s, i) => ({
    status: s, label: labels[s], completed: i <= currentIdx && order.status !== "cancelled",
    timestamp: i <= currentIdx ? new Date(Date.now() - (currentIdx - i) * 86400000).toISOString() : null,
    note: null,
  }));
  res.json({ orderId: order.id, orderNumber: order.orderNumber, status: order.status, timeline });
});

export default router;
