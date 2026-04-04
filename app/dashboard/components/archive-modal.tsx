"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CustomDropdown } from "./custom-dropdown";
import type { Product } from "../lib/types";

export function ArchiveModal({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: (note: string | null, archivedAt: string, acquiredAt: string | null) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  const [now] = useState(() => new Date());

  const monthOptions = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    .map((m, i) => ({ value: String(i + 1), label: m }));
  const yearOptions = Array.from({ length: now.getFullYear() - 1999 }, (_, i) => now.getFullYear() - i)
    .map((y) => ({ value: String(y), label: String(y) }));

  // Started using — defaults to product's acquired_at or created_at
  const startDate = product.acquired_at ? new Date(product.acquired_at) : new Date(product.created_at);
  const [startMonth, setStartMonth] = useState(String(startDate.getUTCMonth() + 1));
  const [startYear, setStartYear] = useState(String(startDate.getUTCFullYear()));

  // Stopped using — defaults to current month/year
  const [stopMonth, setStopMonth] = useState(String(now.getMonth() + 1));
  const [stopYear, setStopYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Archive product" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative z-10 w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo + Name */}
        <div className="flex items-center gap-3">
          {product.photo_url && (
            <div className="h-[72px] w-[72px] rounded-lg bg-neutral-200 overflow-hidden flex-shrink-0">
              <Image src={product.photo_url} alt="" width={72} height={72} className="h-full w-full object-cover" />
            </div>
          )}
          <p className="text-[17px] font-semibold text-neutral-900">{product.name}</p>
        </div>

        {/* Memory note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 resize-none"
          placeholder="Any memories with this one? (optional)"
          autoFocus
        />

        {/* Date fields */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-neutral-500">Started using</span>
            <div className="flex items-center gap-1.5">
              <CustomDropdown value={startMonth} options={monthOptions} onChange={setStartMonth} />
              <CustomDropdown value={startYear} options={yearOptions} onChange={setStartYear} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-neutral-500">Stopped using</span>
            <div className="flex items-center gap-1.5">
              <CustomDropdown value={stopMonth} options={monthOptions} onChange={setStopMonth} />
              <CustomDropdown value={stopYear} options={yearOptions} onChange={setStopYear} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => onConfirm(
              note.trim() || null,
              `${stopYear}-${stopMonth.padStart(2, "0")}-01T00:00:00Z`,
              `${startYear}-${startMonth.padStart(2, "0")}-01T00:00:00Z`
            )}
            className="text-[14px] font-medium text-white px-5 py-2 rounded-md hover:opacity-90 bg-neutral-700"
          >
            Archive
          </button>
          <button
            onClick={onCancel}
            className="text-[14px] text-neutral-500 hover:text-neutral-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
