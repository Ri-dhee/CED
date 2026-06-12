"use client";

import { useState, useCallback, useEffect } from "react";

export type UserRole = "admin" | "editor" | "viewer";

export interface GrmeUser {
  name: string;
  role: UserRole;
  loginAt: string;
}

const STORAGE_KEY = "grme-user";
const ADMIN_PASSWORD_HASH =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || "";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: "#fef2f2", text: "#dc2626" },
  editor: { bg: "#eff6ff", text: "#2563eb" },
  viewer: { bg: "#f0fdf4", text: "#16a34a" },
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full access: edit framework, enter data, review proposals",
  editor: "Enter assessment data and add review notes",
  viewer: "View dashboard and data only",
};

export function canEditFramework(role: UserRole): boolean {
  return role === "admin";
}

export function canEnterData(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canReviewProposals(role: UserRole): boolean {
  return role === "admin";
}

// ── Password Verification (SHA-256 via Web Crypto) ──────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) return false;
  const hash = await hashPassword(password);
  return hash === ADMIN_PASSWORD_HASH;
}

export function isPasswordConfigured(): boolean {
  return ADMIN_PASSWORD_HASH.length > 0;
}

// ── User Storage ────────────────────────────────────────────────

export function loadUser(): GrmeUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: GrmeUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ── Hook ────────────────────────────────────────────────────────

export function useGrmeUser() {
  const [user, setUser] = useState<GrmeUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setLoaded(true);
  }, []);

  const login = useCallback((name: string, role: UserRole) => {
    const u: GrmeUser = {
      name: name.trim(),
      role,
      loginAt: new Date().toISOString(),
    };
    saveUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearUser();
    setUser(null);
  }, []);

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!user) return;
      const updated = { ...user, role };
      saveUser(updated);
      setUser(updated);
    },
    [user]
  );

  return { user, loaded, login, logout, switchRole };
}
