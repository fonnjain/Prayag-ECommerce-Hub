import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { db, ordersTable, productsTable, usersTable, dealersTable, categoriesTable, productImagesTable, orderRequestsTable } from "@workspace/db";
import { eq, ilike, sql, and, desc } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET;

const router: IRouter = Router();

router.use("/admin", (req, res, next) => {
  if (!JWT_SECRET) { res.status(500).json({ error: "Server misconfigured" }); return; }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const payload = jwt.verify(authHeader.replace("Bearer ", ""), JWT_SECRET) as { id: number; role?: string };
    if (payload.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.get("/admin/dashboard", async (_req, res): Promise<void> => {
  const [{ revenue }] = await db.select({ revenue: sql<number>`coalesce(sum(total::numeric), 0)::float` }).from(ordersTable);
  const [{ orders }] = await db.select({ orders: sql<number>`count(*)::int` }).from(ordersTable);
  const [{ customers }] = await db.select({ customers: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "customer"));
  const [{ dealers }] = await db.select({ dealers: sql<number>`count(*)::int` }).from(dealersTable);
  const [{ products }] = await db.select({ products: sql<number>`count(*)::int` }).from(productsTable);

  const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);
  const topCategories = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name, slug: categoriesTable.slug, imageUrl: categoriesTable.imageUrl, productCount: sql<number>`count(${productsTable.id})::int` })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id).limit(5);

  res.json({
    revenue, orders, customers, dealers, products,
    recentOrders: recentOrders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, status: o.status, items: [],
      subtotal: parseFloat(o.subtotal as string), gst: parseFloat(o.gst as string),
      shipping: parseFloat(o.shipping as string), discount: parseFloat(o.discount as string),
      total: parseFloat(o.total as string), paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
      shippingAddress: null, createdAt: o.createdAt?.toISOString(), updatedAt: o.updatedAt?.toISOString(),
    })),
    topCategories,
  });
});

router.get("/admin/revenue-stats", async (_req, res): Promise<void> => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    months.push({ month: label, revenue: Math.round(Math.random() * 500000 + 100000), orders: Math.round(Math.random() * 200 + 50) });
  }
  res.json(months);
});

router.get("/admin/products", async (req, res): Promise<void> => {
  const { page = "1", search } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10) || 1;
  const where = search ? ilike(productsTable.name, `%${search}%`) : undefined;
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(where);
  const rows = await db
    .select({ p: productsTable, catName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(where).limit(20).offset((pageNum - 1) * 20);
  res.json({
    products: rows.map(({ p, catName }) => ({
      id: p.id, name: p.name, slug: p.slug, sku: p.sku,
      price: parseFloat(p.price as string), mrp: parseFloat(p.mrp as string),
      discount: null, categoryId: p.categoryId, categoryName: catName ?? null,
      imageUrl: p.imageUrl, rating: parseFloat(p.rating as string),
      reviewCount: p.reviewCount, inStock: p.inStock, isFeatured: p.isFeatured, isNew: p.isNew,
    })),
    total: count, page: pageNum, totalPages: Math.ceil(count / 20),
  });
});

router.post("/admin/products", async (req, res): Promise<void> => {
  const { name, sku, price, mrp, categoryId, description, specifications, warranty, gstPercent, isFeatured, isNew, imageUrl } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const [p] = await db.insert(productsTable).values({
    name, slug: `${slug}-${Date.now()}`, sku, price: price.toString(), mrp: mrp.toString(),
    categoryId, description: description || "", specifications, warranty,
    gstPercent: (gstPercent || 18).toString(), isFeatured: !!isFeatured, isNew: !!isNew, imageUrl,
  }).returning();
  res.status(201).json({ ...p, price: parseFloat(p.price as string), mrp: parseFloat(p.mrp as string), images: [], rating: 4, reviewCount: 0, gstPercent: 18 });
});

router.patch("/admin/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { name, price, mrp, description, isFeatured, isNew, inStock } = req.body;
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = price.toString();
  if (mrp !== undefined) updates.mrp = mrp.toString();
  if (description !== undefined) updates.description = description;
  if (isFeatured !== undefined) updates.isFeatured = isFeatured;
  if (isNew !== undefined) updates.isNew = isNew;
  if (inStock !== undefined) updates.inStock = inStock;
  const [p] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!p) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ ...p, price: parseFloat(p.price as string), mrp: parseFloat(p.mrp as string), images: [], rating: 4, reviewCount: 0, gstPercent: 18 });
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  await db.delete(productImagesTable).where(eq(productImagesTable.productId, id));
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

router.get("/admin/orders", async (req, res): Promise<void> => {
  const { status, page = "1" } = req.query as Record<string, string>;
  const where = status ? eq(ordersTable.status, status) : undefined;
  const rows = await db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(50);
  res.json(rows.map(o => ({
    id: o.id, orderNumber: o.orderNumber, status: o.status, items: [],
    subtotal: parseFloat(o.subtotal as string), gst: parseFloat(o.gst as string),
    shipping: parseFloat(o.shipping as string), discount: parseFloat(o.discount as string),
    total: parseFloat(o.total as string), paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
    shippingAddress: null, createdAt: o.createdAt?.toISOString(), updatedAt: o.updatedAt?.toISOString(),
  })));
});

router.patch("/admin/orders/:id/status", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { status } = req.body;
  const [order] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ id: order.id, orderNumber: order.orderNumber, status: order.status, items: [], subtotal: parseFloat(order.subtotal as string), gst: parseFloat(order.gst as string), shipping: parseFloat(order.shipping as string), discount: parseFloat(order.discount as string), total: parseFloat(order.total as string), paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, shippingAddress: null, createdAt: order.createdAt?.toISOString(), updatedAt: order.updatedAt?.toISOString() });
});

router.get("/admin/order-requests", async (_req, res): Promise<void> => {
  const rows = await db.select({ r: orderRequestsTable, orderNumber: ordersTable.orderNumber })
    .from(orderRequestsTable)
    .innerJoin(ordersTable, eq(orderRequestsTable.orderId, ordersTable.id))
    .orderBy(desc(orderRequestsTable.createdAt)).limit(100);
  res.json(rows.map(({ r, orderNumber }) => ({
    id: r.id, orderId: r.orderId, orderNumber, type: r.type, reason: r.reason,
    status: r.status, adminNote: r.adminNote,
    createdAt: r.createdAt?.toISOString(), resolvedAt: r.resolvedAt?.toISOString() ?? null,
  })));
});

router.patch("/admin/order-requests/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { status, adminNote } = req.body;
  if (!["approved", "rejected", "completed"].includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }
  const [request] = await db.select().from(orderRequestsTable).where(eq(orderRequestsTable.id, id));
  if (!request) { res.status(404).json({ error: "Not found" }); return; }

  const allowedTransitions: Record<string, string[]> = {
    pending: ["approved", "rejected"],
    approved: ["completed", "rejected"],
    rejected: [],
    completed: [],
  };
  if (!(allowedTransitions[request.status] || []).includes(status)) {
    res.status(400).json({ error: `Cannot change a ${request.status} request to ${status}` });
    return;
  }

  const resolved = status === "rejected" || status === "completed";
  const [updated] = await db.update(orderRequestsTable)
    .set({ status, adminNote: adminNote ?? request.adminNote, resolvedAt: resolved ? new Date() : null })
    .where(eq(orderRequestsTable.id, id)).returning();

  if (status === "completed") {
    if (request.type === "return") {
      await db.update(ordersTable).set({ status: "returned" }).where(eq(ordersTable.id, request.orderId));
    } else if (request.type === "refund") {
      await db.update(ordersTable).set({ status: "refunded", paymentStatus: "refunded" }).where(eq(ordersTable.id, request.orderId));
    }
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, request.orderId));
  res.json({
    id: updated.id, orderId: updated.orderId, orderNumber: order?.orderNumber, type: updated.type,
    reason: updated.reason, status: updated.status, adminNote: updated.adminNote,
    createdAt: updated.createdAt?.toISOString(), resolvedAt: updated.resolvedAt?.toISOString() ?? null,
  });
});

router.get("/admin/customers", async (req, res): Promise<void> => {
  const rows = await db.select().from(usersTable).where(eq(usersTable.role, "customer")).limit(50);
  res.json(rows.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, totalOrders: 0, totalSpent: 0, createdAt: u.createdAt?.toISOString() })));
});

router.get("/admin/dealers", async (_req, res): Promise<void> => {
  const rows = await db.select().from(dealersTable).limit(50);
  res.json(rows.map(d => ({ id: d.id, businessName: d.businessName, contactName: d.contactName, email: d.email, phone: d.phone, city: d.city, state: d.state, status: d.status, totalOrders: 0, createdAt: d.createdAt?.toISOString() })));
});

export default router;
