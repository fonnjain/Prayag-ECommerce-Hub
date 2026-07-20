import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { db, ordersTable, productsTable, usersTable, dealersTable, categoriesTable, productImagesTable, orderRequestsTable, siteContentTable } from "@workspace/db";
import { eq, ilike, sql, and, desc } from "drizzle-orm";
import { z } from "zod";

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
  const { name, sku, price, mrp, categoryId, description, specifications, warranty, gstPercent, imageUrl, images, isFeatured, isNew, inStock } = req.body;
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (sku !== undefined) updates.sku = sku;
  if (price !== undefined) updates.price = price.toString();
  if (mrp !== undefined) updates.mrp = mrp.toString();
  if (categoryId !== undefined) updates.categoryId = categoryId;
  if (description !== undefined) updates.description = description;
  if (specifications !== undefined) updates.specifications = specifications;
  if (warranty !== undefined) updates.warranty = warranty;
  if (gstPercent !== undefined) updates.gstPercent = gstPercent.toString();
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (isFeatured !== undefined) updates.isFeatured = isFeatured;
  if (isNew !== undefined) updates.isNew = isNew;
  if (inStock !== undefined) updates.inStock = inStock;
  const [p] = Object.keys(updates).length > 0
    ? await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning()
    : await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!p) { res.status(404).json({ error: "Product not found" }); return; }
  if (Array.isArray(images)) {
    await db.delete(productImagesTable).where(eq(productImagesTable.productId, id));
    for (let i = 0; i < images.length; i++) {
      await db.insert(productImagesTable).values({ productId: id, imageUrl: images[i], sortOrder: i });
    }
  }
  res.json({ ...p, price: parseFloat(p.price as string), mrp: parseFloat(p.mrp as string), images: Array.isArray(images) ? images : [], rating: parseFloat(p.rating as string), reviewCount: p.reviewCount, gstPercent: parseFloat(p.gstPercent as string) });
});

router.post("/admin/categories", async (req, res): Promise<void> => {
  const { name, slug, description, imageUrl, sortOrder } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const finalSlug = (slug || name).toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const [c] = await db.insert(categoriesTable).values({ name, slug: finalSlug, description: description ?? null, imageUrl: imageUrl ?? null, sortOrder: typeof sortOrder === "number" ? sortOrder : 0 }).returning();
  res.status(201).json({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.imageUrl, description: c.description, sortOrder: c.sortOrder });
});

router.patch("/admin/categories/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { name, slug, description, imageUrl, sortOrder } = req.body;
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (typeof sortOrder === "number") updates.sortOrder = sortOrder;
  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No updates provided" }); return; }
  const [c] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
  if (!c) { res.status(404).json({ error: "Category not found" }); return; }
  res.json({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.imageUrl, description: c.description, sortOrder: c.sortOrder });
});

router.delete("/admin/categories/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.categoryId, id));
  if (count > 0) { res.status(400).json({ error: `Category has ${count} products. Move them first.` }); return; }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ success: true });
});

const cmsSectionSchemas: Record<string, z.ZodTypeAny> = {
  hero: z.object({
    badge: z.string(),
    titleLine1: z.string(),
    titleAccent: z.string(),
    subtitle: z.string(),
    stats: z.array(z.object({ n: z.number(), s: z.string(), label: z.string() })),
    featured: z.object({
      name: z.string(), image: z.string(), price: z.number(), mrp: z.number(),
      reviews: z.number(), link: z.string(),
    }),
    backgroundImage: z.string().optional(),
  }),
  collections: z.object({
    cards: z.array(z.object({ title: z.string(), sub: z.string(), img: z.string(), chips: z.array(z.string()), slug: z.string() })),
  }),
  rooms: z.object({
    cards: z.array(z.object({ label: z.string(), img: z.string(), slug: z.string() })),
  }),
  trust: z.object({
    items: z.array(z.object({ label: z.string(), sub: z.string() })),
  }),
  marquee: z.object({ words: z.array(z.string()) }),
  topbar: z.object({ text: z.string(), phone: z.string() }),
  footer: z.object({ phone: z.string(), email: z.string(), hours: z.string(), about: z.string() }),
  about: z.object({
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    storyHeading: z.string(),
    storyAccent: z.string(),
    storyPara1: z.string(),
    storyPara2: z.string(),
    storyImage: z.string(),
    stats: z.array(z.object({ n: z.string(), l: z.string() })),
    values: z.array(z.object({ title: z.string(), desc: z.string() })),
    milestones: z.array(z.object({ year: z.string(), text: z.string() })),
    ctaTitle: z.string(),
    ctaSubtitle: z.string(),
  }),
  contact: z.object({ title: z.string(), subtitle: z.string(), phone: z.string() }),
  dealerReg: z.object({
    badge: z.string(),
    title: z.string(),
    intro: z.string(),
    benefits: z.array(z.string()),
    statNumber: z.string(),
    statText: z.string(),
  }),
};

router.put("/admin/site-content/:section", async (req, res): Promise<void> => {
  const rawSection = Array.isArray(req.params.section) ? req.params.section[0] : req.params.section;
  let { data } = req.body;
  if (!data || typeof data !== "object") { res.status(400).json({ error: "data object required" }); return; }
  const schema = cmsSectionSchemas[rawSection];
  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      res.status(400).json({ error: `Invalid ${rawSection} content: ${parsed.error.issues.map((i: { path: (string | number)[]; message: string }) => `${i.path.join(".")}: ${i.message}`).join("; ")}` });
      return;
    }
    data = parsed.data;
  }
  const [row] = await db.insert(siteContentTable)
    .values({ section: rawSection, data, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteContentTable.section, set: { data, updatedAt: new Date() } })
    .returning();
  res.json({ section: row.section, data: row.data });
});

router.post("/admin/import-products", async (req, res): Promise<void> => {
  const { products, images, deleteIds, keepOnlyIds } = req.body as {
    products?: Array<Record<string, unknown>>;
    images?: Array<{ id: number; productId: number; imageUrl: string; sortOrder?: number }>;
    deleteIds?: number[];
    keepOnlyIds?: number[];
    categories?: Array<Record<string, unknown>>;
  };
  const categories = (req.body as { categories?: Array<Record<string, unknown>> }).categories;
  const siteContent = (req.body as { siteContent?: Array<{ section: string; data: unknown }> }).siteContent;
  const hasSiteContent = Array.isArray(siteContent) && siteContent.length > 0;
  const hasCategories = Array.isArray(categories) && categories.length > 0;
  const hasProducts = Array.isArray(products) && products.length > 0;
  const hasImages = Array.isArray(images) && images.length > 0;
  const hasDeleteIds = Array.isArray(deleteIds) && deleteIds.length > 0;
  const hasKeepOnly = Array.isArray(keepOnlyIds) && keepOnlyIds.length > 0;
  if (!hasProducts && !hasImages && !hasDeleteIds && !hasKeepOnly && !hasCategories && !hasSiteContent) {
    res.status(400).json({ error: "products, images, categories, siteContent, deleteIds or keepOnlyIds required" });
    return;
  }
  const result = await db.transaction(async (tx) => {
    let siteContentUpserted = 0;
    if (hasSiteContent) {
      for (const sc of siteContent!) {
        if (!sc.section || typeof sc.data !== "object" || sc.data === null) continue;
        await tx.insert(siteContentTable)
          .values({ section: sc.section, data: sc.data, updatedAt: new Date() })
          .onConflictDoUpdate({ target: siteContentTable.section, set: { data: sc.data, updatedAt: new Date() } });
        siteContentUpserted++;
      }
    }
    let categoriesUpserted = 0;
    if (hasCategories) {
      for (const c of categories!) {
        const catRow = {
          id: c.id as number,
          name: c.name as string,
          slug: c.slug as string,
          imageUrl: (c.imageUrl as string | null) ?? null,
        };
        const { id: catId, ...catUpdates } = catRow;
        await tx.insert(categoriesTable).values(catRow)
          .onConflictDoUpdate({ target: categoriesTable.id, set: catUpdates });
        categoriesUpserted++;
      }
      await tx.execute(sql`SELECT setval(pg_get_serial_sequence('categories','id'), (SELECT COALESCE(MAX(id),1) FROM categories))`);
    }
    let deleted = 0;
    if (hasDeleteIds || hasKeepOnly) {
      const explicit = hasDeleteIds ? deleteIds!.filter((n) => Number.isInteger(n)) : [];
      let staleIds: number[] = explicit;
      if (hasKeepOnly) {
        const keep = keepOnlyIds!.filter((n) => Number.isInteger(n));
        if (keep.length > 0) {
          const keepList = sql.raw(`ARRAY[${keep.join(",")}]::int[]`);
          const stale = await tx.execute(sql`SELECT id FROM products WHERE NOT (id = ANY(${keepList}))`);
          staleIds = staleIds.concat(stale.rows.map((r) => Number(r.id)));
        }
      }
      staleIds = [...new Set(staleIds)];
      if (staleIds.length > 0) {
        const idList = sql.raw(`ARRAY[${staleIds.join(",")}]::int[]`);
        await tx.execute(sql`DELETE FROM cart_items WHERE product_id = ANY(${idList})`);
        await tx.execute(sql`DELETE FROM wishlist WHERE product_id = ANY(${idList})`);
        await tx.execute(sql`DELETE FROM product_images WHERE product_id = ANY(${idList})`);
        await tx.execute(sql`DELETE FROM products WHERE id = ANY(${idList})`);
        deleted = staleIds.length;
      }
    }
    let upserted = 0;
    if (hasProducts) {
      for (const p of products!) {
        const row = {
          id: p.id as number,
          name: p.name as string,
          slug: p.slug as string,
          sku: p.sku as string,
          description: (p.description as string) ?? "",
          specifications: (p.specifications as string | null) ?? null,
          warranty: (p.warranty as string | null) ?? null,
          price: String(p.price),
          mrp: String(p.mrp),
          gstPercent: String(p.gstPercent ?? 18),
          categoryId: p.categoryId as number,
          imageUrl: (p.imageUrl as string | null) ?? null,
          rating: String(p.rating ?? "4.0"),
          reviewCount: (p.reviewCount as number) ?? 0,
          inStock: (p.inStock as boolean) ?? true,
          isFeatured: (p.isFeatured as boolean) ?? false,
          isNew: (p.isNew as boolean) ?? false,
        };
        const { id, ...updates } = row;
        await tx.insert(productsTable).values(row)
          .onConflictDoUpdate({ target: productsTable.id, set: updates });
        upserted++;
      }
    }
    let imagesUpserted = 0;
    if (hasImages) {
      for (const img of images!) {
        const imgRow = { id: img.id, productId: img.productId, imageUrl: img.imageUrl, sortOrder: img.sortOrder ?? 0 };
        const { id: imgId, ...imgUpdates } = imgRow;
        await tx.insert(productImagesTable).values(imgRow)
          .onConflictDoUpdate({ target: productImagesTable.id, set: imgUpdates });
        imagesUpserted++;
      }
    }
    await tx.execute(sql`SELECT setval(pg_get_serial_sequence('products','id'), (SELECT COALESCE(MAX(id),1) FROM products))`);
    await tx.execute(sql`SELECT setval(pg_get_serial_sequence('product_images','id'), (SELECT COALESCE(MAX(id),1) FROM product_images))`);
    return { upserted, imagesUpserted, deleted, categoriesUpserted, siteContentUpserted };
  });
  res.json({ success: true, products: result.upserted, images: result.imagesUpserted, deleted: result.deleted, categories: result.categoriesUpserted, siteContent: result.siteContentUpserted });
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
