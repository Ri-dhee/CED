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

async function loadSessionUser(): Promise<GrmeUser | null> {
  try {
    const res = await fetch("/api/grme/session", { credentials: "include" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user || null;
  } catch {
    return null;
  }
}

async function saveSessionUser(
  name: string,
  role: UserRole,
  password?: string
): Promise<{ success: boolean; error?: string; user?: GrmeUser }> {
  try {
    const res = await fetch("/api/grme/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error || "Login failed" };
    }
    return { success: true, user: json.user };
  } catch {
    return { success: false, error: "Unable to contact session service" };
  }
}

async function clearSessionUser(): Promise<void> {
  try {
    await fetch("/api/grme/session", {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    // ignore
  }
}

// ── Hook ────────────────────────────────────────────────────────

export function useGrmeUser() {
  const [user, setUser] = useState<GrmeUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const sessionUser = await loadSessionUser();
      if (cancelled) return;
      if (sessionUser) {
        setUser(sessionUser);
        saveUser(sessionUser);
      } else {
        setUser(loadUser());
      }
      setLoaded(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (name: string, role: UserRole, password?: string) => {
    const result = await saveSessionUser(name.trim(), role, password);
    if (!result.success || !result.user) return result;
    saveUser(result.user);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearSessionUser().catch(() => {});
    clearUser();
    setUser(null);
  }, []);

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!user) return;
      const updated = { ...user, role };
      saveUser(updated);
      setUser(updated);
      fetch("/api/grme/session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: updated.name, role }),
      }).catch(() => {});
    },
    [user]
  );

  return { user, loaded, login, logout, switchRole };
}
