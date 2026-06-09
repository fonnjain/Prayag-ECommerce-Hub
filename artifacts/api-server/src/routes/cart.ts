import { Router, type IRouter } from "express";
import { db, cartSessionsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function getSessionId(req: any): string {
  return req.headers["x-session-id"] as string || req.ip || "default";
}

async function getOrCreateCart(sessionId: string) {
  let [cart] = await db.select().from(cartSessionsTable).where(eq(cartSessionsTable.sessionId, sessionId));
  if (!cart) {
    [cart] = await db.insert(cartSessionsTable).values({ sessionId }).returning();
  }
  return cart;
}

async function buildCartResponse(cartId: number, couponCode?: string | null) {
  const items = await db
    .select({ ci: cartItemsTable, p: productsTable })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.cartId, cartId));

  const cartItems = items.map(({ ci, p }) => {
    const price = parseFloat(p.price as string);
    return {
      id: ci.id,
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      imageUrl: p.imageUrl,
      price,
      quantity: ci.quantity,
      subtotal: price * ci.quantity,
    };
  });

  const subtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal > 5000 ? 0 : 150;
  const discount = couponCode === "PRAYAG10" ? Math.round(subtotal * 0.1 * 100) / 100 : 0;

  return {
    items: cartItems,
    subtotal,
    gst,
    shipping,
    discount,
    couponCode: couponCode || null,
    total: subtotal + gst + shipping - discount,
    itemCount: cartItems.reduce((s, i) => s + i.quantity, 0),
  };
}

router.get("/cart", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const cart = await getOrCreateCart(sessionId);
  res.json(await buildCartResponse(cart.id, cart.couponCode));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) { res.status(400).json({ error: "productId and quantity required" }); return; }
  const sessionId = getSessionId(req);
  const cart = await getOrCreateCart(sessionId);
  const [existing] = await db.select().from(cartItemsTable).where(and(eq(cartItemsTable.cartId, cart.id), eq(cartItemsTable.productId, productId)));
  if (existing) {
    await db.update(cartItemsTable).set({ quantity: existing.quantity + quantity }).where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ cartId: cart.id, productId, quantity });
  }
  res.json(await buildCartResponse(cart.id, cart.couponCode));
});

router.patch("/cart/items/:itemId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const itemId = parseInt(rawId, 10);
  const { quantity } = req.body;
  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));
  } else {
    await db.update(cartItemsTable).set({ quantity }).where(eq(cartItemsTable.id, itemId));
  }
  const sessionId = getSessionId(req);
  const cart = await getOrCreateCart(sessionId);
  res.json(await buildCartResponse(cart.id, cart.couponCode));
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const itemId = parseInt(rawId, 10);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));
  const sessionId = getSessionId(req);
  const cart = await getOrCreateCart(sessionId);
  res.json(await buildCartResponse(cart.id, cart.couponCode));
});

router.post("/cart/apply-coupon", async (req, res): Promise<void> => {
  const { code } = req.body;
  const sessionId = getSessionId(req);
  const cart = await getOrCreateCart(sessionId);
  const validCoupons = ["PRAYAG10"];
  if (!validCoupons.includes(code)) { res.status(400).json({ error: "Invalid coupon" }); return; }
  await db.update(cartSessionsTable).set({ couponCode: code }).where(eq(cartSessionsTable.id, cart.id));
  res.json(await buildCartResponse(cart.id, code));
});

export default router;
