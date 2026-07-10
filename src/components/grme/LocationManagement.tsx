"use client";

import { useState } from "react";
import { recordAdminEvent, saveDzongkhagsConfig, saveThromde } from "@/lib/grme-api";
import type { Thromde } from "@/lib/grme-data";

interface LocationManagementProps {
  dzongkhags: { id: string; name: string }[];
  thromdes: Thromde[];
  adminName: string;
  onRefreshData: () => void | Promise<void>;
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function ensureUniqueId(baseId: string, existingIds: string[]): string {
  if (!existingIds.includes(baseId)) return baseId;
  let counter = 2;
  let next = `${baseId}-${counter}`;
  while (existingIds.includes(next)) {
    counter += 1;
    next = `${baseId}-${counter}`;
  }
  return next;
}

export default function LocationManagement({ dzongkhags, thromdes, adminName, onRefreshData }: LocationManagementProps) {
  const [newDzongkhagName, setNewDzongkhagName] = useState("");
  const [newThromdeName, setNewThromdeName] = useState("");
  const [newThromdeDzongkhag, setNewThromdeDzongkhag] = useState(dzongkhags[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAddDzongkhag = async () => {
    const name = newDzongkhagName.trim();
    if (!name) {
      setError("Dzongkhag name is required.");
      return;
    }

    const id = ensureUniqueId(slugify(name), dzongkhags.map((item) => item.id));
    const nextDzongkhags = [...dzongkhags, { id, name }];

    setSaving(true);
    setError("");
    try {
      await saveDzongkhagsConfig(nextDzongkhags);
      try {
        await recordAdminEvent({
          actor: adminName,
          action: "create",
          entity: "dzongkhag",
          notes: JSON.stringify({ id, name }),
        });
      } catch (logError) {
        console.warn("Saved dzongkhag, but could not record the admin event.", logError);
      }
      setNewDzongkhagName("");
      setNewThromdeDzongkhag(id);
      await Promise.resolve(onRefreshData());
    } catch {
      setError("Unable to save dzongkhag.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddThromde = async () => {
    const name = newThromdeName.trim();
    if (!name) {
      setError("Thromde name is required.");
      return;
    }
    if (!newThromdeDzongkhag) {
      setError("Select a dzongkhag first.");
      return;
    }

    const id = ensureUniqueId(`${newThromdeDzongkhag}-${slugify(name)}`, thromdes.map((item) => item.id));
    const thromde = { id, dzongkhagId: newThromdeDzongkhag, name };

    setSaving(true);
    setError("");
    try {
      await saveThromde(thromde);
      try {
        await recordAdminEvent({
          actor: adminName,
          action: "create",
          entity: "thromde",
          notes: JSON.stringify(thromde),
        });
      } catch (logError) {
        console.warn("Saved thromde, but could not record the admin event.", logError);
      }
      setNewThromdeName("");
      await Promise.resolve(onRefreshData());
    } catch {
      setError("Unable to save thromde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Location Management</h3>
          <p className="text-xs text-gray-500">Admins add dzongkhags here; thromdes are attached to a dzongkhag.</p>
        </div>
        <span className="text-sm text-gray-400">{dzongkhags.length} dzongkhags · {thromdes.length} thromdes</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newDzongkhagName}
            onChange={(e) => { setNewDzongkhagName(e.target.value); setError(""); }}
            placeholder="New dzongkhag name"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
          <button
            onClick={handleAddDzongkhag}
            disabled={saving}
            className="px-3 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newThromdeName}
            onChange={(e) => { setNewThromdeName(e.target.value); setError(""); }}
            placeholder="New thromde name"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
          <select
            value={newThromdeDzongkhag}
            onChange={(e) => setNewThromdeDzongkhag(e.target.value)}
            className="w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            {dzongkhags.map((dzongkhag) => (
              <option key={dzongkhag.id} value={dzongkhag.id}>{dzongkhag.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddThromde}
            disabled={saving}
            className="px-3 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="max-h-56 overflow-y-auto space-y-1 text-[11px] text-slate-500">
        {dzongkhags.map((dzongkhag) => (
          <div key={dzongkhag.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <span className="font-medium text-slate-700">{dzongkhag.name}</span>
            <span>{thromdes.filter((thromde) => thromde.dzongkhagId === dzongkhag.id).length} thromdes</span>
          </div>
        ))}
      </div>
    </div>
  );
}
