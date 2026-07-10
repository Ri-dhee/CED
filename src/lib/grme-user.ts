"use client";

import { useState, useCallback, useEffect } from "react";
import { CITIES, Indicator } from "./grme-data";

export type UserRole = "admin" | "editor" | "viewer";

export interface UserScope {
  dzongkhagId: string;
  thromdeId: string | null;
  stakeholderId: string;
}

export interface DataEntryWindowConfig {
  enabled: boolean;
  startAt: string | null;
  endAt: string | null;
}

export interface GrmeUser {
  name: string;
  role: UserRole;
  loginAt: string;
  scope: UserScope;
}

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

const DEFAULT_SCOPE: UserScope = { dzongkhagId: "", thromdeId: null, stakeholderId: "" };

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "editor" || value === "viewer";
}

function isUserScope(value: unknown): value is UserScope {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return typeof s.dzongkhagId === "string" && (s.thromdeId === null || typeof s.thromdeId === "string") && typeof s.stakeholderId === "string";
}

function normalizeUser(value: unknown): GrmeUser | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.name !== "string" || !isUserRole(candidate.role)) return null;
  return {
    name: candidate.name,
    role: candidate.role,
    loginAt: typeof candidate.loginAt === "string" ? candidate.loginAt : new Date().toISOString(),
    scope: isUserScope(candidate.scope) ? candidate.scope : DEFAULT_SCOPE,
  };
}

export function canEditFramework(role: UserRole): boolean {
  return role === "admin";
}

export function canEnterData(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canEnterDataDuringWindow(
  user: GrmeUser,
  window: DataEntryWindowConfig | null,
  now: Date = new Date()
): boolean {
  if (user.role === "admin") return true;
  if (!canEnterData(user.role)) return false;
  if (!window?.enabled) return false;

  const current = now.getTime();
  const start = window.startAt ? new Date(window.startAt).getTime() : Number.NEGATIVE_INFINITY;
  const end = window.endAt ? new Date(window.endAt).getTime() : Number.POSITIVE_INFINITY;
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return current >= start && current <= end;
}

/** Returns the list of dzongkhags a user is allowed to see. */
export function getAccessibleDzongkhags(user: GrmeUser): typeof CITIES {
  if (user.role === "admin") return CITIES;
  if (user.scope.dzongkhagId) {
    const match = CITIES.find((c) => c.id === user.scope.dzongkhagId);
    return match ? [match] : [];
  }
  return [];
}

/** True if the user can edit data in the given dzongkhag. */
export function canAccessDzongkhag(user: GrmeUser, dzongkhagId: string): boolean {
  if (user.role === "admin") return true;
  return user.scope.dzongkhagId === dzongkhagId;
}

/** True if the user can edit a specific indicator (checks stakeholder access). */
export function canAccessIndicator(user: GrmeUser, indicator: Indicator): boolean {
  if (user.role === "admin") return true;
  if (!indicator.stakeholderAccess || indicator.stakeholderAccess.length === 0) return false;
  return indicator.stakeholderAccess.includes(user.scope.stakeholderId);
}

async function loadSessionUser(): Promise<GrmeUser | null> {
  try {
    const res = await fetch("/api/grme/session", { credentials: "include" });
    if (!res.ok) return null;
    const json = await res.json();
    return normalizeUser(json.user);
  } catch {
    return null;
  }
}

async function saveSessionUser(
  name: string,
  role: UserRole,
  password?: string,
  scope?: UserScope
): Promise<{ success: boolean; error?: string; user?: GrmeUser }> {
  try {
    const res = await fetch("/api/grme/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, password, scope }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error || "Login failed" };
    }
    const user = normalizeUser(json.user);
    if (!user) {
      return { success: false, error: "Session service returned invalid user data" };
    }
    return { success: true, user };
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
      }
      setLoaded(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (name: string, role: UserRole, password?: string, scope?: UserScope) => {
    const result = await saveSessionUser(name.trim(), role, password, scope);
    if (!result.success || !result.user) return result;
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearSessionUser().catch(() => {});
    setUser(null);
  }, []);

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!user) return;
      const updated = { ...user, role };
      setUser(updated);
      fetch("/api/grme/session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: updated.name, role, scope: updated.scope }),
      }).catch(() => {});
    },
    [user]
  );

  return { user, loaded, login, logout, switchRole };
}
