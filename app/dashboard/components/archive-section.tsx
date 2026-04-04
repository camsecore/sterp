"use client";

import { Clock } from "lucide-react";
import { Thumbnail } from "./thumbnail";
import { CustomDropdown } from "./custom-dropdown";
import type { Product } from "../lib/types";

interface ArchiveSectionProps {
  archivedProducts: Product[];
  editingNoteId: string | null;
  editNoteValue: string;
  setEditNoteValue: (v: string) => void;
  editAcquiredMonth: string;
  setEditAcquiredMonth: (v: string) => void;
  editAcquiredYear: string;
  setEditAcquiredYear: (v: string) => void;
  editArchivedMonth: string;
  setEditArchivedMonth: (v: string) => void;
  editArchivedYear: string;
  setEditArchivedYear: (v: string) => void;
  onOpenEdit: (product: Product) => void;
  onSaveNote: (productId: string) => void;
  onRestore: (productId: string) => void;
  onDelete: (product: Product) => void;
  onCancelEdit: () => void;
  formatDuration: (start: string, end: string) => string;
}

export function ArchiveSection({
  archivedProducts,
  editingNoteId,
  editNoteValue,
  setEditNoteValue,
  editAcquiredMonth,
  setEditAcquiredMonth,
  editAcquiredYear,
  setEditAcquiredYear,
  editArchivedMonth,
  setEditArchivedMonth,
  editArchivedYear,
  setEditArchivedYear,
  onOpenEdit,
  onSaveNote,
  onRestore,
  onDelete,
  onCancelEdit,
  formatDuration,
}: ArchiveSectionProps) {
  if (archivedProducts.length === 0) return null;

  const monthOptions = [
    { value: "", label: "Month" },
    ...["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ value: String(i + 1), label: m })),
  ];
  const yearOptions = [
    { value: "", label: "Year" },
    ...Array.from({ length: new Date().getFullYear() - 2009 }, (_, i) => new Date().getFullYear() - i).map((y) => ({ value: String(y), label: String(y) })),
  ];

  return (
    <section>
      <div className="flex items-baseline gap-2 mb-3 pt-4 border-t border-gray-200">
        <Clock size={16} className="text-neutral-400 relative top-[2px]" />
        <h2 className="text-[20px] font-semibold text-neutral-900">
          Archive
        </h2>
        <span className="text-[13px] text-neutral-400 font-medium">
          {archivedProducts.length}
        </span>
      </div>
      <div className="space-y-2">
        {archivedProducts.map((p) => (
          <div key={p.id} className="bg-white rounded-lg border border-gray-200">
            {editingNoteId === p.id ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Thumbnail src={p.photo_url} alt={p.name} />
                  <span className="text-[15px] font-medium text-neutral-900">{p.name}</span>
                </div>

                {/* Archive note with character counter */}
                <div>
                  <textarea
                    value={editNoteValue}
                    onChange={(e) => {
                      if (e.target.value.length <= 160) setEditNoteValue(e.target.value);
                    }}
                    rows={2}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40 resize-none"
                    placeholder="Any memories with this one?"
                    autoFocus
                  />
                  <p className={`text-[12px] mt-1 ${editNoteValue.length >= 140 ? "text-[#C0392B]" : "text-neutral-400"}`}>
                    {editNoteValue.length}/160
                  </p>
                </div>

                {/* Date fields */}
                <div className="flex flex-col gap-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 w-20 flex-shrink-0">Acquired</span>
                    <CustomDropdown value={editAcquiredMonth} options={monthOptions} onChange={setEditAcquiredMonth} />
                    <CustomDropdown value={editAcquiredYear} options={yearOptions} onChange={setEditAcquiredYear} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 w-20 flex-shrink-0">Archived</span>
                    <CustomDropdown value={editArchivedMonth} options={monthOptions} onChange={setEditArchivedMonth} />
                    <CustomDropdown value={editArchivedYear} options={yearOptions} onChange={setEditArchivedYear} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { onCancelEdit(); onRestore(p.id); }}
                      className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => { onCancelEdit(); onDelete(p); }}
                      className="text-[13px] text-[#C0392B] hover:opacity-70 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onCancelEdit}
                      className="text-[13px] text-neutral-500 hover:text-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onSaveNote(p.id)}
                      className="text-[13px] font-medium text-white px-4 py-1.5 rounded-md hover:opacity-90 bg-[#C0392B]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <Thumbnail src={p.photo_url} alt={p.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium text-neutral-900 truncate">
                      {p.name}
                    </span>
                    {p.created_at && p.archived_at && (
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 flex-shrink-0">
                        {formatDuration(p.acquired_at ?? p.created_at, p.archived_at)}
                      </span>
                    )}
                  </div>
                  {p.archive_note && (
                    <span className="text-[13px] text-neutral-400 truncate block">
                      {p.archive_note}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onOpenEdit(p)}
                  className="text-[12px] text-neutral-500 hover:text-neutral-800 transition-colors flex-shrink-0"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
