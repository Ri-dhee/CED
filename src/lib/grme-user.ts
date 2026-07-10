"use client";

import { useState, useCallback, useEffect } from "react";
import { CITIES, THROMDES, Domain, Indicator } from "./grme-data";

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
  allowedDomainIds?: string[];
  allowedIndicatorIds?: string[];
  allowedDzongkhagIds?: string[];
  allowedThromdeIds?: string[];
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

function getIndicatorDomainId(domains: Domain[] | undefined, indicatorId: string): string | null {
  if (!domains) return null;
  for (const domain of domains) {
    if (domain.subdomains.some((subdomain) => subdomain.indicators.some((indicator) => indicator.id === indicatorId))) {
      return domain.id;
    }
  }
  return null;
}

function getThromdeDzongkhagId(
  thromdeId: string,
  availableThromdes: { id: string; dzongkhagId: string; name: string }[] = THROMDES
): string | null {
  return availableThromdes.find((thromde) => thromde.id === thromdeId)?.dzongkhagId || null;
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

export function canAccessThromde(
  user: GrmeUser,
  thromdeId: string,
  availableThromdes: { id: string; dzongkhagId: string; name: string }[] = THROMDES
): boolean {
  if (user.role === "admin") return true;
  if (!thromdeId) return false;

  const dzongkhagId = getThromdeDzongkhagId(thromdeId, availableThromdes);
  if (dzongkhagId && user.allowedDzongkhagIds?.includes(dzongkhagId)) return true;

  const allowedThromdeIds = user.allowedThromdeIds || [];
  if (allowedThromdeIds.includes(thromdeId)) return true;

  if (dzongkhagId && user.scope.dzongkhagId === dzongkhagId) return true;
  return user.scope.thromdeId === thromdeId;
}

/** Returns the list of dzongkhags a user is allowed to see. */
export function getAccessibleDzongkhags(
  user: GrmeUser,
  availableDzongkhags: { id: string; name: string }[] = CITIES,
  availableThromdes: { id: string; dzongkhagId: string; name: string }[] = THROMDES
): { id: string; name: string }[] {
  if (user.role === "admin") return availableDzongkhags;
  const visibleIds = new Set<string>();

  if (user.scope.dzongkhagId) visibleIds.add(user.scope.dzongkhagId);
  for (const id of user.allowedDzongkhagIds || []) visibleIds.add(id);
  for (const thromdeId of user.allowedThromdeIds || []) {
    const dzongkhagId = getThromdeDzongkhagId(thromdeId, availableThromdes);
    if (dzongkhagId) visibleIds.add(dzongkhagId);
  }
  if (user.scope.thromdeId) {
    const dzongkhagId = getThromdeDzongkhagId(user.scope.thromdeId, availableThromdes);
    if (dzongkhagId) visibleIds.add(dzongkhagId);
  }

  return availableDzongkhags.filter((city) => visibleIds.has(city.id));
}

/** True if the user can edit data in the given dzongkhag. */
export function canAccessDzongkhag(
  user: GrmeUser,
  dzongkhagId: string,
  availableThromdes: { id: string; dzongkhagId: string; name: string }[] = THROMDES
): boolean {
  if (user.role === "admin") return true;
  if (user.allowedDzongkhagIds?.includes(dzongkhagId)) return true;
  if (user.allowedThromdeIds?.some((thromdeId) => getThromdeDzongkhagId(thromdeId, availableThromdes) === dzongkhagId)) return true;
  return user.scope.dzongkhagId === dzongkhagId;
}

export function canAccessIndicator(
  user: GrmeUser,
  indicator: Indicator,
  domains?: Domain[]
): boolean {
  if (user.role === "admin") return true;
  if (user.allowedIndicatorIds?.includes(indicator.id)) return true;
  const domainId = getIndicatorDomainId(domains, indicator.id);
  if (domainId && user.allowedDomainIds?.includes(domainId)) return true;
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

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/grme/session", { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json().catch(() => ({}));
      const next = normalizeUser(json.user);
      setUser(next);
    } catch {
      // Keep current session state if refresh fails.
    }
  }, []);

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

  useEffect(() => {
    const handleFocus = () => {
      refreshUser();
    };

    const timer = window.setInterval(() => {
      refreshUser();
    }, 30000);

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(timer);
    };
  }, [refreshUser]);

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
