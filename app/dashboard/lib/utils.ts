import { createClient } from "@/lib/supabase/client";

export function isHeic(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name)
  );
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const result = Array.isArray(blob) ? blob[0] : blob;
  return new File([result], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
}

export function extractHandle(url: string, platform: "twitter" | "instagram" | "youtube"): string {
  if (!url) return "";
  const cleaned = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const patterns: Record<string, RegExp> = {
    twitter: /^(?:www\.)?(?:x\.com|twitter\.com)\/(.+)/i,
    instagram: /^(?:www\.)?instagram\.com\/(.+)/i,
    youtube: /^(?:www\.)?youtube\.com\/(.+)/i,
  };
  const match = cleaned.match(patterns[platform]);
  if (match) return match[1].replace(/^@/, "");
  return url.replace(/^@/, "");
}

export function handleToUrl(handle: string, platform: "twitter" | "instagram" | "youtube"): string {
  if (!handle.trim()) return "";
  const clean = handle.trim().replace(/^@/, "");
  const bases = { twitter: "https://x.com/", instagram: "https://instagram.com/", youtube: "https://youtube.com/@" };
  return `${bases[platform]}${clean}`;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function convertToWebP(file: File): Promise<Blob> {
  const MAX_WIDTH = 1200;
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let w = img.width;
      let h = img.height;
      if (w > MAX_WIDTH) {
        h = Math.round(h * (MAX_WIDTH / w));
        w = MAX_WIDTH;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed"))),
        "image/webp",
        0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Failed to load image")); };
    img.src = objectUrl;
  });
}

export async function getCroppedBlob(imageSrc: string, cropArea: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
        "image/jpeg",
        0.95
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageSrc;
  });
}

export async function uploadProductPhoto(file: File, userId: string, productId: string): Promise<string> {
  const webpBlob = await convertToWebP(file);
  const supabase = createClient();
  const filePath = `${userId}/${productId}.webp`;

  const { error } = await supabase.storage
    .from("product-photos")
    .upload(filePath, webpBlob, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw new Error(error.message);

  return `https://images.sterp.com/${filePath}`;
}

export const inputClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40";

export const selectClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40";
