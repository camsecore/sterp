"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useIsTouchDevice } from "../hooks/use-is-touch-device";

export function CustomDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const isTouch = useIsTouchDevice();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; minWidth: number } | null>(null);

  // Position the portal dropdown relative to the trigger
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, minWidth: rect.width });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="relative">
      {/* Shared trigger — always visible */}
      <button
        ref={triggerRef}
        type="button"
        onClick={isTouch ? undefined : () => setOpen(!open)}
        className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[13px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-colors hover:bg-gray-100"
      >
        {selectedLabel}
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Mobile: invisible native select overlaid on trigger for OS picker */}
      {isTouch && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={selectedLabel}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {/* Desktop: portal dropdown that floats over everything */}
      {!isTouch && open && pos && createPortal(
        <ul
          ref={listRef}
          className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{ top: pos.top, left: pos.left, minWidth: pos.minWidth }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`px-3 py-1.5 text-[13px] cursor-pointer transition-colors ${
                opt.value === value
                  ? "bg-gray-50 font-medium text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}
