import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "prayag-secret-2024";

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, password required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, phone, role: role || "customer" }).returning();
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, createdAt: user.createdAt } });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, createdAt: user.createdAt } });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, createdAt: user.createdAt?.toISOString() });
  } catch (e) {
    logger.warn({ err: e }, "JWT verify failed");
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
