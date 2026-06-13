"use client";

import { useState } from "react";
import {
  UserRole,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_DESCRIPTIONS,
} from "@/lib/grme-user";
import { useManagedUsers } from "@/lib/grme-managed-users";

interface LoginScreenProps {
  onLogin: (
    name: string,
    role: UserRole,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const ROLES: UserRole[] = ["admin", "editor", "viewer"];

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("viewer");
  const [error, setError] = useState("");
  const [adminPassword, setAdminPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { users: managedUsers, recordLogin } = useManagedUsers();
  const [userPassword, setUserPassword] = useState("");
  const matchedManagedUser = managedUsers.find(
    (u) => u.name.toLowerCase() === name.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    // Admin login
    if (selectedRole === "admin") {
      if (!adminPassword) {
        setError("Admin password is required");
        return;
      }
      setLoading(true);
      const result = await onLogin(name.trim(), "admin", adminPassword);
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Incorrect admin password");
        return;
      }
      return;
    }

    // Managed user login (editor/viewer with password)
    if (matchedManagedUser) {
      if (!userPassword) {
        setError("Password is required");
        return;
      }
      setLoading(true);
      const result = await onLogin(name.trim(), matchedManagedUser.role, userPassword);
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Incorrect password");
        return;
      }
      recordLogin(matchedManagedUser.id);
      return;
    }

    // Non-managed user (bootstrap mode — no managed users yet)
    if (managedUsers.length === 0) {
      setLoading(true);
      const result = await onLogin(name.trim(), selectedRole);
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Login failed");
      }
      return;
    }

    // User not found in managed users
    setError("User not found. Contact admin to create your account.");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setError("");
    setAdminPasswordInput("");
    setUserPassword("");

    // Auto-detect role from managed users
    const match = managedUsers.find(
      (u) => u.name.toLowerCase() === value.toLowerCase()
    );
    if (match) {
      setSelectedRole(match.role);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium mb-4 border border-primary/10">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
            GRME Index
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome
          </h1>
          <p className="text-gray-500">
            Enter your name and role to access the assessment dashboard
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Name
            </label>
            <input
              id="grme-login-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Tshering Dorji"
              maxLength={100}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
                error ? "border-red-300" : "border-gray-200"
              }`}
              autoFocus
              autoComplete="name"
            />
            {matchedManagedUser && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Account found — {ROLE_LABELS[matchedManagedUser.role]}
              </p>
            )}
          </div>

          {/* Role Selection — only show if no managed user matched */}
          {!matchedManagedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Role
              </label>
              <div className="space-y-2" role="radiogroup" aria-label="User role">
                {ROLES.map((role) => {
                  const colors = ROLE_COLORS[role];
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setSelectedRole(role);
                        setError("");
                        setAdminPasswordInput("");
                      }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-primary shadow-sm"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 border-2"
                          style={{
                            borderColor: isSelected ? colors.text : "#d1d5db",
                            backgroundColor: isSelected ? colors.text : "transparent",
                          }}
                        />
                        <div>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: isSelected ? colors.text : "#374151" }}
                          >
                            {ROLE_LABELS[role]}
                          </span>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {ROLE_DESCRIPTIONS[role]}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Password Field */}
          {selectedRole === "admin" && !matchedManagedUser && (
            <div className="space-y-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Admin access is password-protected
              </div>
              <input
                id="grme-admin-password"
                name="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => { setAdminPasswordInput(e.target.value); setError(""); }}
                placeholder="Enter admin password"
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                autoComplete="current-password"
              />
            </div>
          )}

          {/* Managed User Password Field */}
          {matchedManagedUser && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Enter your password
              </div>
              <input
                id="grme-user-password"
                name="userPassword"
                type="password"
                value={userPassword}
                onChange={(e) => { setUserPassword(e.target.value); setError(""); }}
                placeholder="Password"
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoComplete="current-password"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Enter Dashboard"}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 mt-4">
          {managedUsers.length > 0
            ? "Contact your administrator for account access."
            : "First time? Enter your name and role to get started."}
        </p>
      </div>
    </div>
  );
}
