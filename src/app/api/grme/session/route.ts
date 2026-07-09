import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import * as api from "@/lib/grme-api";
import { GRME_SESSION_COOKIE, getSessionSecret, GrmeSessionUser } from "@/lib/grme-session";
import { UserRole } from "@/lib/grme-user";
import { hasSupabaseConfig } from "@/lib/supabase";

const BCRYPT_ROUNDS = 12;

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

  // Admin: compare against server-only bcrypt hash
  if (role === "admin") {
    const expected = process.env.ADMIN_PASSWORD_HASH || "";
    if (!expected || !password) return null;
    const valid = await bcrypt.compare(password, expected);
    if (!valid) return null;
    return { name: normalizedName, role: "admin", loginAt: new Date().toISOString() };
  }

  if (!password && existingSession?.role === "admin") {
    return { name: existingSession.name, role, loginAt: new Date().toISOString() };
  }

  const users = hasSupabaseConfig ? await api.loadUsers().catch(() => []) : [];
  const found = users.find((u) => u.name.toLowerCase() === normalizedName.toLowerCase() && u.active);

  if (found) {
    if (!password) return null;
    const valid = await bcrypt.compare(password, found.passwordHash);
    if (!valid) return null;
    return { name: found.name, role: found.role, loginAt: new Date().toISOString() };
  }

  if (users.length === 0) {
    return { name: normalizedName, role, loginAt: new Date().toISOString() };
  }

  return null;
}

export async function GET(request: Request) {
  const user = getExistingSession(request);

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
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