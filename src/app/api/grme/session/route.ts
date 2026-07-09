import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import * as api from "@/lib/grme-api";
import { GRME_SESSION_COOKIE, getSessionSecret, GrmeSessionUser } from "@/lib/grme-session";
import { UserRole, UserScope } from "@/lib/grme-user";
import { hasSupabaseConfig } from "@/lib/supabase";

const DEFAULT_SCOPE: UserScope = { dzongkhagId: "", thromdeId: null, stakeholderId: "" };

// ── Rate limiter (in-memory, best-effort across serverless instances) ──

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 10;

const attemptStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = attemptStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + LOGIN_WINDOW_MS };
    attemptStore.set(ip, entry);
  }

  entry.count++;
  const remaining = Math.max(0, LOGIN_MAX_ATTEMPTS - entry.count);

  // Periodic cleanup
  if (attemptStore.size > 10000) {
    for (const [key, val] of attemptStore) {
      if (now >= val.resetAt) attemptStore.delete(key);
    }
  }

  return { allowed: entry.count <= LOGIN_MAX_ATTEMPTS, remaining, resetAt: entry.resetAt };
}

function getClientIP(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
         request.headers.get("x-real-ip") ||
         "127.0.0.1";
}

// ── Session helpers ──────────────────────────────────────────────

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodeSession(user: GrmeSessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function decodeSession(token: string): GrmeSessionUser | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GrmeSessionUser;
  } catch {
    return null;
  }
}

function getExistingSession(request: Request): GrmeSessionUser | null {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${GRME_SESSION_COOKIE}=`))
    ?.split("=")[1];

  return token ? decodeSession(token) : null;
}

async function verifyLogin(
  name: string,
  role: UserRole,
  password?: string,
  existingSession?: GrmeSessionUser | null
): Promise<GrmeSessionUser | null> {
  const normalizedName = name.trim();
  if (!normalizedName) return null;

  if (role === "admin") {
    const expected = process.env.ADMIN_PASSWORD_HASH || "";
    if (!expected || !password) return null;
    const valid = await bcrypt.compare(password, expected);
    if (!valid) return null;
    return { name: normalizedName, role: "admin", loginAt: new Date().toISOString(), scope: DEFAULT_SCOPE };
  }

  if (!password && existingSession?.role === "admin") {
    return {
      name: existingSession.name,
      role,
      loginAt: new Date().toISOString(),
      scope: existingSession.scope || DEFAULT_SCOPE,
    };
  }

  const users = hasSupabaseConfig ? await api.loadUsers().catch(() => []) : [];
  const found = users.find((u) => u.name.toLowerCase() === normalizedName.toLowerCase() && u.active);

  if (found) {
    if (!password) return null;
    const valid = await bcrypt.compare(password, found.passwordHash);
    if (!valid) return null;
    return {
      name: found.name,
      role: found.role,
      loginAt: new Date().toISOString(),
      scope: {
        dzongkhagId: found.dzongkhagId,
        thromdeId: found.thromdeId,
        stakeholderId: found.stakeholderId,
      },
    };
  }

  return null;
}

// ── Route handlers ───────────────────────────────────────────────

export async function GET(request: Request) {
  const user = getExistingSession(request);
  return NextResponse.json({ user: user || null });
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, remaining, resetAt } = rateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later.", remaining, resetAt },
      { status: 429 }
    );
  }

  const existingSession = getExistingSession(request);
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "");
  const role = String(body.role || "viewer") as UserRole;
  const password = body.password ? String(body.password) : undefined;

  const user = await verifyLogin(name, role, password, existingSession);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = encodeSession(user);
  const response = NextResponse.json({ user });
  response.cookies.set(GRME_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(GRME_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
