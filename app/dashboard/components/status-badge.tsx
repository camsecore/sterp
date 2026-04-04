"use client";

export function StatusBadge({ status }: { status: string }) {
  if (status === "archived") {
    return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-500">Archived</span>;
  }
  if (status === "draft") {
    return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#555] text-white">Draft</span>;
  }
  return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>;
}
