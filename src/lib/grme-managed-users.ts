"use client";

import { useState, useCallback, useEffect } from "react";
import { UserRole } from "./grme-user";
import * as api from "./grme-api";
import { supabase } from "./supabase";

export interface ManagedUser {
  id: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
  active: boolean;
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
    typeof user.active === "boolean"
  );
}

function sanitizeUsers(value: unknown): ManagedUser[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isManagedUser);
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

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const apiUsers = await api.loadUsers();
        if (!cancelled && apiUsers.length > 0) {
          const sanitized = sanitizeUsers(apiUsers);
          setUsers(sanitized);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized)); // sync to localStorage
          return;
        }
      } catch {
        // API unavailable
      }
      if (!cancelled) {
        setUsers(loadUsers());
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Real-time subscription — auto-refresh when users change
  useEffect(() => {
    const channel = supabase()
      .channel("users-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "managed_users" },
          async () => {
            try {
              const apiUsers = await api.loadUsers();
              const sanitized = sanitizeUsers(apiUsers);
              setUsers(sanitized);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
            } catch {
              // Keep current state
            }
        }
      )
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, []);

  const addUser = useCallback(
    async (
      name: string,
      role: UserRole,
      password: string
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
      updates: Partial<Pick<ManagedUser, "name" | "role" | "active">>
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
