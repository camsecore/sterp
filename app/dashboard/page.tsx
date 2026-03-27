"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@/app/contexts/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Clock } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

interface Product {
  id: string;
  collection_id: string;
  name: string;
  photo_url: string | null;
  one_liner: string | null;
  affiliate_url: string | null;
  original_url: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  archive_note: string | null;
  archived_at: string | null;
}

interface Collection {
  id: string;
  name: string;
  sort_order: number;
}

interface TopPick {
  id: string;
  product_id: string;
  sort_order: number;
  products: {
    id: string;
    name: string;
    photo_url: string | null;
    one_liner: string | null;
    affiliate_url: string | null;
  };
}

interface Profile {
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="h-10 w-10 rounded bg-neutral-200 overflow-hidden flex-shrink-0">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-neutral-400 text-xs">
          —
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isArchived = status === "archived";
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
        isArchived
          ? "bg-neutral-200 text-neutral-500"
          : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {isArchived ? "Archived" : "Active"}
    </span>
  );
}

async function convertToWebP(file: File): Promise<Blob> {
  const MAX_WIDTH = 1200;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
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
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

async function convertToSquareWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      const outSize = Math.min(size, 400);
      const canvas = document.createElement("canvas");
      canvas.width = outSize;
      canvas.height = outSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, sx, sy, size, size, 0, 0, outSize, outSize);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed"))),
        "image/webp",
        0.85
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

async function uploadProductPhoto(file: File, userId: string, productId: string): Promise<string> {
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

function PhotoUpload({
  currentUrl,
  onUpload,
  userId,
  productId,
}: {
  currentUrl: string | null;
  onUpload: (url: string) => void;
  userId: string;
  productId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Max 10MB");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const id = productId || crypto.randomUUID();
      const url = await uploadProductPhoto(file, userId, id);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-[13px] font-medium text-neutral-600 mb-1">
        Photo
      </label>
      <div className="flex items-center gap-3">
        {currentUrl ? (
          <div className="h-16 w-16 rounded bg-neutral-200 overflow-hidden flex-shrink-0">
            <img src={currentUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-16 w-16 rounded bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs flex-shrink-0">
            No photo
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-[13px] font-medium px-3 py-1.5 rounded-md border border-gray-200 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Uploading..." : currentUrl ? "Change photo" : "Upload photo"}
          </button>
          {error && <p className="text-[12px] text-[#C0392B]">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

// ─── Shared input classes ────────────────────────────────────────────

const inputClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40";

const selectClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40";

// ─── Main component ─────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [topPicks, setTopPicks] = useState<TopPick[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Copy link feedback
  const [copied, setCopied] = useState(false);

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile inline editing
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileTwitter, setProfileTwitter] = useState("");
  const [profileInstagram, setProfileInstagram] = useState("");
  const [profileYoutube, setProfileYoutube] = useState("");

  // Add product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    collection_id: "",
    one_liner: "",
    original_url: "",
    photo_url: "",
  });
  const [addProductError, setAddProductError] = useState("");

  // Edit product inline
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({
    name: "",
    one_liner: "",
    original_url: "",
    collection_id: "",
    photo_url: "",
  });
  const [editError, setEditError] = useState("");

  // Add collection
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [addCollectionError, setAddCollectionError] = useState("");

  // Rename collection
  const [renamingCollectionId, setRenamingCollectionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");

  // Collection errors (for delete)
  const [collectionError, setCollectionError] = useState("");

  // ─── Data fetching ──────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) setProducts(await res.json());
  }, []);

  const fetchCollections = useCallback(async () => {
    const res = await fetch("/api/collections");
    if (res.ok) setCollections(await res.json());
  }, []);

  const fetchTopPicks = useCallback(async () => {
    const res = await fetch("/api/top-picks");
    if (res.ok) setTopPicks(await res.json());
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("username, name, bio, avatar_url, twitter_url, instagram_url, youtube_url")
      .eq("id", user.id)
      .single();
    if (data) {
      setProfile(data);
      setProfileName(data.name || "");
      setProfileBio(data.bio || "");
      setProfileTwitter(data.twitter_url || "");
      setProfileInstagram(data.instagram_url || "");
      setProfileYoutube(data.youtube_url || "");
    }
  }, [user]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchCollections(), fetchTopPicks(), fetchProfile()]);
    setLoading(false);
  }, [fetchProducts, fetchCollections, fetchTopPicks, fetchProfile]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Initial data load
  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  // ─── Profile actions ─────────────────────────────────────────────

  async function saveProfileField(field: string, value: string) {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ [field]: value.trim() || null })
      .eq("id", user.id);
    if (!error) {
      setProfile((prev) => prev ? { ...prev, [field]: value.trim() || null } : prev);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) return;

    setAvatarUploading(true);
    try {
      const webpBlob = await convertToSquareWebP(file);
      const supabase = createClient();
      const filePath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from("product-photos")
        .upload(filePath, webpBlob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) throw new Error(uploadError.message);

      const avatar_url = `https://images.sterp.com/${filePath}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url })
        .eq("id", user.id);

      if (!updateError) {
        setProfile((prev) => prev ? { ...prev, avatar_url } : prev);
      }
    } catch {
      // silently fail
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  function handleCopyLink() {
    if (!profile?.username) return;
    navigator.clipboard.writeText(`sterp.com/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Product actions ────────────────────────────────────────────

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setAddProductError("");
    if (!newProduct.name.trim()) {
      setAddProductError("Name is required");
      return;
    }
    if (!newProduct.collection_id) {
      setAddProductError("Select a collection");
      return;
    }
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newProduct.name.trim(),
        collection_id: newProduct.collection_id,
        one_liner: newProduct.one_liner.trim() || null,
        original_url: newProduct.original_url.trim() || null,
        photo_url: newProduct.photo_url.trim() || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setAddProductError(data.error || "Failed to add product");
      return;
    }
    setNewProduct({ name: "", collection_id: "", one_liner: "", original_url: "", photo_url: "" });
    setShowAddProduct(false);
    await Promise.all([fetchProducts(), fetchTopPicks()]);
  }

  function startEdit(p: Product) {
    setEditingProductId(p.id);
    setEditFields({
      name: p.name,
      one_liner: p.one_liner || "",
      original_url: p.original_url || "",
      collection_id: p.collection_id,
      photo_url: p.photo_url || "",
    });
    setEditError("");
  }

  async function handleSaveEdit(id: string) {
    setEditError("");
    if (!editFields.name.trim()) {
      setEditError("Name is required");
      return;
    }
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editFields.name.trim(),
        one_liner: editFields.one_liner.trim() || null,
        original_url: editFields.original_url.trim() || null,
        collection_id: editFields.collection_id,
        photo_url: editFields.photo_url.trim() || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setEditError(data.error || "Failed to update product");
      return;
    }
    setEditingProductId(null);
    await fetchProducts();
  }

  async function handleArchive(id: string) {
    const note = prompt("Optional archive note (or leave empty):");
    if (note === null) return; // cancelled
    const res = await fetch(`/api/products/${id}/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive_note: note.trim() || null }),
    });
    if (res.ok) {
      await Promise.all([fetchProducts(), fetchTopPicks()]);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      await Promise.all([fetchProducts(), fetchTopPicks()]);
    }
  }

  // ─── Top Picks actions ─────────────────────────────────────────

  const [showAddTopPick, setShowAddTopPick] = useState(false);
  const [topPickSearch, setTopPickSearch] = useState("");
  const [topPickFilter, setTopPickFilter] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  async function handleRemoveTopPick(productId: string) {
    const res = await fetch(`/api/top-picks/${productId}`, { method: "DELETE" });
    if (res.ok) await fetchTopPicks();
  }

  async function handleAddTopPick(productId: string) {
    const res = await fetch("/api/top-picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    if (res.ok) {
      await fetchTopPicks();
      setShowAddTopPick(false);
      setTopPickSearch("");
      setTopPickFilter("");
    }
  }

  async function handleReorderTopPicks(fromIdx: number, toIdx: number) {
    const sorted = [...topPicks].sort((a, b) => a.sort_order - b.sort_order);
    const [moved] = sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved);
    // Optimistic update
    const reordered = sorted.map((tp, i) => ({ ...tp, sort_order: i + 1 }));
    setTopPicks(reordered);
    // Persist
    await fetch("/api/top-picks/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((tp) => tp.product_id) }),
    });
  }

  // ─── Collection + Product drag state ────────────────────────────

  const [collapsedCollections, setCollapsedCollections] = useState<Set<string>>(new Set());
  const [collectionMenuOpen, setCollectionMenuOpen] = useState<string | null>(null);
  const [dragCollectionIdx, setDragCollectionIdx] = useState<number | null>(null);
  const [dragProductInfo, setDragProductInfo] = useState<{ collectionId: string; idx: number } | null>(null);

  function toggleCollapsed(id: string) {
    setCollapsedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleReorderCollections(fromIdx: number, toIdx: number) {
    const sorted = [...collections].sort((a, b) => a.sort_order - b.sort_order);
    const [moved] = sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved);
    const reordered = sorted.map((c, i) => ({ ...c, sort_order: i }));
    setCollections(reordered);
    await fetch("/api/collections/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((c) => c.id) }),
    });
  }

  async function handleReorderProducts(collectionId: string, fromIdx: number, toIdx: number) {
    const colProducts = products
      .filter((p) => p.collection_id === collectionId && p.status === "current")
      .sort((a, b) => a.sort_order - b.sort_order);
    const [moved] = colProducts.splice(fromIdx, 1);
    colProducts.splice(toIdx, 0, moved);
    // Optimistic: update sort_order in local state
    const updatedIds = new Set(colProducts.map((p) => p.id));
    const newProducts = products.map((p) => {
      if (!updatedIds.has(p.id)) return p;
      const newIdx = colProducts.findIndex((cp) => cp.id === p.id);
      return { ...p, sort_order: newIdx };
    });
    setProducts(newProducts);
    await fetch("/api/products/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection_id: collectionId, order: colProducts.map((p) => p.id) }),
    });
  }

  // ─── Collection actions ─────────────────────────────────────────

  async function handleAddCollection(e: React.FormEvent) {
    e.preventDefault();
    setAddCollectionError("");
    if (!newCollectionName.trim()) {
      setAddCollectionError("Name is required");
      return;
    }
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCollectionName.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setAddCollectionError(data.error || "Failed to add collection");
      return;
    }
    setNewCollectionName("");
    setShowAddCollection(false);
    await fetchCollections();
  }

  async function handleRenameCollection(id: string) {
    setRenameError("");
    if (!renameValue.trim()) {
      setRenameError("Name is required");
      return;
    }
    const res = await fetch(`/api/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setRenameError(data.error || "Failed to rename");
      return;
    }
    setRenamingCollectionId(null);
    await fetchCollections();
  }

  async function handleDeleteCollection(id: string) {
    setCollectionError("");
    if (!confirm("Delete this collection?")) return;
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setCollectionError(data.error || "Failed to delete collection");
      return;
    }
    await fetchCollections();
  }

  // ─── Archive actions ───────────────────────────────────────────

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteValue, setEditNoteValue] = useState("");

  async function handleSaveArchiveNote(id: string) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive_note: editNoteValue.trim() || null }),
    });
    if (res.ok) {
      setEditingNoteId(null);
      await fetchProducts();
    }
  }

  async function handleDeleteArchived(id: string) {
    if (!confirm("Are you sure? This can't be undone.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) await fetchProducts();
  }

  function formatDuration(createdAt: string, archivedAt: string): string {
    const start = new Date(createdAt);
    const end = new Date(archivedAt);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months < 1) return "< 1 month";
    if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (rem === 0) return `${years} year${years === 1 ? "" : "s"}`;
    return `${years} year${years === 1 ? "" : "s"}, ${rem} month${rem === 1 ? "" : "s"}`;
  }

  // ─── Lookups ────────────────────────────────────────────────────

  const collectionMap = new Map(collections.map((c) => [c.id, c]));
  const currentProducts = products.filter((p) => p.status === "current");
  const archivedProducts = products
    .filter((p) => p.status === "archived")
    .sort((a, b) => {
      const aDate = a.archived_at ? new Date(a.archived_at).getTime() : 0;
      const bDate = b.archived_at ? new Date(b.archived_at).getTime() : 0;
      return bDate - aDate;
    });

  // Count products per collection
  const productCountByCollection = new Map<string, number>();
  for (const p of products) {
    const count = productCountByCollection.get(p.collection_id) || 0;
    productCountByCollection.set(p.collection_id, count + 1);
  }

  // ─── Loading / auth guard ──────────────────────────────────────

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <p className="text-neutral-400 text-[15px]">Loading...</p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:pt-14 pb-16">
        <h1 className="text-[22px] font-semibold text-neutral-900 mb-6">
          Dashboard
        </h1>

        {loading ? (
          <p className="text-neutral-400 text-[15px]">Loading data...</p>
        ) : (
          <div className="space-y-6">
            {/* ─── Section 1: Page Status Banner ──────────────── */}
            {profile?.username && (
              <>
                {currentProducts.length < 2 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-[15px] text-amber-800">
                      Add at least 2 products to make your page live at{" "}
                      <span className="font-medium">sterp.com/{profile.username}</span>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-[15px] text-emerald-800 font-medium">
                      Your page is live
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href={`/${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-[#C0392B] font-medium hover:opacity-70 transition-opacity"
                      >
                        View page
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="text-[13px] text-[#C0392B] font-medium hover:opacity-70 transition-opacity"
                      >
                        {copied ? "Copied!" : "Copy link"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ─── Section 2: Profile Card ────────────────────── */}
            {profile && (
              <section className="bg-white rounded-lg border border-gray-200 p-5">
                <h2 className="text-[17px] font-medium text-neutral-900 mb-4">
                  Profile
                </h2>

                {/* Avatar + Name + Bio */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="relative h-20 w-20 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0 group cursor-pointer"
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name || profile.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm">
                        Add
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[11px] font-medium">
                        {avatarUploading ? "..." : "Edit"}
                      </span>
                    </div>
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  {/* Name + Bio */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        onBlur={() => saveProfileField("name", profileName)}
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        onBlur={() => saveProfileField("bio", profileBio)}
                        rows={2}
                        className={`${inputClass} resize-none`}
                        placeholder="A short bio"
                      />
                    </div>
                  </div>
                </div>

                {/* Social links */}
                <div className="mt-4 space-y-2">
                  <label className="block text-[13px] font-medium text-neutral-600">
                    Social links
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={profileTwitter}
                      onChange={(e) => setProfileTwitter(e.target.value)}
                      onBlur={() => saveProfileField("twitter_url", profileTwitter)}
                      className={inputClass}
                      placeholder="x.com/username"
                    />
                    <input
                      type="text"
                      value={profileInstagram}
                      onChange={(e) => setProfileInstagram(e.target.value)}
                      onBlur={() => saveProfileField("instagram_url", profileInstagram)}
                      className={inputClass}
                      placeholder="instagram.com/username"
                    />
                    <input
                      type="text"
                      value={profileYoutube}
                      onChange={(e) => setProfileYoutube(e.target.value)}
                      onBlur={() => saveProfileField("youtube_url", profileYoutube)}
                      className={inputClass}
                      placeholder="youtube.com/@username"
                    />
                  </div>
                </div>

                {/* View My Page link */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[#C0392B] hover:opacity-70 transition-opacity"
                  >
                    View My Page →
                  </a>
                </div>
              </section>
            )}

            {/* ─── Section 3: Top Picks ──────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[17px] font-medium text-neutral-900">
                    Top Picks
                  </h2>
                  <span className="text-[13px] text-neutral-400 font-medium">
                    {topPicks.length}/5
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (topPicks.length < 5) {
                      setShowAddTopPick(!showAddTopPick);
                      setTopPickSearch("");
                      setTopPickFilter("");
                    }
                  }}
                  disabled={topPicks.length >= 5}
                  className="text-[13px] font-medium transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: "#C0392B" }}
                  title={topPicks.length >= 5 ? "Maximum 5 top picks" : undefined}
                >
                  {showAddTopPick ? "Cancel" : "+ Add to Top"}
                </button>
              </div>

              {/* Add to Top dropdown */}
              {showAddTopPick && (
                <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={topPickSearch}
                      onChange={(e) => setTopPickSearch(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-[14px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40"
                    />
                    <select
                      value={topPickFilter}
                      onChange={(e) => setTopPickFilter(e.target.value)}
                      className="rounded-md border border-gray-200 px-2 py-2 text-[14px] text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40"
                    >
                      <option value="">All collections</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {(() => {
                      const topPickProductIds = new Set(topPicks.map((tp) => tp.product_id));
                      const eligible = currentProducts
                        .filter((p) => !topPickProductIds.has(p.id))
                        .filter((p) => !topPickSearch || p.name.toLowerCase().includes(topPickSearch.toLowerCase()))
                        .filter((p) => !topPickFilter || p.collection_id === topPickFilter);
                      return eligible.length === 0 ? (
                        <p className="text-[13px] text-neutral-400 py-2 text-center">No matching products</p>
                      ) : (
                        eligible.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleAddTopPick(p.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-50 transition-colors text-left"
                          >
                            <Thumbnail src={p.photo_url} alt={p.name} />
                            <span className="text-[14px] font-medium text-neutral-900 flex-1 min-w-0 truncate">{p.name}</span>
                            <span className="text-[12px] text-neutral-400 flex-shrink-0">{collectionMap.get(p.collection_id)?.name}</span>
                          </button>
                        ))
                      );
                    })()}
                  </div>
                </div>
              )}

              {topPicks.length === 0 ? (
                <p className="text-[15px] text-neutral-400">
                  No top picks yet. Add your favorite products here.
                </p>
              ) : (
                <div className="space-y-2">
                  {[...topPicks]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .slice(0, 5)
                    .map((tp, i) => (
                      <div
                        key={tp.id}
                        draggable
                        onDragStart={() => setDragIdx(i)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add("ring-2", "ring-[#C0392B]/20");
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove("ring-2", "ring-[#C0392B]/20");
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove("ring-2", "ring-[#C0392B]/20");
                          if (dragIdx !== null && dragIdx !== i) {
                            handleReorderTopPicks(dragIdx, i);
                          }
                          setDragIdx(null);
                        }}
                        onDragEnd={() => setDragIdx(null)}
                        className={`flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200 cursor-grab active:cursor-grabbing transition-all ${
                          dragIdx === i ? "opacity-50" : ""
                        }`}
                      >
                        {/* Drag handle */}
                        <svg className="w-4 h-4 text-neutral-300 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="5" cy="3" r="1.5" />
                          <circle cx="11" cy="3" r="1.5" />
                          <circle cx="5" cy="8" r="1.5" />
                          <circle cx="11" cy="8" r="1.5" />
                          <circle cx="5" cy="13" r="1.5" />
                          <circle cx="11" cy="13" r="1.5" />
                        </svg>
                        <span className="text-[15px] font-semibold text-neutral-300 w-5 text-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <Thumbnail
                          src={tp.products?.photo_url ?? null}
                          alt={tp.products?.name ?? ""}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[15px] font-medium text-neutral-900 truncate block">
                            {tp.products?.name ?? "Unknown product"}
                          </span>
                          {(() => {
                            const product = products.find((p) => p.id === tp.product_id);
                            const col = product ? collectionMap.get(product.collection_id) : null;
                            return col ? (
                              <span className="text-[12px] text-neutral-400">{col.name}</span>
                            ) : null;
                          })()}
                        </div>
                        <button
                          onClick={() => handleRemoveTopPick(tp.product_id)}
                          className="text-[13px] text-neutral-400 hover:text-[#C0392B] transition-colors flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* ─── Section 4: Collections ─────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[17px] font-medium text-neutral-900">
                  Collections
                </h2>
                <button
                  onClick={() => {
                    setShowAddCollection(!showAddCollection);
                    setAddCollectionError("");
                  }}
                  className="text-[13px] font-medium text-[#C0392B] hover:opacity-70 transition-opacity"
                >
                  {showAddCollection ? "Cancel" : "+ Add Collection"}
                </button>
              </div>

              {/* Add collection form */}
              {showAddCollection && (
                <form
                  onSubmit={handleAddCollection}
                  className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-end gap-3"
                >
                  <div className="flex-1">
                    <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                      Collection name
                    </label>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Kitchen, Tech, Travel"
                    />
                    {addCollectionError && (
                      <p className="text-[13px] text-[#C0392B] mt-1">{addCollectionError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-[#C0392B] text-white text-[14px] font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity flex-shrink-0"
                  >
                    Add
                  </button>
                </form>
              )}

              {collectionError && (
                <p className="text-[13px] text-[#C0392B] mb-3">{collectionError}</p>
              )}

              {collections.length === 0 && !showAddCollection ? (
                <p className="text-[15px] text-neutral-400">No collections yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...collections]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((c, cIdx) => {
                      const isCollapsed = collapsedCollections.has(c.id);
                      const colProducts = products
                        .filter((p) => p.collection_id === c.id && p.status === "current")
                        .sort((a, b) => a.sort_order - b.sort_order);
                      const productCount = productCountByCollection.get(c.id) || 0;

                      return (
                        <div
                          key={c.id}
                          className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all ${
                            dragCollectionIdx === cIdx ? "opacity-50" : ""
                          }`}
                        >
                          {/* ── Collection header row ── */}
                          <div
                            draggable
                            onDragStart={() => {
                              setDragCollectionIdx(cIdx);
                              setDragProductInfo(null);
                            }}
                            onDragOver={(e) => {
                              if (dragProductInfo) return;
                              e.preventDefault();
                              e.currentTarget.classList.add("bg-neutral-50");
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove("bg-neutral-50");
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove("bg-neutral-50");
                              if (dragCollectionIdx !== null && dragCollectionIdx !== cIdx) {
                                handleReorderCollections(dragCollectionIdx, cIdx);
                              }
                              setDragCollectionIdx(null);
                            }}
                            onDragEnd={() => setDragCollectionIdx(null)}
                            className="flex items-center gap-2 px-4 py-3 cursor-grab active:cursor-grabbing"
                          >
                            {/* Drag handle */}
                            <svg className="w-4 h-4 text-neutral-300 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
                              <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
                              <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
                            </svg>

                            {/* Collapse chevron */}
                            <button
                              type="button"
                              onClick={() => toggleCollapsed(c.id)}
                              className="flex-shrink-0 p-0.5 hover:bg-neutral-100 rounded transition-colors"
                            >
                              <svg className={`w-4 h-4 transition-transform ${isCollapsed ? "" : "rotate-90"}`} viewBox="0 0 16 16" fill="currentColor">
                                <path d="M6 3l5 5-5 5V3z" />
                              </svg>
                            </button>

                            {/* Collection name or rename input */}
                            {renamingCollectionId === c.id ? (
                              <div className="flex-1 flex items-center gap-2 min-w-0">
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleRenameCollection(c.id);
                                    }
                                    if (e.key === "Escape") setRenamingCollectionId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleRenameCollection(c.id)}
                                  className="text-[13px] font-medium text-[#C0392B] hover:opacity-70 transition-opacity"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setRenamingCollectionId(null)}
                                  className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors"
                                >
                                  Cancel
                                </button>
                                {renameError && (
                                  <span className="text-[13px] text-[#C0392B]">{renameError}</span>
                                )}
                              </div>
                            ) : (
                              <>
                                <span className="text-[15px] font-medium text-neutral-900 flex-1 min-w-0 truncate">
                                  {c.name}
                                </span>
                                <span className="text-[13px] text-neutral-400 flex-shrink-0">
                                  {productCount} {productCount === 1 ? "product" : "products"}
                                </span>
                              </>
                            )}

                            {/* Three-dot menu */}
                            {renamingCollectionId !== c.id && (
                              <div className="relative flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setCollectionMenuOpen(collectionMenuOpen === c.id ? null : c.id)}
                                  className="p-1 hover:bg-neutral-100 rounded transition-colors"
                                >
                                  <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 16 16" fill="currentColor">
                                    <circle cx="8" cy="3" r="1.5" />
                                    <circle cx="8" cy="8" r="1.5" />
                                    <circle cx="8" cy="13" r="1.5" />
                                  </svg>
                                </button>
                                {collectionMenuOpen === c.id && (
                                  <>
                                    {/* Backdrop to close menu */}
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setCollectionMenuOpen(null)}
                                    />
                                    <div className="absolute right-0 top-8 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 w-52">
                                      <button
                                        onClick={() => {
                                          setRenamingCollectionId(c.id);
                                          setRenameValue(c.name);
                                          setRenameError("");
                                          setCollectionMenuOpen(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 hover:bg-neutral-50 transition-colors"
                                      >
                                        Rename
                                      </button>
                                      {productCount > 0 ? (
                                        <div className="px-4 py-2 text-[14px] text-neutral-300 cursor-not-allowed">
                                          Delete collection
                                          <span className="block text-[12px] text-neutral-400 mt-0.5">
                                            Move or archive products first
                                          </span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setCollectionMenuOpen(null);
                                            handleDeleteCollection(c.id);
                                          }}
                                          className="w-full text-left px-4 py-2 text-[14px] text-[#C0392B] hover:bg-neutral-50 transition-colors"
                                        >
                                          Delete collection
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* ── Collapsible product list ── */}
                          {!isCollapsed && (
                            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                              {/* Add Product button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddProduct(true);
                                  setNewProduct((prev) => ({ ...prev, collection_id: c.id }));
                                  setAddProductError("");
                                }}
                                className="text-[13px] font-medium text-[#C0392B] hover:opacity-70 transition-opacity"
                              >
                                + Add Product
                              </button>

                              {/* Inline add product form */}
                              {showAddProduct && newProduct.collection_id === c.id && (
                                <form
                                  onSubmit={handleAddProduct}
                                  className="bg-neutral-50 rounded-lg border border-gray-200 p-4 space-y-3"
                                >
                                  <div>
                                    <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                                      Name *
                                    </label>
                                    <input
                                      type="text"
                                      value={newProduct.name}
                                      onChange={(e) =>
                                        setNewProduct({ ...newProduct, name: e.target.value })
                                      }
                                      className={inputClass}
                                      placeholder="Product name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                                      One-liner{" "}
                                      <span className="text-neutral-400 font-normal">
                                        ({newProduct.one_liner.length}/160)
                                      </span>
                                    </label>
                                    <textarea
                                      value={newProduct.one_liner}
                                      onChange={(e) => {
                                        if (e.target.value.length <= 160) {
                                          setNewProduct({ ...newProduct, one_liner: e.target.value });
                                        }
                                      }}
                                      rows={2}
                                      className={`${inputClass} resize-none`}
                                      placeholder="Short description"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                                      Product URL
                                    </label>
                                    <input
                                      type="url"
                                      value={newProduct.original_url}
                                      onChange={(e) =>
                                        setNewProduct({ ...newProduct, original_url: e.target.value })
                                      }
                                      className={inputClass}
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <PhotoUpload
                                    currentUrl={newProduct.photo_url || null}
                                    onUpload={(url) => setNewProduct({ ...newProduct, photo_url: url })}
                                    userId={user.id}
                                  />
                                  {addProductError && (
                                    <p className="text-[13px] text-[#C0392B]">{addProductError}</p>
                                  )}
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="submit"
                                      className="bg-[#C0392B] text-white text-[14px] font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                                    >
                                      Add Product
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowAddProduct(false);
                                        setNewProduct({ name: "", collection_id: "", one_liner: "", original_url: "", photo_url: "" });
                                        setAddProductError("");
                                      }}
                                      className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              )}

                              {/* Product rows */}
                              {colProducts.length === 0 && !(showAddProduct && newProduct.collection_id === c.id) && (
                                <p className="text-[13px] text-neutral-400 py-1">No products in this collection.</p>
                              )}
                              {colProducts.map((p, pIdx) => (
                                <div key={p.id}>
                                  {editingProductId === p.id ? (
                                    /* Inline edit form */
                                    <div className="bg-neutral-50 rounded-lg border border-gray-200 p-4 space-y-3">
                                      <div>
                                        <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                                          Name
                                        </label>
                                        <input
                                          type="text"
                                          value={editFields.name}
                                          onChange={(e) =>
                                            setEditFields({ ...editFields, name: e.target.value })
                                          }
                                          className={inputClass}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                                          One-liner{" "}
                                          <span className="text-neutral-400 font-normal">
                                            ({editFields.one_liner.length}/160)
                                          </span>
                                        </label>
                                        <textarea
                                          value={editFields.one_liner}
                                          onChange={(e) => {
                                            if (e.target.value.length <= 160) {
                                              setEditFields({ ...editFields, one_liner: e.target.value });
                                            }
                                          }}
                                          rows={2}
                                          className={`${inputClass} resize-none`}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                                          Product URL
                                        </label>
                                        <input
                                          type="url"
                                          value={editFields.original_url}
                                          onChange={(e) =>
                                            setEditFields({ ...editFields, original_url: e.target.value })
                                          }
                                          className={inputClass}
                                        />
                                      </div>
                                      <PhotoUpload
                                        currentUrl={editFields.photo_url || null}
                                        onUpload={(url) => setEditFields({ ...editFields, photo_url: url })}
                                        userId={user.id}
                                        productId={p.id}
                                      />
                                      <div>
                                        <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                                          Collection
                                        </label>
                                        <select
                                          value={editFields.collection_id}
                                          onChange={(e) =>
                                            setEditFields({ ...editFields, collection_id: e.target.value })
                                          }
                                          className={selectClass}
                                        >
                                          {collections.map((col) => (
                                            <option key={col.id} value={col.id}>
                                              {col.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      {editError && (
                                        <p className="text-[13px] text-[#C0392B]">{editError}</p>
                                      )}
                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={() => handleSaveEdit(p.id)}
                                          className="bg-[#C0392B] text-white text-[14px] font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingProductId(null)}
                                          className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Product row */
                                    <div
                                      draggable
                                      onDragStart={() => {
                                        setDragProductInfo({ collectionId: c.id, idx: pIdx });
                                        setDragCollectionIdx(null);
                                      }}
                                      onDragOver={(e) => {
                                        if (!dragProductInfo || dragProductInfo.collectionId !== c.id) return;
                                        e.preventDefault();
                                        e.currentTarget.classList.add("ring-2", "ring-[#C0392B]/20");
                                      }}
                                      onDragLeave={(e) => {
                                        e.currentTarget.classList.remove("ring-2", "ring-[#C0392B]/20");
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove("ring-2", "ring-[#C0392B]/20");
                                        if (
                                          dragProductInfo &&
                                          dragProductInfo.collectionId === c.id &&
                                          dragProductInfo.idx !== pIdx
                                        ) {
                                          handleReorderProducts(c.id, dragProductInfo.idx, pIdx);
                                        }
                                        setDragProductInfo(null);
                                      }}
                                      onDragEnd={() => setDragProductInfo(null)}
                                      className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-50 transition-colors cursor-grab active:cursor-grabbing ${
                                        dragProductInfo?.collectionId === c.id && dragProductInfo?.idx === pIdx
                                          ? "opacity-50"
                                          : ""
                                      }`}
                                    >
                                      {/* Product drag handle */}
                                      <svg className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                        <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
                                        <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
                                        <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
                                      </svg>
                                      <Thumbnail src={p.photo_url} alt={p.name} />
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[15px] font-medium text-neutral-900 truncate block">
                                          {p.name}
                                        </span>
                                        {p.one_liner && (
                                          <span className="text-[13px] text-neutral-400 truncate block">
                                            {p.one_liner}
                                          </span>
                                        )}
                                      </div>
                                      <StatusBadge status={p.status} />
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                          onClick={() => startEdit(p)}
                                          className="text-[12px] text-neutral-500 hover:text-neutral-800 transition-colors"
                                        >
                                          Edit
                                        </button>
                                        <span className="text-neutral-200">|</span>
                                        <button
                                          onClick={() => handleArchive(p.id)}
                                          className="text-[12px] text-neutral-500 hover:text-neutral-800 transition-colors"
                                        >
                                          Archive
                                        </button>
                                        <span className="text-neutral-200">|</span>
                                        <button
                                          onClick={() => handleDeleteProduct(p.id)}
                                          className="text-[12px] text-neutral-400 hover:text-[#C0392B] transition-colors"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </section>

            {/* ─── Section 5: Archive ──────────────────────────── */}
            {archivedProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pt-4 border-t border-gray-200">
                  <Clock size={16} className="text-neutral-400" />
                  <h2 className="text-[17px] font-medium text-neutral-900">
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
                          <textarea
                            value={editNoteValue}
                            onChange={(e) => setEditNoteValue(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40 resize-none"
                            placeholder="Archive note..."
                            autoFocus
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSaveArchiveNote(p.id)}
                              className="text-[13px] font-medium text-white px-3 py-1.5 rounded-md hover:opacity-90"
                              style={{ backgroundColor: "#C0392B" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="text-[13px] text-neutral-500 hover:text-neutral-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3">
                          <Thumbnail src={p.photo_url} alt={p.name} />
                          <div className="flex-1 min-w-0">
                            <span className="text-[14px] font-medium text-neutral-900 truncate block">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.created_at && p.archived_at && (
                                <span className="text-[12px] text-neutral-400">
                                  Owned {formatDuration(p.created_at, p.archived_at)}
                                </span>
                              )}
                              {p.archive_note && (
                                <>
                                  <span className="text-neutral-200">·</span>
                                  <span className="text-[12px] text-neutral-400 truncate">
                                    {p.archive_note}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingNoteId(p.id);
                                setEditNoteValue(p.archive_note || "");
                              }}
                              className="text-[12px] text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                              Edit Note
                            </button>
                            <span className="text-neutral-200">|</span>
                            <button
                              onClick={() => handleDeleteArchived(p.id)}
                              className="text-[12px] text-neutral-400 hover:text-[#C0392B] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
