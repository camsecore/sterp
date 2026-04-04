"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { RotateCw } from "lucide-react";
import { getCroppedBlob } from "../lib/utils";

interface CropModalProps {
  imageSrc: string;
  aspect: number;
  onDone: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function CropModal({ imageSrc, aspect, onDone, onCancel }: CropModalProps) {
  const [currentSrc, setCurrentSrc] = useState(imageSrc);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  function handleRotate() {
    const img = new globalThis.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      canvas.toBlob((blob) => {
        if (!blob) return;
        if (currentSrc !== imageSrc) URL.revokeObjectURL(currentSrc);
        const url = URL.createObjectURL(blob);
        setCurrentSrc(url);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }, "image/jpeg", 0.95);
    };
    img.src = currentSrc;
  }

  async function handleDone() {
    if (!croppedArea) return;
    const blob = await getCroppedBlob(currentSrc, croppedArea);
    if (currentSrc !== imageSrc) URL.revokeObjectURL(currentSrc);
    onDone(blob);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Crop image" className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="relative flex-1">
        <Cropper
          image={currentSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          showGrid={true}
        />
      </div>
      <div className="flex items-center gap-4 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black">
        <button
          type="button"
          onClick={handleRotate}
          className="text-white/70 hover:text-white p-1"
          aria-label="Rotate 90°"
        >
          <RotateCw size={20} />
        </button>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-white"
        />
        <button
          type="button"
          onClick={onCancel}
          className="text-[15px] text-white/70 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="text-[15px] font-medium text-white bg-[#C0392B] px-6 py-2 rounded-md hover:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  );
}
