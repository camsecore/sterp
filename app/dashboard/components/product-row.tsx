"use client";

import { Thumbnail } from "./thumbnail";
import { StatusBadge } from "./status-badge";
import type { Product } from "../lib/types";

interface ProductRowProps {
  product: Product;
  highlighted: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onArchive: () => void;
  showDragHandle?: React.ReactNode;
  className?: string;
  menuItems?: { label: string; onClick: () => void; danger?: boolean }[];
}

export function ProductRow({
  product: p,
  highlighted,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onEdit,
  onArchive,
  showDragHandle,
  className = "",
  menuItems,
}: ProductRowProps) {
  const items = menuItems ?? [
    { label: "Edit", onClick: onEdit },
    { label: "Archive", onClick: onArchive },
  ];

  return (
    <div
      data-product-id={p.id}
      className={`flex items-center gap-3 transition-colors duration-700 ${highlighted ? "ring-2 ring-emerald-400 bg-emerald-50" : ""} ${className}`}
    >
      {showDragHandle}
      <Thumbnail src={p.photo_url} alt={p.name} />
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={onEdit}
      >
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-neutral-900 truncate">
            {p.name}
          </span>
          <span className="hidden sm:inline flex-shrink-0"><StatusBadge status={p.status} /></span>
        </div>
        {p.one_liner && (
          <span className="text-[13px] text-neutral-400 truncate block">
            {p.one_liner}
          </span>
        )}
      </div>
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
          aria-label={`${p.name} options`}
          className="p-1 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
            <div className="absolute right-0 top-8 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 w-56">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full text-left px-4 py-2 text-[14px] hover:bg-neutral-50 transition-colors cursor-pointer ${
                    item.danger ? "text-[#C0392B]" : "text-neutral-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
