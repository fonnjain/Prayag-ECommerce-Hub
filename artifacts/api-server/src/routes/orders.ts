import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, cartSessionsTable, productsTable, addressesTable, usersTable, orderRequestsTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import { generateInvoicePdf } from "../lib/invoice";
import { sendInvoiceEmail } from "../lib/email";
import { logger } from "../lib/logger";
import { canAccessResource, currentUserId, requireAuth, type AuthUser } from "../middleware/auth";
import { getCartSessionId } from "../middleware/cart-session";

const router: IRouter = Router();

function canAccessOrder(auth: AuthUser, order: { userId: number | null }): boolean {
  return canAccessResource(auth, order.userId);
}

const STATUSES = ["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled"];

async function buildOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db.select({ oi: orderItemsTable })
    .from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const addr = order.shippingAddressId
    ? (await db.select().from(addressesTable).where(and(
        eq(addressesTable.id, order.shippingAddressId),
        eq(addressesTable.userId, order.userId),
      )))[0]
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

router.use("/orders", requireAuth);

router.get("/orders", async (req, res): Promise<void> => {
  const rows = await db.select().from(ordersTable).where(eq(ordersTable.userId, currentUserId(req)));
  const built = await Promise.all(rows.map(buildOrder));
  res.json(built);
});

router.post("/orders", async (req, res): Promise<void> => {
  const { addressId, paymentMethod, couponCode, notes } = req.body;
  const userId = currentUserId(req);
  const sessionId = getCartSessionId(req, res);

  if (addressId !== undefined && addressId !== null) {
    if (typeof addressId !== "number" || !Number.isSafeInteger(addressId) || addressId <= 0) {
      res.status(400).json({ error: "Invalid addressId" });
      return;
    }
    const [address] = await db.select({ id: addressesTable.id }).from(addressesTable).where(and(
      eq(addressesTable.id, addressId),
      eq(addressesTable.userId, userId),
    )).limit(1);
    if (!address) {
      res.status(400).json({ error: "Shipping address not found" });
      return;
    }
  }

  const [cart] = await db.select().from(cartSessionsTable).where(eq(cartSessionsTable.sessionId, sessionId));
  const cartItems = cart
    ? await db.select({ ci: cartItemsTable, p: productsTable })
        .from(cartItemsTable)
        .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
        .where(eq(cartItemsTable.cartId, cart.id))
    : [];

  if (!cartItems.length) { res.status(400).json({ error: "Cart is empty" }); return; }

  const unavailable = cartItems.filter(({ p }) => !p.inStock);
  if (unavailable.length) {
    // Remove discontinued items from the cart so the user can retry cleanly
    for (const { ci } of unavailable) {
      await db.delete(cartItemsTable).where(eq(cartItemsTable.id, ci.id));
    }
    const names = unavailable.map(({ p }) => p.name).join(", ");
    res.status(409).json({
      error: `Some items are no longer available and were removed from your cart: ${names}. Please review your cart and try again.`,
    });
    return;
  }

  const subtotal = cartItems.reduce((s, { ci, p }) => s + parseFloat(p.price as string) * ci.quantity, 0);
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal > 5000 ? 0 : 150;
  const discount = couponCode === "PRAYAG10" ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const total = subtotal + gst + shipping - discount;
  const orderNumber = `PRY${Date.now()}`;

  const [order] = await db.insert(ordersTable).values({
    orderNumber, userId, status: "confirmed",
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

  const built = await buildOrder(order);
  res.status(201).json(built);

  // Fire-and-forget: generate invoice PDF and email it to the customer
  void (async () => {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (!user?.email) {
        logger.warn({ orderId: order.id }, "No user email — skipping invoice email");
        return;
      }
      const pdf = await generateInvoicePdf({ ...built, customerName: user.name, customerEmail: user.email });
      await sendInvoiceEmail({
        to: user.email,
        customerName: user.name,
        orderNumber: order.orderNumber,
        total: built.total,
        pdf,
      });
    } catch (err) {
      logger.error({ err, orderId: order.id }, "Invoice email pipeline failed");
    }
  })();
});

router.get("/orders/:id/invoice", async (req, res): Promise<void> => {
  const auth = req.auth!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order || !canAccessOrder(auth, order)) { res.status(404).json({ error: "Not found" }); return; }
  const built = await buildOrder(order);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, order.userId!));
  const pdf = await generateInvoicePdf({ ...built, customerName: user?.name, customerEmail: user?.email });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="Invoice-${order.orderNumber}.pdf"`);
  res.send(pdf);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const auth = req.auth!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order || !canAccessOrder(auth, order)) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await buildOrder(order));
});

router.get("/orders/:id/tracking", async (req, res): Promise<void> => {
  const auth = req.auth!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order || !canAccessOrder(auth, order)) { res.status(404).json({ error: "Not found" }); return; }
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

function buildRequest(r: typeof orderRequestsTable.$inferSelect, orderNumber?: string) {
  return {
    id: r.id, orderId: r.orderId, orderNumber, type: r.type, reason: r.reason,
    status: r.status, adminNote: r.adminNote,
    createdAt: r.createdAt?.toISOString(), resolvedAt: r.resolvedAt?.toISOString() ?? null,
  };
}

const CANCELLABLE = ["pending", "confirmed", "packed"];
const POST_DELIVERY_TYPES = ["return", "replace", "refund"];

router.post("/orders/:id/cancel", async (req, res): Promise<void> => {
  const auth = req.auth!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order || !canAccessOrder(auth, order)) { res.status(404).json({ error: "Not found" }); return; }
  if (!CANCELLABLE.includes(order.status)) {
    res.status(400).json({ error: order.status === "cancelled" ? "Order is already cancelled" : "Order cannot be cancelled after dispatch. Please request a return instead." });
    return;
  }
  const reason = (req.body?.reason || "").toString().trim();
  if (!reason) { res.status(400).json({ error: "Please provide a reason" }); return; }
  const [updated] = await db.update(ordersTable).set({ status: "cancelled" }).where(eq(ordersTable.id, id)).returning();
  await db.insert(orderRequestsTable).values({
    orderId: id, userId: order.userId, type: "cancel", reason, status: "completed", resolvedAt: new Date(),
  });
  res.json(await buildOrder(updated));
});

router.get("/orders/:id/requests", async (req, res): Promise<void> => {
  const auth = req.auth!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order || !canAccessOrder(auth, order)) { res.status(404).json({ error: "Not found" }); return; }
  const rows = await db.select().from(orderRequestsTable).where(eq(orderRequestsTable.orderId, id)).orderBy(desc(orderRequestsTable.createdAt));
  res.json(rows.map(r => buildRequest(r, order.orderNumber)));
});

router.post("/orders/:id/requests", async (req, res): Promise<void> => {
  const auth = req.auth!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order || !canAccessOrder(auth, order)) { res.status(404).json({ error: "Not found" }); return; }

  const type = (req.body?.type || "").toString();
  const reason = (req.body?.reason || "").toString().trim();
  if (!POST_DELIVERY_TYPES.includes(type)) { res.status(400).json({ error: "Invalid request type" }); return; }
  if (!reason) { res.status(400).json({ error: "Please provide a reason" }); return; }
  if (order.status !== "delivered") {
    res.status(400).json({ error: "Return, replacement or refund can only be requested after delivery" });
    return;
  }
  const deliveredCutoff = 7 * 86400000;
  const updatedAt = order.updatedAt ? new Date(order.updatedAt).getTime() : Date.now();
  if (Date.now() - updatedAt > deliveredCutoff) {
    res.status(400).json({ error: "The 7-day return window for this order has expired" });
    return;
  }
  const existing = await db.select().from(orderRequestsTable).where(eq(orderRequestsTable.orderId, id));
  if (existing.some(r => r.status === "pending" || r.status === "approved")) {
    res.status(400).json({ error: "There is already an active request for this order" });
    return;
  }
  const [created] = await db.insert(orderRequestsTable).values({
    orderId: id, userId: order.userId, type, reason,
  }).returning();
  res.status(201).json(buildRequest(created, order.orderNumber));
});

export default router;
