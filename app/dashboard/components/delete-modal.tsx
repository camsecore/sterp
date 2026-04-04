"use client";

import { useEffect } from "react";

export function DeleteModal({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Confirm deletion" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative z-10 w-full sm:max-w-sm bg-white rounded-t-xl sm:rounded-xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-[15px] font-medium text-neutral-900">Delete {name}?</p>
          <p className="text-[14px] text-neutral-500 mt-1">This is permanent and can&apos;t be undone.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onConfirm}
            className="text-[14px] font-medium text-white px-5 py-2 rounded-md hover:opacity-90"
            style={{ backgroundColor: "#C0392B" }}
          >
            Delete
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
