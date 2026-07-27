import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { db, distributorsTable, distributorSchemesTable, ordersTable } from "@workspace/db";
import { eq, ilike, or, and, sql, type SQL } from "drizzle-orm";

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

async function handleNetworkList(req: any, res: any, customerType: "Distributors" | "Direct Dealers"): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = 25;

  const conditions: SQL[] = [eq(distributorsTable.customerType, customerType)];
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(distributorsTable.businessName, pattern),
        ilike(distributorsTable.contactName, pattern),
        ilike(distributorsTable.city, pattern),
        ilike(distributorsTable.territory, pattern),
        ilike(distributorsTable.pincode, pattern),
      )!,
    );
  }
  if (state) conditions.push(ilike(distributorsTable.state, state));
  const where = and(...conditions);

  const [rows, totalRes, statesRes] = await Promise.all([
    db.select().from(distributorsTable)
      .where(where)
      .orderBy(distributorsTable.businessName)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(distributorsTable).where(where),
    db.selectDistinct({ state: distributorsTable.state })
      .from(distributorsTable)
      .where(eq(distributorsTable.customerType, customerType))
      .orderBy(distributorsTable.state),
  ]);
  const total = totalRes[0]?.count ?? 0;
  res.json({
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    states: statesRes.map(s => s.state).filter(Boolean),
    distributors: rows.map(d => ({
      id: d.id, distributorCode: d.distributorCode, businessName: d.businessName, contactName: d.contactName,
      phone: d.phone, alternateContact1: d.alternateContact1, contact1Dob: d.contact1Dob,
      contactPerson2: d.contactPerson2, contactNumber2: d.contactNumber2,
      alternateContact2: d.alternateContact2, contact2Dob: d.contact2Dob,
      anniversaryDate: d.anniversaryDate, email: d.email, category: d.category,
      address: d.address, city: d.city, state: d.state, district: d.territory,
      pincode: d.pincode, area: d.area, gstNumber: d.gstNumber, territory: d.territory,
      status: d.status, dateCreated: d.dateCreated, createdBy: d.createdBy,
      customerType: d.customerType, authorisedDate: d.authorisedDate,
      assignedSegment: d.assignedSegment, assignedUser: d.assignedUser,
      customerBranding: d.customerBranding,
    })),
  });
}

router.get("/distributor/network", async (req, res): Promise<void> => {
  await handleNetworkList(req, res, "Distributors");
});

router.get("/direct-dealer/network", async (req, res): Promise<void> => {
  await handleNetworkList(req, res, "Direct Dealers");
});

router.get("/distributor/network/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const rows = await db.select().from(distributorsTable).where(eq(distributorsTable.id, id)).limit(1);
  if (!rows[0]) { res.status(404).json({ error: "Distributor not found" }); return; }
  const d = rows[0];
  res.json({
    id: d.id, distributorCode: d.distributorCode, businessName: d.businessName,
    contactName: d.contactName, phone: d.phone, alternateContact1: d.alternateContact1,
    contact1Dob: d.contact1Dob, contactPerson2: d.contactPerson2, contactNumber2: d.contactNumber2,
    alternateContact2: d.alternateContact2, contact2Dob: d.contact2Dob,
    anniversaryDate: d.anniversaryDate, email: d.email, category: d.category,
    address: d.address, state: d.state, district: d.territory, city: d.city,
    pincode: d.pincode, area: d.area, gstNumber: d.gstNumber, status: d.status,
    dateCreated: d.dateCreated, createdBy: d.createdBy, customerType: d.customerType,
    authorisedDate: d.authorisedDate, profileImgUrl: d.profileImgUrl,
    visitingCardUrl: d.visitingCardUrl, passbookImgUrl: d.passbookImgUrl,
    assignedSegment: d.assignedSegment, assignedUser: d.assignedUser,
    customerBranding: d.customerBranding,
  });
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
