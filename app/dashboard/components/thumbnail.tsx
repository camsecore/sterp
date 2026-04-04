"use client";

import Image from "next/image";

export function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="h-10 w-10 rounded bg-neutral-200 overflow-hidden flex-shrink-0">
      {src ? (
        <Image src={src} alt={alt} width={40} height={40} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-neutral-400 text-xs">
          —
        </div>
      )}
    </div>
  );
}
