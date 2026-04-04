"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Flame } from "lucide-react";
import { CropModal } from "./crop-modal";
import { CustomDropdown } from "./custom-dropdown";
import { Thumbnail } from "./thumbnail";
import { isHeic, convertHeicToJpeg, normalizeUrl, uploadProductPhoto, inputClass } from "../lib/utils";
import type { Product, Collection, Obsession } from "../lib/types";

interface ProductModalProps {
  mode: "add" | "edit";
  product?: Product;
  defaultCollectionId?: string;
  collections: Collection[];
  obsessions: Obsession[];
  userId: string;
  phase?: number;
  onSave: (newProductId?: string) => Promise<void>;
  onClose: () => void;
  onCollectionCreated: () => Promise<void>;
  onArchive?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductModal({
  mode,
  product,
  defaultCollectionId,
  collections,
  obsessions,
  userId,
  phase = 3,
  onSave,
  onClose,
  onCollectionCreated,
  onArchive,
  onDelete,
}: ProductModalProps) {
  const obsessionEntry = product ? obsessions.find((tp) => tp.product_id === product.id) : undefined;
  const obsessionRank = obsessionEntry ? obsessions.sort((a, b) => a.sort_order - b.sort_order).indexOf(obsessionEntry) + 1 : 0;
  const obsessionsFull = obsessions.length >= 5;
  const [showReplacePicker, setShowReplacePicker] = useState(false);
  const [obsessionPending, setObsessionPending] = useState(false);
  const [name, setName] = useState(product?.name || "");
  const [oneLiner, setOneLiner] = useState(product?.one_liner || "");
  const [originalUrl, setOriginalUrl] = useState(product?.original_url || "");
  const [photoUrl, setPhotoUrl] = useState(product?.photo_url || "");
  const [collectionId, setCollectionId] = useState(
    product?.collection_id || defaultCollectionId || (collections[0]?.id ?? "")
  );
  const existingDate = product?.acquired_at ? new Date(product.acquired_at) : product?.created_at ? new Date(product.created_at) : null;
  const [acquiredMonth, setAcquiredMonth] = useState<string>(existingDate ? String(existingDate.getUTCMonth() + 1) : "");
  const [acquiredYear, setAcquiredYear] = useState<string>(existingDate ? String(existingDate.getUTCFullYear()) : "");
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionError, setNewCollectionError] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const [editingCollection, setEditingCollection] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newCollectionInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const oneLinerRef = useRef<HTMLTextAreaElement>(null);

  // Track whether the form has unsaved changes
  const hasChanges = Boolean(
    name.trim() || oneLiner.trim() || originalUrl.trim() || photoUrl || pendingBlob
  );

  function handleDismiss() {
    if (!hasChanges || mode === "edit") {
      onClose();
    } else if (window.confirm("You have unsaved changes. Discard them?")) {
      onClose();
    }
  }

  // Close on Escape (but not while crop modal is open)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !cropSrc && !creatingCollection) handleDismiss();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, cropSrc, creatingCollection]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Focus new collection input when it appears
  useEffect(() => {
    if (creatingCollection && newCollectionInputRef.current) {
      newCollectionInputRef.current.focus();
    }
  }, [creatingCollection]);

  async function handleFileSelect(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Max 10MB" }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });
    try {
      const converted = isHeic(file) ? await convertHeicToJpeg(file) : file;
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(URL.createObjectURL(converted));
    } catch {
      setErrors((prev) => ({ ...prev, photo: "Could not read this image format" }));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(true);
  }

  function handleDragLeave() {
    setDraggingOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  }

  function handleCropDone(croppedBlob: Blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    setPendingBlob(croppedBlob);
    setPhotoUrl(URL.createObjectURL(croppedBlob));
  }

  async function handleCreateCollection() {
    setNewCollectionError("");
    if (!newCollectionName.trim()) {
      setNewCollectionError("Name is required");
      return;
    }
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCollectionName.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setNewCollectionError(data.error || "Failed to create collection");
      return;
    }
    const created = await res.json();
    await onCollectionCreated();
    setCollectionId(created.id);
    setCreatingCollection(false);
    setNewCollectionName("");
  }

  async function handleSave() {
    const newErrors: Record<string, string> = {};
    // Photo is optional — products without photos save as drafts
    if (!name.trim()) newErrors.name = "Name is required";
    if (!oneLiner.trim()) newErrors.one_liner = "One-liner is required";
    // Collection validation when dropdown is visible
    if ((collections.length >= 2 || (phase >= 4 && mode === "add")) && !collectionId) newErrors.collection = "Collection is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus the first field with an error so the user can fix it
      if (newErrors.name) {
        nameInputRef.current?.focus();
        nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (newErrors.one_liner) {
        oneLinerRef.current?.focus();
        oneLinerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      // Auto-resolve collection for 0-1 collection users (field is hidden)
      let resolvedCollectionId = collectionId;
      if (collections.length === 0) {
        // Silently create a "Products" collection
        const colRes = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Products" }),
        });
        if (!colRes.ok) {
          const data = await colRes.json();
          setErrors({ form: data.error || "Failed to create collection" });
          setSaving(false);
          return;
        }
        const createdCol = await colRes.json();
        resolvedCollectionId = createdCol.id;
        await onCollectionCreated();
      } else if (collections.length === 1 && !resolvedCollectionId) {
        // Auto-assign to their only collection
        resolvedCollectionId = collections[0].id;
      }

      let createdProductId: string | undefined;

      if (mode === "add") {
        // Create product first (without photo_url if we have a pending blob)
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            collection_id: resolvedCollectionId,
            one_liner: oneLiner.trim() || null,
            original_url: normalizeUrl(originalUrl) || null,
            photo_url: pendingBlob ? null : photoUrl || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setErrors({ form: data.error || "Failed to add product" });
          setSaving(false);
          return;
        }
        const created = await res.json();
        createdProductId = created.id;

        // Now upload photo with the real product ID
        if (pendingBlob) {
          const file = new File([pendingBlob], "photo.jpg", { type: "image/jpeg" });
          const uploadedUrl = await uploadProductPhoto(file, userId, created.id);
          await fetch(`/api/products/${created.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photo_url: uploadedUrl }),
          });
        }
      } else {
        // For edits, upload pending photo with existing product ID
        let finalPhotoUrl = photoUrl;
        if (pendingBlob) {
          const file = new File([pendingBlob], "photo.jpg", { type: "image/jpeg" });
          finalPhotoUrl = await uploadProductPhoto(file, userId, product!.id);
        }
        const res = await fetch(`/api/products/${product!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            one_liner: oneLiner.trim() || null,
            original_url: normalizeUrl(originalUrl) || null,
            collection_id: resolvedCollectionId,
            photo_url: finalPhotoUrl || null,
            acquired_at: acquiredMonth && acquiredYear ? `${acquiredYear}-${acquiredMonth.padStart(2, "0")}-01` : null,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setErrors({ form: data.error || "Failed to update product" });
          setSaving(false);
          return;
        }
      }

      await onSave(mode === "add" ? createdProductId : undefined);
      onClose();
    } catch {
      setErrors({ form: "Something went wrong" });
      setSaving(false);
    }
  }

  // ── Shared pieces used by both Add and Edit layouts ──

  const photoUploadArea = (
    <div>
      <div
        className={`relative w-full rounded-lg overflow-hidden cursor-pointer transition-colors ${
          photoUrl
            ? "aspect-[4/3] bg-neutral-200"
            : `aspect-[3/1] border-2 border-dashed ${
                draggingOver
                  ? "border-[#C0392B]/40 bg-[#C0392B]/5"
                  : errors.photo
                  ? "border-[#C0392B]/40 bg-red-50"
                  : "border-gray-200 bg-neutral-50"
              }`
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#C0392B] rounded-full animate-spin" />
            <span className="text-[13px] text-neutral-400 mt-2">Uploading...</span>
          </div>
        ) : photoUrl ? (
          <>
            <Image
              src={photoUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
              <span className="text-white text-[14px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Change photo
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Camera size={24} className="text-neutral-300 mb-1" />
            <span className="text-[13px] font-medium text-neutral-500">Add photo</span>
            <span className="text-[11px] text-neutral-400 mt-0.5">Products without a photo are saved as drafts.</span>
          </div>
        )}
      </div>
      {errors.photo && (
        <p className="text-[13px] text-[#C0392B] mt-1">{errors.photo}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );

  const nameInput = (
    <div>
      <input
        ref={nameInputRef}
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => { const next = { ...prev }; delete next.name; return next; });
        }}
        className={`${inputClass}${errors.name ? " border-[#C0392B]" : ""}`}
        placeholder="Product name"
      />
      {errors.name && (
        <p className="text-[13px] text-[#C0392B] mt-1">{errors.name}</p>
      )}
    </div>
  );

  const oneLinerInput = (
    <div>
      <textarea
        ref={oneLinerRef}
        value={oneLiner}
        onChange={(e) => {
          if (e.target.value.length <= 160) {
            setOneLiner(e.target.value);
            if (errors.one_liner) setErrors((prev) => { const next = { ...prev }; delete next.one_liner; return next; });
          }
        }}
        rows={4}
        className={`${inputClass} resize-none sm:min-h-0 min-h-[140px]${errors.one_liner ? " border-[#C0392B]" : ""}`}
        placeholder="What would you tell a friend about this?"
      />
      <p
        className={`text-[12px] mt-1 ${
          oneLiner.length >= 140 ? "text-[#C0392B]" : "text-neutral-400"
        }`}
      >
        {oneLiner.length}/160
      </p>
      {errors.one_liner && (
        <p className="text-[13px] text-[#C0392B] mt-0.5">{errors.one_liner}</p>
      )}
    </div>
  );

  const collectionSection = (
    <div>
      {(collections.length >= 2 || (phase >= 4 && mode === "add")) && (
        creatingCollection ? (
        <div className="flex items-center gap-2">
          <input
            ref={newCollectionInputRef}
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateCollection();
              }
              if (e.key === "Escape") {
                setCreatingCollection(false);
                setNewCollectionName("");
                setNewCollectionError("");
              }
            }}
            className={inputClass}
            placeholder="Collection name"
          />
          <button
            type="button"
            onClick={handleCreateCollection}
            className="text-[13px] font-medium text-[#C0392B] hover:opacity-70 transition-opacity flex-shrink-0"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setCreatingCollection(false);
              setNewCollectionName("");
              setNewCollectionError("");
            }}
            className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors flex-shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <CustomDropdown
          value={collectionId}
          options={[
            { value: "", label: "Select a collection" },
            ...collections.map((col) => ({ value: col.id, label: col.name })),
            { value: "__create__", label: "＋ Create new collection" },
          ]}
          onChange={(v) => {
            if (v === "__create__") {
              setCreatingCollection(true);
            } else {
              setCollectionId(v);
            }
          }}
        />
      ))}
      {newCollectionError && (
        <p className="text-[13px] text-[#C0392B] mt-1">{newCollectionError}</p>
      )}
      {errors.collection && (
        <p className="text-[13px] text-[#C0392B] mt-1">{errors.collection}</p>
      )}
    </div>
  );

  const obsessionSection = mode === "edit" && product && product.status === "current" && !creatingCollection && (
    <div className="w-full relative z-0">
      {obsessionEntry ? (
        <div className="w-full flex justify-between items-center px-4 py-2 rounded-lg bg-red-50/50 border border-red-100">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600" />
            <span className="text-[13px] font-medium text-red-600">Obsession #{obsessionRank}</span>
          </div>
          <button
            type="button"
            disabled={obsessionPending}
            onClick={async () => {
              setObsessionPending(true);
              await fetch(`/api/obsessions/${product.id}`, { method: "DELETE" });
              await onSave();
              setObsessionPending(false);
            }}
            className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors"
          >
            {obsessionPending ? "Removing..." : "Remove"}
          </button>
        </div>
      ) : !showReplacePicker && (
        <button
          type="button"
          disabled={obsessionPending}
          onClick={async () => {
            if (obsessionsFull) {
              setShowReplacePicker(true);
              setTimeout(() => document.getElementById("replace-picker")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
            } else {
              setObsessionPending(true);
              const res = await fetch("/api/obsessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id }),
              });
              if (!res.ok) {
                const data = await res.json();
                setErrors({ form: data.error || "Failed to add to Obsessions" });
              }
              await onSave();
              setObsessionPending(false);
            }
          }}
          className="w-full flex justify-center items-center gap-2 text-[13px] text-gray-600 border border-dashed border-gray-300 rounded-lg px-4 py-2 bg-transparent hover:bg-gray-50 transition-colors"
        >
          <Flame className="w-4 h-4 text-gray-400" />
          {obsessionPending ? "Adding..." : "Add to Obsessions"}
        </button>
      )}
    </div>
  );

  const replacePickerSection = mode === "edit" && product && showReplacePicker && !obsessionEntry && (
    <div id="replace-picker" className="space-y-2 rounded-md border border-gray-200 px-3 py-2.5">
      <p className="text-[13px] text-neutral-600">Replace which Obsession?</p>
      {obsessions
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((tp, i) => (
          <button
            key={tp.id}
            type="button"
            disabled={obsessionPending}
            onClick={async () => {
              setObsessionPending(true);
              await fetch(`/api/obsessions/${tp.product_id}`, { method: "DELETE" });
              await fetch("/api/obsessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id }),
              });
              await onSave();
              setObsessionPending(false);
              setShowReplacePicker(false);
            }}
            className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-50 transition-colors"
          >
            <span className="text-[12px] text-neutral-400 w-4">#{i + 1}</span>
            <Thumbnail src={tp.products.photo_url} alt={tp.products.name} />
            <span className="text-[14px] text-neutral-700 truncate">{tp.products.name}</span>
          </button>
        ))}
      <button
        type="button"
        onClick={() => setShowReplacePicker(false)}
        className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  );

  const cropModal = cropSrc && (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={(e) => e.stopPropagation()}>
      <CropModal
        imageSrc={cropSrc}
        aspect={4 / 3}
        onDone={handleCropDone}
        onCancel={() => { if (cropSrc) URL.revokeObjectURL(cropSrc); setCropSrc(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
      />
    </div>
  );

  // ── Edit mode layout ──
  if (mode === "edit") {
    const selectedCollectionName = collections.find((c) => c.id === collectionId)?.name;
    const acquiredLabel = acquiredMonth && acquiredYear
      ? `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(acquiredMonth) - 1]} ${acquiredYear}`
      : null;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit product"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        onClick={handleDismiss}
      >
        <div className="absolute inset-0 bg-black/50" />

        {/* Modal shell — always flex-col so header/footer span full width */}
        <div
          className="relative z-10 bg-white w-full h-full flex flex-col sm:h-auto sm:max-w-[800px] sm:mx-auto sm:rounded-xl sm:max-h-[min(700px,calc(100vh-3rem))]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Mobile top nav bar ── */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10 sm:hidden">
            <button type="button" onClick={handleDismiss} className="text-[15px] text-neutral-500 hover:text-neutral-800 transition-colors">
              Cancel
            </button>
            <h2 className="text-[15px] font-semibold text-neutral-900">Edit Product</h2>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="text-[15px] font-semibold text-[#C0392B] hover:opacity-70 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {/* ── 1. Full-width desktop header ── */}
          <div className="hidden sm:flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-[17px] font-semibold text-neutral-900">Edit Product</h2>
            <button type="button" onClick={handleDismiss} aria-label="Close" className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* ── 2. Content area ── */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Desktop: 2-column row */}
            <div className="hidden sm:flex gap-6 px-6 py-4 items-start">
              {/* Left ~40%: constrained photo */}
              <div className="w-[35%] flex-shrink-0">
                <div
                  className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border border-gray-200 bg-neutral-100"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#C0392B] rounded-full animate-spin" />
                      <span className="text-[13px] text-neutral-400 mt-2">Uploading...</span>
                    </div>
                  ) : photoUrl ? (
                    <>
                      <Image src={photoUrl} alt="" fill unoptimized className="object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
                        <span className="text-white text-[14px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Change photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Camera className="w-12 h-12 text-neutral-300 mb-1" strokeWidth={1.5} />
                      <span className="text-[13px] font-medium text-neutral-500">Add photo</span>
                    </div>
                  )}
                </div>
                {errors.photo && <p className="text-[13px] text-[#C0392B] mt-1">{errors.photo}</p>}
              </div>

              {/* Right ~60%: form inputs */}
              <div className="flex-1 space-y-3">
                {nameInput}
                {oneLinerInput}

                {/* Condensed metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                  {!editingCollection && (editingDate ? (
                    <div className="flex items-center gap-2 relative z-30">
                      <CustomDropdown
                        value={acquiredMonth}
                        options={[
                          { value: "", label: "Month" },
                          ...["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ value: String(i + 1), label: m })),
                        ]}
                        onChange={setAcquiredMonth}
                      />
                      <CustomDropdown
                        value={acquiredYear}
                        options={[
                          { value: "", label: "Year" },
                          ...Array.from({ length: new Date().getFullYear() - 2009 }, (_, i) => new Date().getFullYear() - i).map((y) => ({ value: String(y), label: String(y) })),
                        ]}
                        onChange={setAcquiredYear}
                      />
                      {(acquiredMonth || acquiredYear) && (
                        <button type="button" onClick={() => { setAcquiredMonth(""); setAcquiredYear(""); }} className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors">Clear</button>
                      )}
                      <button type="button" onClick={() => setEditingDate(false)} className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors">Done</button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <span className="text-neutral-400">Acquired:</span>
                      <span className="text-neutral-700">{acquiredLabel || "—"}</span>
                      <button type="button" onClick={() => setEditingDate(true)} className="text-[12px] text-gray-400 hover:text-gray-600 hover:underline transition-colors ml-0.5">Change</button>
                    </span>
                  ))}

                  {!editingDate && (editingCollection ? (
                    <div className="flex items-center gap-2">
                      {collectionSection}
                      <button type="button" onClick={() => setEditingCollection(false)} className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0">Done</button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <span className="text-neutral-400">Collection:</span>
                      <span className="text-neutral-700">{selectedCollectionName || "—"}</span>
                      {collections.length >= 2 && (
                        <button type="button" onClick={() => setEditingCollection(true)} className="text-[12px] text-gray-400 hover:text-gray-600 hover:underline transition-colors ml-0.5">Change</button>
                      )}
                    </span>
                  ))}

                  {!editingDate && !editingCollection && obsessionSection}
                </div>

                {replacePickerSection}

                {errors.form && (
                  <p className="text-[13px] text-[#C0392B]">{errors.form}</p>
                )}
              </div>
            </div>

            {/* Mobile: single-column body */}
            <div className="sm:hidden px-5 pt-5 pb-3">
              {/* ── Group A: Text inputs (tight spacing) ── */}
              <div className="space-y-3">
                {/* Photo thumbnail + name on same row */}
                <div className="flex items-start gap-3">
                  <div
                    className="relative w-20 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer flex-shrink-0 bg-neutral-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoUrl ? (
                      <>
                        <Image src={photoUrl} alt="" fill unoptimized className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Camera className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
                        <Camera size={18} className="text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {nameInput}
                  </div>
                </div>

                {oneLinerInput}
              </div>

              {/* ── Group B: Metadata (separated from Group A) ── */}
              <div className="mt-6">
                {/* Acquired / Collection row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                  {!editingCollection && (editingDate ? (
                    <div className="flex items-center gap-2 relative z-30">
                      <CustomDropdown
                        value={acquiredMonth}
                        options={[
                          { value: "", label: "Month" },
                          ...["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ value: String(i + 1), label: m })),
                        ]}
                        onChange={setAcquiredMonth}
                      />
                      <CustomDropdown
                        value={acquiredYear}
                        options={[
                          { value: "", label: "Year" },
                          ...Array.from({ length: new Date().getFullYear() - 2009 }, (_, i) => new Date().getFullYear() - i).map((y) => ({ value: String(y), label: String(y) })),
                        ]}
                        onChange={setAcquiredYear}
                      />
                      {(acquiredMonth || acquiredYear) && (
                        <button type="button" onClick={() => { setAcquiredMonth(""); setAcquiredYear(""); }} className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors">Clear</button>
                      )}
                      <button type="button" onClick={() => setEditingDate(false)} className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors">Done</button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <span className="text-neutral-400">Acquired:</span>
                      <span className="text-neutral-700">{acquiredLabel || "—"}</span>
                      <button type="button" onClick={() => setEditingDate(true)} className="text-[12px] text-gray-400 hover:text-gray-600 hover:underline transition-colors ml-0.5">Change</button>
                    </span>
                  ))}

                  {!editingDate && (editingCollection ? (
                    <div className="flex items-center gap-2">
                      {collectionSection}
                      <button type="button" onClick={() => setEditingCollection(false)} className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0">Done</button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <span className="text-neutral-400">Collection:</span>
                      <span className="text-neutral-700">{selectedCollectionName || "—"}</span>
                      {collections.length >= 2 && (
                        <button type="button" onClick={() => setEditingCollection(true)} className="text-[12px] text-gray-400 hover:text-gray-600 hover:underline transition-colors ml-0.5">Change</button>
                      )}
                    </span>
                  ))}
                </div>

                {/* Obsessions — visually separated */}
                {!editingDate && !editingCollection && (
                  <div className="mt-5">{obsessionSection}</div>
                )}

                {replacePickerSection}

                {errors.form && (
                  <p className="text-[13px] text-[#C0392B] mt-2">{errors.form}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── 3. Full-width footer ── */}
          {/* Mobile: pinned danger zone */}
          {product && (onArchive || onDelete) && (
            <div className="mt-auto border-t border-gray-200 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-4 sm:hidden">
              {onArchive && (
                <button type="button" onClick={() => { onClose(); onArchive(product); }} className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors">
                  Archive
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={() => { onClose(); onDelete(product); }} className="text-[13px] text-[#C0392B] hover:opacity-70 transition-opacity">
                  Delete
                </button>
              )}
            </div>
          )}

          {/* Desktop: full-width footer with divider */}
          <div className="hidden sm:flex items-center justify-between border-t border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4">
              {product && onArchive && (
                <button type="button" onClick={() => { onClose(); onArchive(product); }} className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors">
                  Archive
                </button>
              )}
              {product && onDelete && (
                <button type="button" onClick={() => { onClose(); onDelete(product); }} className="text-[13px] text-[#C0392B] hover:opacity-70 transition-opacity">
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleDismiss} className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-[#C0392B] text-white text-[14px] font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Hidden file input shared by both layouts */}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={handleFileChange} className="hidden" />
        </div>

        {cropModal}
      </div>
    );
  }

  // ── Add mode layout (unified with Edit shell) ──
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add product"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={handleDismiss}
    >
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal shell — same structure as Edit */}
      <div
        className="relative z-10 bg-white w-full h-full flex flex-col sm:h-auto sm:max-w-[800px] sm:mx-auto sm:rounded-xl sm:max-h-[min(700px,calc(100vh-3rem))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Mobile top nav bar ── */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10 sm:hidden">
          <button type="button" onClick={handleDismiss} className="text-[15px] text-neutral-500 hover:text-neutral-800 transition-colors">
            Cancel
          </button>
          <h2 className="text-[15px] font-semibold text-neutral-900">Add Product</h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="text-[15px] font-semibold text-[#C0392B] hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add"}
          </button>
        </div>

        {/* ── Full-width desktop header ── */}
        <div className="hidden sm:flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-neutral-900">Add Product</h2>
          <button type="button" onClick={handleDismiss} aria-label="Close" className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* ── Content area ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Desktop: 2-column */}
          <div className="hidden sm:flex gap-6 px-6 py-4 items-start">
            {/* Left ~40%: photo upload zone */}
            <div className="w-[35%] flex-shrink-0">
              <div
                className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border ${
                  photoUrl
                    ? "border-gray-200 bg-neutral-100"
                    : `border-dashed ${
                        draggingOver
                          ? "border-[#C0392B]/40 bg-[#C0392B]/5"
                          : errors.photo
                          ? "border-[#C0392B]/40 bg-red-50"
                          : "border-gray-300 bg-neutral-50"
                      }`
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#C0392B] rounded-full animate-spin" />
                    <span className="text-[13px] text-neutral-400 mt-2">Uploading...</span>
                  </div>
                ) : photoUrl ? (
                  <>
                    <Image src={photoUrl} alt="" fill unoptimized className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
                      <span className="text-white text-[14px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Change photo</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera className="w-12 h-12 text-neutral-300 mb-1" strokeWidth={1.5} />
                    <span className="text-[13px] font-medium text-neutral-500">Add photo</span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">Saved as draft without photo</span>
                  </div>
                )}
              </div>
              {errors.photo && <p className="text-[13px] text-[#C0392B] mt-1">{errors.photo}</p>}
            </div>

            {/* Right ~60%: form inputs */}
            <div className="flex-1 space-y-3">
              {nameInput}
              {oneLinerInput}
              {collectionSection}

              {errors.form && (
                <p className="text-[13px] text-[#C0392B]">{errors.form}</p>
              )}
            </div>
          </div>

          {/* Mobile: single-column */}
          <div className="sm:hidden px-5 pt-5 pb-3">
            {/* ── Group A: Text inputs (tight spacing) ── */}
            <div className="space-y-3">
              {/* Photo thumbnail + name on same row */}
              <div className="flex items-start gap-3">
                <div
                  className={`relative w-20 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer flex-shrink-0 ${
                    photoUrl
                      ? "bg-neutral-200"
                      : `border border-dashed ${
                          draggingOver
                            ? "border-[#C0392B]/40 bg-[#C0392B]/5"
                            : errors.photo
                            ? "border-[#C0392B]/40 bg-red-50"
                            : "border-gray-300 bg-neutral-50"
                        }`
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoUrl ? (
                    <>
                      <Image src={photoUrl} alt="" fill unoptimized className="object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Camera size={16} className="text-white" strokeWidth={2} />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Camera size={16} className="text-neutral-300" />
                      <span className="text-[9px] text-neutral-400 mt-0.5">Add photo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {nameInput}
                </div>
              </div>

              {oneLinerInput}
            </div>

            {/* ── Group B: Metadata (separated from Group A) ── */}
            <div className="mt-6 space-y-2">
              {collectionSection}

              {errors.form && (
                <p className="text-[13px] text-[#C0392B]">{errors.form}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Full-width footer ── */}
        <div className="hidden sm:flex items-center justify-end border-t border-gray-200 px-6 py-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleDismiss} className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-[#C0392B] text-white text-[14px] font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Product"}
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={handleFileChange} className="hidden" />
      </div>

      {cropModal}
    </div>
  );
}
