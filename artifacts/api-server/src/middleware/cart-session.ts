import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";

const CART_SESSION_COOKIE = "prayag_cart_session";
const CART_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readCookie(req: Request, name: string): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  for (const entry of cookies.split(";")) {
    const [key, ...value] = entry.trim().split("=");
    if (key === name) return value.join("=") || null;
  }
  return null;
}

/**
 * Returns an unguessable, browser-scoped cart session. IP addresses and
 * caller-provided headers are deliberately never used as cart identities.
 */
export function getCartSessionId(req: Request, res: Response): string {
  const existing = readCookie(req, CART_SESSION_COOKIE);
  if (existing && UUID_PATTERN.test(existing)) return existing;

  const sessionId = randomUUID();
  res.cookie(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_SESSION_MAX_AGE_MS,
    path: "/",
  });
  return sessionId;
}