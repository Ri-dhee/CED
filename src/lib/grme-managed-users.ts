"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UserRole } from "./grme-user";
import * as api from "./grme-api";
import { supabase, isStrictFreeTierMode } from "./supabase";

export interface ManagedUser {
  id: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
  active: boolean;
  stakeholderId: string;
  dzongkhagId: string;
  thromdeId: string | null;
  allowedDomainIds: string[];
  allowedIndicatorIds: string[];
  allowedDzongkhagIds: string[];
  allowedThromdeIds: string[];
}

const STORAGE_KEY = "grme-managed-users";

function isManagedUser(value: unknown): value is ManagedUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    (user.role === "admin" || user.role === "editor" || user.role === "viewer") &&
    typeof user.passwordHash === "string" &&
    typeof user.createdAt === "string" &&
    (typeof user.lastLoginAt === "string" || user.lastLoginAt === null) &&
    typeof user.active === "boolean" &&
    typeof user.stakeholderId === "string" &&
    typeof user.dzongkhagId === "string"
  );
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeManagedUser(value: unknown): ManagedUser | null {
  if (!isManagedUser(value)) return null;
  const user = value as ManagedUser;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    active: user.active,
    stakeholderId: user.stakeholderId,
    dzongkhagId: user.dzongkhagId,
    thromdeId: user.thromdeId,
    allowedDomainIds: toStringArray(user.allowedDomainIds),
    allowedIndicatorIds: toStringArray(user.allowedIndicatorIds),
    allowedDzongkhagIds: toStringArray(user.allowedDzongkhagIds),
    allowedThromdeIds: toStringArray(user.allowedThromdeIds),
  };
}

function sanitizeUsers(value: unknown): ManagedUser[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeManagedUser).filter((user): user is ManagedUser => Boolean(user));
}

// ── Password hashing ────────────────────────────────────────────

// Client-side hash uses async subtle — the actual hashing is done
// server-side via bcrypt in the API route. This stub exists for
// fallback local-only mode; in production the API does bcrypt.compare.
export async function hashPassword(password: string): Promise<string> {
  // For client-side fallback, still use SHA-256 as a basic obfuscation.
  // Production always compares via bcrypt on the server.
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Storage Helpers ─────────────────────────────────────────────

function loadUsers(): ManagedUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeUsers(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: ManagedUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    // Sync to API (fire-and-forget)
    api.saveUsers(users).catch(() => {});
  } catch (e) {
    console.error("Failed to save managed users:", e);
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

// ── Public API ──────────────────────────────────────────────────

export async function verifyUserPassword(
  userId: string,
  password: string
): Promise<boolean> {
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);
  if (!user || !user.active) return false;
  const hash = await hashPassword(password);
  return hash === user.passwordHash;
}

export async function verifyUserByName(
  name: string,
  password: string
): Promise<ManagedUser | null> {
  const users = loadUsers();
  const user = users.find(
    (u) => u.name.toLowerCase() === name.toLowerCase() && u.active
  );
  if (!user) return null;
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return null;
  return user;
}

export function getUserById(id: string): ManagedUser | null {
  const users = loadUsers();
  return users.find((u) => u.id === id) || null;
}

export function getAllUsers(): ManagedUser[] {
  return loadUsers();
}

export function getActiveUsers(): ManagedUser[] {
  return loadUsers().filter((u) => u.active);
}

// ── Hook ────────────────────────────────────────────────────────

export function useManagedUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef<number>(0);

  const refreshUsers = useCallback(async (): Promise<boolean> => {
    if (refreshPromiseRef.current) {
      await refreshPromiseRef.current;
      return lastRefreshAtRef.current > 0;
    }

    let loadedRemote = false;
    const run = (async () => {
      try {
        const apiUsers = await api.loadUsers();
        const sanitized = sanitizeUsers(apiUsers);
        setUsers(sanitized);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        lastRefreshAtRef.current = Date.now();
        loadedRemote = true;
      } catch {
        // Keep current state
      }
    })();

    refreshPromiseRef.current = run.finally(() => {
      refreshPromiseRef.current = null;
    });

    await refreshPromiseRef.current;
    return loadedRemote;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const loadedRemote = await refreshUsers();
      if (!cancelled && !loadedRemote) {
        setUsers(loadUsers());
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Real-time subscription — auto-refresh when users change
  useEffect(() => {
    if (isStrictFreeTierMode) return;
    const channel = supabase()
      .channel("users-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "managed_users" },
          async () => {
            if (Date.now() - lastRefreshAtRef.current < 30000) return;
            await refreshUsers();
        }
      )
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, [refreshUsers]);

  const addUser = useCallback(
    async (
      name: string,
      role: UserRole,
      password: string,
      stakeholderId?: string,
      dzongkhagId?: string,
      thromdeId?: string,
      permissions?: {
        allowedDomainIds?: string[];
        allowedIndicatorIds?: string[];
        allowedDzongkhagIds?: string[];
        allowedThromdeIds?: string[];
      }
    ): Promise<{ success: boolean; error?: string }> => {
      const existing = loadUsers();
      if (
        existing.some(
          (u) => u.name.toLowerCase() === name.toLowerCase() && u.active
        )
      ) {
        return { success: false, error: "A user with this name already exists" };
      }

      const passwordHash = await hashPassword(password);
      const newUser: ManagedUser = {
        id: generateId(),
        name: name.trim(),
        role,
        passwordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        active: true,
        stakeholderId: role === "admin" ? "" : (stakeholderId || "planning"),
        dzongkhagId: role === "admin" ? "" : (dzongkhagId || "thimphu"),
        thromdeId: thromdeId || null,
        allowedDomainIds: permissions?.allowedDomainIds || [],
        allowedIndicatorIds: permissions?.allowedIndicatorIds || [],
        allowedDzongkhagIds: permissions?.allowedDzongkhagIds || [],
        allowedThromdeIds: permissions?.allowedThromdeIds || [],
      };

      const updated = [...existing, newUser];
      saveUsers(updated);
      setUsers(updated);
      return { success: true };
    },
    []
  );

  const updateUser = useCallback(
    (
      id: string,
      updates: Partial<Pick<ManagedUser, "name" | "role" | "active" | "stakeholderId" | "dzongkhagId" | "thromdeId">>
    ): void => {
      const existing = loadUsers();
      const updated = existing.map((u) =>
        u.id === id ? { ...u, ...updates } : u
      );
      saveUsers(updated);
      setUsers(updated);
    },
    []
  );

  const changePassword = useCallback(
    async (
      id: string,
      newPassword: string
    ): Promise<{ success: boolean; error?: string }> => {
      const existing = loadUsers();
      const passwordHash = await hashPassword(newPassword);
      const updated = existing.map((u) =>
        u.id === id ? { ...u, passwordHash } : u
      );
      saveUsers(updated);
      setUsers(updated);
      return { success: true };
    },
    []
  );

  const deleteUser = useCallback((id: string): void => {
    const existing = loadUsers();
    const updated = existing.map((u) =>
      u.id === id ? { ...u, active: false } : u
    );
    saveUsers(updated);
    setUsers(updated);
  }, []);

  const restoreUser = useCallback((id: string): void => {
    const existing = loadUsers();
    const updated = existing.map((u) =>
      u.id === id ? { ...u, active: true } : u
    );
    saveUsers(updated);
    setUsers(updated);
  }, []);

  const recordLogin = useCallback((id: string): void => {
    const existing = loadUsers();
    const updated = existing.map((u) =>
      u.id === id ? { ...u, lastLoginAt: new Date().toISOString() } : u
    );
    saveUsers(updated);
    setUsers(updated);
  }, []);

  return {
    users,
    addUser,
    updateUser,
    changePassword,
    deleteUser,
    restoreUser,
    recordLogin,
  };
}
