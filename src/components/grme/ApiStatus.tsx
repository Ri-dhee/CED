"use client";

import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { getQueueStatus } from "@/lib/grme-api";

// ── Sync Context ─────────────────────────────────────────────────

type SyncStatus = "idle" | "saving" | "saved" | "error";

interface SyncEntry {
  id: string;
  status: SyncStatus;
  timestamp: number;
}

interface SyncContextValue {
  trackSync: (id: string) => {
    onSuccess: () => void;
    onError: () => void;
  };
  entries: SyncEntry[];
  hasErrors: boolean;
  retryAll: () => Promise<void>;
  onRetryAll: (handler: () => Promise<void>) => void;
  lastVerifiedAt: number | null;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<SyncEntry[]>([]);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<number | null>(null);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const retryHandlerRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const onRetryAll = useCallback((handler: () => Promise<void>) => {
    retryHandlerRef.current = handler;
  }, []);

  const trackSync = useCallback((id: string) => {
    // Mark as saving
    setEntries((prev) => {
      const existing = prev.find((e) => e.id === id);
      if (existing) {
        return prev.map((e) =>
          e.id === id ? { ...e, status: "saving" as SyncStatus, timestamp: Date.now() } : e
        );
      }
      return [...prev, { id, status: "saving", timestamp: Date.now() }];
    });

    // Auto-clear "saved" after 3 seconds
    const clearSaved = (entryId: string) => {
      const existing = timeoutRefs.current.get(entryId);
      if (existing) clearTimeout(existing);
      timeoutRefs.current.set(
        entryId,
        setTimeout(() => {
          setEntries((prev) => prev.filter((e) => e.id !== entryId));
          timeoutRefs.current.delete(entryId);
        }, 3000)
      );
    };

    return {
      onSuccess: () => {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: "saved" as SyncStatus } : e
          )
        );
        setLastVerifiedAt(Date.now());
        clearSaved(id);
      },
      onError: () => {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: "error" as SyncStatus } : e
          )
        );
      },
    };
  }, []);

  const retryAll = useCallback(async () => {
    const failedIds = entries.filter((e) => e.status === "error").map((e) => e.id);
    if (failedIds.length === 0) return;
    setEntries((prev) => prev.map((e) =>
      failedIds.includes(e.id) ? { ...e, status: "saving" as SyncStatus } : e
    ));
    await retryHandlerRef.current();
  }, [entries]);

  const hasErrors = entries.some((e) => e.status === "error");

  return (
    <SyncContext.Provider value={{ trackSync, entries, hasErrors, retryAll, onRetryAll, lastVerifiedAt }}>
      {children}
    </SyncContext.Provider>
  );
}

// ── Status Bar ───────────────────────────────────────────────────

interface ApiStatusProps {
  apiAvailable: boolean;
  onRefresh: () => void;
}

export default function ApiStatus({ apiAvailable, onRefresh }: ApiStatusProps) {
  const { entries, hasErrors, lastVerifiedAt } = useSync();
  const [queue, setQueue] = useState({ active: 0, pending: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQueue(getQueueStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSaving = entries.some((e) => e.status === "saving");
  const hasQueue = queue.pending > 0;
  const latestError = entries.find((e) => e.status === "error");

  let dotColor = "bg-green-500";
  let label = "Synced";

  if (!apiAvailable) {
    dotColor = "bg-gray-400";
    label = "Offline";
  } else if (hasErrors && latestError) {
    dotColor = "bg-red-500";
    label = "Sync failed";
  } else if (isSaving || hasQueue) {
    dotColor = "bg-yellow-400 animate-pulse";
    label = isSaving ? "Saving..." : `Syncing (${queue.pending})`;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <button
      onClick={handleRefresh}
      className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
      title="Click to refresh data from Google Sheets"
    >
      <div className={`w-1.5 h-1.5 rounded-full ${refreshing ? "bg-blue-400 animate-pulse" : dotColor}`} />
      <span className="text-gray-500">{refreshing ? "Refreshing..." : label}</span>
      {lastVerifiedAt && apiAvailable && (
        <span className="text-[10px] text-gray-400">
          Verified {new Date(lastVerifiedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
      <svg
        className={`w-3 h-3 text-gray-400 ${refreshing ? "animate-spin" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );
}
