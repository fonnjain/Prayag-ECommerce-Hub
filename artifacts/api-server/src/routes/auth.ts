import { Router, type IRouter } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable, passwordResetsTable } from "@workspace/db";
import { eq, and, isNull, gt, desc } from "drizzle-orm";
import { logger } from "../lib/logger";
import { sendPasswordResetEmail } from "../lib/email";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

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
  // Public registration is always "customer" — business roles are assigned by admin only
  void role;
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, phone, role: "customer" }).returning();
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

const RESET_WINDOW_MS = 15 * 60 * 1000;
const forgotAttempts = new Map<string, { count: number; windowStart: number }>();

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const email = (req.body?.email || "").toString().trim().toLowerCase();
  if (!email) { res.status(400).json({ error: "email required" }); return; }

  // Simple rate limit: max 3 requests per email per 15 minutes
  const now = Date.now();
  const attempt = forgotAttempts.get(email);
  if (attempt && now - attempt.windowStart < RESET_WINDOW_MS) {
    if (attempt.count >= 3) {
      res.json({ success: true, message: "If an account exists, a reset code has been sent." });
      return;
    }
    attempt.count++;
  } else {
    forgotAttempts.set(email, { count: 1, windowStart: now });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (user) {
    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    await db.insert(passwordResetsTable).values({
      userId: user.id, codeHash, expiresAt: new Date(now + RESET_WINDOW_MS),
    });
    const sent = await sendPasswordResetEmail({ to: user.email, name: user.name, code });
    if (!sent) logger.warn({ email }, "Password reset email could not be sent");
  }
  // Always the same response, so attackers can't discover registered emails
  res.json({ success: true, message: "If an account exists, a reset code has been sent." });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const email = (req.body?.email || "").toString().trim().toLowerCase();
  const code = (req.body?.code || "").toString().trim();
  const newPassword = (req.body?.newPassword || "").toString();
  if (!email || !code || !newPassword) {
    res.status(400).json({ error: "email, code and newPassword required" });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) { res.status(400).json({ error: "Invalid or expired code" }); return; }

  const [reset] = await db.select().from(passwordResetsTable)
    .where(and(
      eq(passwordResetsTable.userId, user.id),
      isNull(passwordResetsTable.usedAt),
      gt(passwordResetsTable.expiresAt, new Date()),
    ))
    .orderBy(desc(passwordResetsTable.createdAt)).limit(1);
  if (!reset || !(await bcrypt.compare(code, reset.codeHash))) {
    res.status(400).json({ error: "Invalid or expired code" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.transaction(async (tx) => {
    await tx.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
    // Invalidate ALL outstanding reset codes for this user, not just the one used
    await tx.update(passwordResetsTable).set({ usedAt: new Date() })
      .where(and(eq(passwordResetsTable.userId, user.id), isNull(passwordResetsTable.usedAt)));
  });
  logger.info({ userId: user.id }, "Password reset completed");
  res.json({ success: true, message: "Password reset successfully. Please sign in with your new password." });
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
