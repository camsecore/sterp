"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DragHandle({ attributes, listeners }: { attributes: any; listeners: any }) {
  return (
    <div {...attributes} {...listeners} aria-label="Drag to reorder" role="button" tabIndex={0} className="w-6 h-6 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing">
      <svg className="w-4 h-4 text-neutral-300" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
      </svg>
    </div>
  );
}

type SortableChildProps = { handle: React.ReactNode; isDragging: boolean };

export function SortableObsession({ id, children }: { id: string; children: (props: SortableChildProps) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      {children({ handle: <DragHandle attributes={attributes} listeners={listeners} />, isDragging })}
    </div>
  );
}

export function SortableCollection({ id, children }: { id: string; children: (props: SortableChildProps) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      {children({ handle: <DragHandle attributes={attributes} listeners={listeners} />, isDragging })}
    </div>
  );
}

export function SortableProduct({ id, children }: { id: string; children: (props: SortableChildProps) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      {children({ handle: <DragHandle attributes={attributes} listeners={listeners} />, isDragging })}
    </div>
  );
}
