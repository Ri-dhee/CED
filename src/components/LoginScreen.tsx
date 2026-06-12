"use client";

import { useState } from "react";
import { UserRole, ROLE_LABELS, ROLE_COLORS, ROLE_DESCRIPTIONS } from "@/lib/grme-user";

interface LoginScreenProps {
  onLogin: (name: string, role: UserRole) => void;
}

const ROLES: UserRole[] = ["admin", "editor", "viewer"];

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    onLogin(name.trim(), selectedRole);
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
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Tshering Dorji"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
                error ? "border-red-300" : "border-gray-200"
              }`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Role
            </label>
            <div className="space-y-2">
              {ROLES.map((role) => {
                const colors = ROLE_COLORS[role];
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
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

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
          >
            Enter Dashboard
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 mt-4">
          Role determines what you can edit. Admins can manage the framework.
        </p>
      </div>
    </div>
  );
}
