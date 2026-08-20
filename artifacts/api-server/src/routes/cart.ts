import { Router, type IRouter } from "express";
import { db, cartSessionsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCartSessionId } from "../middleware/cart-session";

const router: IRouter = Router();

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
      inStock: p.inStock,
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
  const sessionId = getCartSessionId(req, res);
  const cart = await getOrCreateCart(sessionId);
  res.json(await buildCartResponse(cart.id, cart.couponCode));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const { productId, quantity } = req.body;
  if (
    typeof productId !== "number" || !Number.isSafeInteger(productId) || productId <= 0 ||
    typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity <= 0
  ) {
    res.status(400).json({ error: "productId and quantity must be positive integers" });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  if (!product.inStock) { res.status(400).json({ error: "This product is no longer available" }); return; }
  const sessionId = getCartSessionId(req, res);
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
  const itemId = Number(rawId);
  const { quantity } = req.body;
  if (!Number.isSafeInteger(itemId) || itemId <= 0 || typeof quantity !== "number" || !Number.isSafeInteger(quantity)) {
    res.status(400).json({ error: "itemId and quantity must be integers" });
    return;
  }
  const sessionId = getCartSessionId(req, res);
  const cart = await getOrCreateCart(sessionId);
  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.cartId, cart.id)));
  } else {
    await db.update(cartItemsTable).set({ quantity }).where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.cartId, cart.id)));
  }
  res.json(await buildCartResponse(cart.id, cart.couponCode));
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const itemId = Number(rawId);
  if (!Number.isSafeInteger(itemId) || itemId <= 0) {
    res.status(400).json({ error: "Invalid itemId" });
    return;
  }
  const sessionId = getCartSessionId(req, res);
  const cart = await getOrCreateCart(sessionId);
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.cartId, cart.id)));
  res.json(await buildCartResponse(cart.id, cart.couponCode));
});

router.post("/cart/apply-coupon", async (req, res): Promise<void> => {
  const { code } = req.body;
  if (typeof code !== "string") { res.status(400).json({ error: "Coupon code required" }); return; }
  const sessionId = getCartSessionId(req, res);
  const cart = await getOrCreateCart(sessionId);
  const validCoupons = ["PRAYAG10"];
  if (!validCoupons.includes(code)) { res.status(400).json({ error: "Invalid coupon" }); return; }
  await db.update(cartSessionsTable).set({ couponCode: code }).where(eq(cartSessionsTable.id, cart.id));
  res.json(await buildCartResponse(cart.id, code));
});

export default router;
