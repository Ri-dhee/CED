"use client";

import { useState } from "react";
import {
  GrmeUser,
  UserRole,
  ROLE_LABELS,
  ROLE_COLORS,
  canEditFramework,
} from "@/lib/grme-user";

interface UserBadgeProps {
  user: GrmeUser;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}

const ROLES: UserRole[] = ["admin", "editor", "viewer"];

export default function UserBadge({
  user,
  onSwitchRole,
  onLogout,
}: UserBadgeProps) {
  const [open, setOpen] = useState(false);
  const colors = ROLE_COLORS[user.role];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors bg-white text-sm"
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.text }}
        />
        <span className="font-medium text-gray-700">{user.name}</span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {ROLE_LABELS[user.role]}
        </span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-2">
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-xs text-gray-400">Switch role</p>
            </div>
            {ROLES.map((role) => {
              const c = ROLE_COLORS[role];
              const isActive = user.role === role;
              return (
                <button
                  key={role}
                  onClick={() => {
                    onSwitchRole(role);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    isActive
                      ? "bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: c.text }}
                  />
                  <span className="font-medium">{ROLE_LABELS[role]}</span>
                  {isActive && (
                    <svg
                      className="w-3.5 h-3.5 text-primary ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
