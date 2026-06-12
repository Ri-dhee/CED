"use client";

import { useState, useCallback, useEffect } from "react";

export type UserRole = "admin" | "editor" | "viewer";

export interface GrmeUser {
  name: string;
  role: UserRole;
  loginAt: string;
}

const STORAGE_KEY = "grme-user";

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
