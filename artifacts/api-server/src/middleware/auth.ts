import jwt from "jsonwebtoken";
import type { Request, RequestHandler } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

export interface AuthUser {
  id: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      /** Populated only by the shared authentication middleware. */
      auth?: AuthUser;
    }
  }
}

export const BUSINESS_ROLES = ["dealer", "distributor", "admin"] as const;

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

/**
 * Verifies JWT integrity and extracts a strictly positive numeric subject.
 * The token's role is intentionally ignored: authorization always uses the
 * user's current database role below.
 */
function verifyTokenSubject(req: Request): number | null {
  const token = readBearerToken(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET!, { algorithms: ["HS256"] });
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return null;
    }
    const id = (payload as Record<string, unknown>).id;
    return typeof id === "number" && Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

/**
 * Resolves a valid JWT to a currently active database user. This makes role
 * changes, user deletion, and account deactivation take effect immediately,
 * even for tokens issued before those changes.
 */
export async function authenticateRequest(req: Request): Promise<AuthUser | null> {
  const id = verifyTokenSubject(req);
  if (!id) return null;

  const [user] = await db
    .select({ id: usersTable.id, role: usersTable.role, isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  if (!user || !user.isActive) return null;
  return { id: user.id, role: user.role };
}

/** Attaches current auth when available, without rejecting guest requests. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const auth = await authenticateRequest(req);
    if (auth) req.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
};

/** Rejects missing, malformed, expired, inactive, or deleted accounts. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
};

/** Rejects unauthenticated users with 401 and current-role mismatches with 403. */
export function requireRole(...roles: string[]): RequestHandler {
  return async (req, res, next) => {
    try {
      const auth = await authenticateRequest(req);
      if (!auth) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (!roles.includes(auth.role)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      req.auth = auth;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const requireAdmin: RequestHandler = requireRole("admin");
export const requireDealer: RequestHandler = requireRole("dealer", "admin");
export const requireDistributor: RequestHandler = requireRole("distributor", "admin");
export const requireBusiness: RequestHandler = requireRole(...BUSINESS_ROLES);

/** Returns the authenticated user id and fails closed if a guard was omitted. */
export function currentUserId(req: Request): number {
  if (!req.auth) {
    throw new Error("currentUserId() called without shared authentication middleware");
  }
  return req.auth.id;
}

/** True when the current user owns a resource or is a current administrator. */
export function canAccessResource(auth: AuthUser, ownerId: number | null): boolean {
  return auth.role === "admin" || (ownerId !== null && ownerId === auth.id);
}