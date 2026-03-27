"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@/app/contexts/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

async function uploadProductPhoto(file: File, userId: string, productId: string): Promise<string> {
  const webpBlob = await convertToWebP(file);
  console.log(`Upload: ${Math.round(webpBlob.size / 1024)}KB webp → ${userId}/${productId}.webp`);
  const supabase = createClient();
  const filePath = `${userId}/${productId}.webp`;

  const { error } = await supabase.storage
    .from("product-photos")
    .upload(filePath, webpBlob, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    console.error("Storage error:", JSON.stringify(error));
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from("product-photos")
    .getPublicUrl(filePath);

  return data.publicUrl;
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
            className="text-[13px] font-medium px-3 py-1.5 rounded-md border border-gray-300 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
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

// ─── Main component ─────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [topPicks, setTopPicks] = useState<TopPick[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchCollections(), fetchTopPicks()]);
    setLoading(false);
  }, [fetchProducts, fetchCollections, fetchTopPicks]);

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

  async function handleRemoveTopPick(productId: string) {
    const res = await fetch(`/api/top-picks/${productId}`, { method: "DELETE" });
    if (res.ok) await fetchTopPicks();
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

  // ─── Lookups ────────────────────────────────────────────────────

  const collectionMap = new Map(collections.map((c) => [c.id, c]));
  const currentProducts = products.filter((p) => p.status === "current");

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
      <div className="mx-auto max-w-2xl px-4 pt-10 sm:pt-16 pb-16">
        <h1 className="text-2xl font-semibold text-neutral-900 [font-family:var(--font-space-grotesk)] mb-10">
          Dashboard
        </h1>

        {loading ? (
          <p className="text-neutral-400 text-[15px]">Loading data...</p>
        ) : (
          <div className="space-y-12">
            {/* ─── Top Picks ─────────────────────────────────────── */}
            <section>
              <h2 className="text-lg font-semibold text-neutral-900 [font-family:var(--font-space-grotesk)] mb-4">
                Top Picks
              </h2>
              {topPicks.length === 0 ? (
                <p className="text-[15px] text-neutral-400">
                  No top picks yet. Add products and they will appear here.
                </p>
              ) : (
                <div className="space-y-2">
                  {topPicks
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .slice(0, 5)
                    .map((tp, i) => (
                      <div
                        key={tp.id}
                        className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200"
                      >
                        <span className="text-[15px] font-semibold text-neutral-400 w-5 text-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <Thumbnail
                          src={tp.products?.photo_url ?? null}
                          alt={tp.products?.name ?? ""}
                        />
                        <span className="text-[15px] font-medium text-neutral-900 flex-1 min-w-0 truncate">
                          {tp.products?.name ?? "Unknown product"}
                        </span>
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

            {/* ─── Products ──────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 [font-family:var(--font-space-grotesk)]">
                  Products
                </h2>
                <button
                  onClick={() => {
                    setShowAddProduct(!showAddProduct);
                    setAddProductError("");
                    if (!showAddProduct && collections.length > 0) {
                      setNewProduct((prev) => ({
                        ...prev,
                        collection_id: prev.collection_id || collections[0].id,
                      }));
                    }
                  }}
                  className="text-[13px] font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "#C0392B" }}
                >
                  {showAddProduct ? "Cancel" : "+ Add Product"}
                </button>
              </div>

              {/* Add product form */}
              {showAddProduct && (
                <form
                  onSubmit={handleAddProduct}
                  className="bg-white rounded-lg border border-gray-200 p-4 mb-4 space-y-3"
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-neutral-600 mb-1">
                      Collection *
                    </label>
                    <select
                      value={newProduct.collection_id}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, collection_id: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
                    >
                      <option value="">Select collection</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B] resize-none"
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
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
                  <button
                    type="submit"
                    className="text-[14px] font-medium text-white px-4 py-2 rounded-md transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#C0392B" }}
                  >
                    Add Product
                  </button>
                </form>
              )}

              {/* Product list */}
              {currentProducts.length === 0 && !showAddProduct ? (
                <p className="text-[15px] text-neutral-400">No products yet.</p>
              ) : (
                <div className="space-y-2">
                  {currentProducts.map((p) => (
                    <div key={p.id}>
                      {editingProductId === p.id ? (
                        /* Inline edit form */
                        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
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
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
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
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B] resize-none"
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
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
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
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
                            >
                              {collections.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
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
                              className="text-[13px] font-medium text-white px-3 py-1.5 rounded-md transition-opacity hover:opacity-90"
                              style={{ backgroundColor: "#C0392B" }}
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
                        <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200">
                          <Thumbnail src={p.photo_url} alt={p.name} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-medium text-neutral-900 truncate">
                                {p.name}
                              </span>
                              <StatusBadge status={p.status} />
                            </div>
                            <span className="text-[13px] text-neutral-400">
                              {collectionMap.get(p.collection_id)?.name ?? "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => startEdit(p)}
                              className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                              Edit
                            </button>
                            <span className="text-neutral-200">|</span>
                            <button
                              onClick={() => handleArchive(p.id)}
                              className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                              Archive
                            </button>
                            <span className="text-neutral-200">|</span>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-[13px] text-neutral-400 hover:text-[#C0392B] transition-colors"
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
            </section>

            {/* ─── Collections ───────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 [font-family:var(--font-space-grotesk)]">
                  Collections
                </h2>
                <button
                  onClick={() => {
                    setShowAddCollection(!showAddCollection);
                    setAddCollectionError("");
                  }}
                  className="text-[13px] font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "#C0392B" }}
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
                      placeholder="e.g. Kitchen, Tech, Travel"
                    />
                    {addCollectionError && (
                      <p className="text-[13px] text-[#C0392B] mt-1">{addCollectionError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="text-[14px] font-medium text-white px-4 py-2 rounded-md transition-opacity hover:opacity-90 flex-shrink-0"
                    style={{ backgroundColor: "#C0392B" }}
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
                <div className="space-y-2">
                  {collections.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200"
                    >
                      {renamingCollectionId === c.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
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
                            className="text-[13px] font-medium hover:opacity-70 transition-opacity"
                            style={{ color: "#C0392B" }}
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
                            {productCountByCollection.get(c.id) || 0} products
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setRenamingCollectionId(c.id);
                                setRenameValue(c.name);
                                setRenameError("");
                              }}
                              className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                              Rename
                            </button>
                            <span className="text-neutral-200">|</span>
                            <button
                              onClick={() => handleDeleteCollection(c.id)}
                              className="text-[13px] text-neutral-400 hover:text-[#C0392B] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
