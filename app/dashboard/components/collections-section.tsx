"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ProductRow } from "./product-row";
import { SortableCollection, SortableProduct } from "./sortable-wrappers";
import { inputClass } from "../lib/utils";
import type { Product, Collection, Profile } from "../lib/types";

interface CollectionsSectionProps {
  products: Product[];
  collections: Collection[];
  profile: Profile | null;
  highlightProductId: string | null;
  productMenuOpen: string | null;
  showAddCollection: boolean;
  newCollectionName: string;
  addCollectionError: string;
  collectionError: string;
  renamingCollectionId: string | null;
  renameValue: string;
  renameError: string;
  collapsedCollections: Set<string>;
  collectionMenuOpen: string | null;
  productCountByCollection: Map<string, number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: SensorDescriptor<any>[];
  onSetProductMenuOpen: (id: string | null) => void;
  onSetShowAddCollection: (v: boolean) => void;
  onSetNewCollectionName: (v: string) => void;
  onSetAddCollectionError: (v: string) => void;
  onSetRenamingCollectionId: (id: string | null) => void;
  onSetRenameValue: (v: string) => void;
  onSetRenameError: (v: string) => void;
  onSetCollectionMenuOpen: (id: string | null) => void;
  onToggleCollapsed: (id: string) => void;
  onAddCollection: (e: React.FormEvent) => void;
  onRenameCollection: (id: string) => void;
  onDeleteCollection: (collection: Collection) => void;
  onEditProduct: (product: Product) => void;
  onArchiveProduct: (product: Product) => void;
  onAddProduct: (collectionId?: string) => void;
  onCollectionDragEnd: (event: DragEndEvent) => void;
  onProductDragEnd: (collectionId: string) => (event: DragEndEvent) => void;
  slugify: (name: string) => string;
}

export function CollectionsSection({
  products,
  collections,
  profile,
  highlightProductId,
  productMenuOpen,
  showAddCollection,
  newCollectionName,
  addCollectionError,
  collectionError,
  renamingCollectionId,
  renameValue,
  renameError,
  collapsedCollections,
  collectionMenuOpen,
  productCountByCollection,
  sensors,
  onSetProductMenuOpen,
  onSetShowAddCollection,
  onSetNewCollectionName,
  onSetAddCollectionError,
  onSetRenamingCollectionId,
  onSetRenameValue,
  onSetRenameError,
  onSetCollectionMenuOpen,
  onToggleCollapsed,
  onAddCollection,
  onRenameCollection,
  onDeleteCollection,
  onEditProduct,
  onArchiveProduct,
  onAddProduct,
  onCollectionDragEnd,
  onProductDragEnd,
  slugify,
}: CollectionsSectionProps) {
  const draftCount = products.filter((p) => p.status === "draft").length;

  return (
    <section>
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-neutral-900">
            Collections
          </h2>
          <button
            onClick={() => {
              onSetShowAddCollection(!showAddCollection);
              onSetAddCollectionError("");
            }}
            className="text-[13px] font-medium text-[#C0392B] hover:opacity-70 transition-opacity cursor-pointer"
          >
            {showAddCollection ? "Cancel" : "+ Add Collection"}
          </button>
        </div>
        {draftCount > 0 && (
          <p className="text-[13px] text-neutral-400">
            {draftCount} product{draftCount === 1 ? "" : "s"} need{draftCount === 1 ? "s a photo" : " photos"}
          </p>
        )}
      </div>

      {/* Add collection form */}
      {showAddCollection && (
        <form
          onSubmit={onAddCollection}
          className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-[13px] font-medium text-neutral-600 mb-1">
              Collection name
            </label>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => onSetNewCollectionName(e.target.value)}
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
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-8 text-center space-y-3">
          <h3 className="text-[18px] font-semibold text-neutral-900">
            No collections yet
          </h3>
          <p className="text-[14px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Group your products however you want — &ldquo;Desk Setup,&rdquo; &ldquo;Gym Bag,&rdquo; &ldquo;Kitchen Essentials,&rdquo; whatever fits.
          </p>
          <button
            onClick={() => { onSetShowAddCollection(true); onSetAddCollectionError(""); }}
            className="text-[14px] font-medium text-white px-5 py-2.5 rounded-md hover:opacity-90"
            style={{ backgroundColor: "#C0392B" }}
          >
            + Add Collection
          </button>
        </div>
      ) : collections.length === 1 && collections[0].name === "Products" ? (
        /* Default collection only — show products in a flat list */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 space-y-2">
            {products
              .filter((p) => p.status === "current" || p.status === "draft")
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  highlighted={highlightProductId === p.id}
                  menuOpen={productMenuOpen === p.id}
                  onToggleMenu={() => onSetProductMenuOpen(productMenuOpen === p.id ? null : p.id)}
                  onCloseMenu={() => onSetProductMenuOpen(null)}
                  onEdit={() => onEditProduct(p)}
                  onArchive={() => onArchiveProduct(p)}
                  className="rounded-md px-3 py-2 hover:bg-neutral-50"
                />
              ))}
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onCollectionDragEnd}>
          <SortableContext items={[...collections].sort((a, b) => a.sort_order - b.sort_order).map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {[...collections]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((c) => {
                  const isCollapsed = collapsedCollections.has(c.id);
                  const colProducts = products
                    .filter((p) => p.collection_id === c.id && (p.status === "current" || p.status === "draft"))
                    .sort((a, b) => a.sort_order - b.sort_order);
                  const pCount = productCountByCollection.get(c.id) || 0;

                  return (
                    <SortableCollection key={c.id} id={c.id}>
                      {({ handle }) => (
                        <div className="bg-white rounded-lg border border-gray-200 transition-all">
                          {/* Collection header row */}
                          <div className="flex items-center gap-2 px-4 py-3">
                            {handle}

                            <button
                              type="button"
                              onClick={() => onToggleCollapsed(c.id)}
                              aria-label={isCollapsed ? `Expand ${c.name}` : `Collapse ${c.name}`}
                              className="flex-shrink-0 p-0.5 hover:bg-neutral-100 rounded transition-colors"
                            >
                              <svg className={`w-4 h-4 transition-transform ${isCollapsed ? "" : "rotate-90"}`} viewBox="0 0 16 16" fill="currentColor">
                                <path d="M6 3l5 5-5 5V3z" />
                              </svg>
                            </button>

                            {renamingCollectionId === c.id ? (
                              <div className="flex-1 flex items-center gap-2 min-w-0">
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => onSetRenameValue(e.target.value)}
                                  className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") { e.preventDefault(); onRenameCollection(c.id); }
                                    if (e.key === "Escape") onSetRenamingCollectionId(null);
                                  }}
                                />
                                <button onClick={() => onRenameCollection(c.id)} className="text-[13px] font-medium text-[#C0392B] hover:opacity-70 transition-opacity">Save</button>
                                <button onClick={() => onSetRenamingCollectionId(null)} className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors">Cancel</button>
                                {renameError && <span className="text-[13px] text-[#C0392B]">{renameError}</span>}
                              </div>
                            ) : (
                              <>
                                <span className="text-[15px] font-medium text-neutral-900 flex-1 min-w-0 truncate">
                                  {c.name === "Products" && collections.length >= 2 ? "Uncategorized" : c.name}
                                </span>
                                <span className="text-[13px] text-neutral-400 flex-shrink-0">
                                  {pCount} {pCount === 1 ? "product" : "products"}
                                </span>
                              </>
                            )}

                            {/* Three-dot menu */}
                            {renamingCollectionId !== c.id && (
                              <div className="relative flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onSetCollectionMenuOpen(collectionMenuOpen === c.id ? null : c.id)}
                                  aria-label={`${c.name} options`}
                                  className="p-1 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 16 16" fill="currentColor">
                                    <circle cx="8" cy="3" r="1.5" />
                                    <circle cx="8" cy="8" r="1.5" />
                                    <circle cx="8" cy="13" r="1.5" />
                                  </svg>
                                </button>
                                {collectionMenuOpen === c.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => onSetCollectionMenuOpen(null)} />
                                    <div className="absolute right-0 top-8 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 w-52">
                                      <button
                                        onClick={async () => {
                                          onSetCollectionMenuOpen(null);
                                          if (profile?.username) {
                                            try { await navigator.clipboard.writeText(`https://sterp.com/${profile.username}#${slugify(c.name)}`); } catch {}
                                          }
                                        }}
                                        className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                                      >
                                        Copy link
                                      </button>
                                      <button
                                        onClick={() => {
                                          onSetRenamingCollectionId(c.id);
                                          onSetRenameValue(c.name);
                                          onSetRenameError("");
                                          onSetCollectionMenuOpen(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                                      >
                                        Rename
                                      </button>
                                      {pCount > 0 ? (
                                        <div className="px-4 py-2 text-[14px] text-neutral-300 cursor-not-allowed">
                                          Delete collection
                                          <span className="block text-[12px] text-neutral-400 mt-0.5">
                                            Move or archive products first
                                          </span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => { onSetCollectionMenuOpen(null); onDeleteCollection(c); }}
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

                          {/* Collapsible product list */}
                          {!isCollapsed && (
                            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                              <button
                                type="button"
                                onClick={() => onAddProduct(c.id)}
                                className="text-[13px] font-medium text-[#C0392B] hover:opacity-70 transition-opacity cursor-pointer"
                              >
                                + Add Product
                              </button>

                              {colProducts.length === 0 && (
                                <div className="py-4 text-center space-y-2">
                                  <p className="text-[14px] text-neutral-500">Add your first product</p>
                                  <button
                                    onClick={() => onAddProduct(c.id)}
                                    className="text-[13px] font-medium text-white px-4 py-1.5 rounded-md hover:opacity-90"
                                    style={{ backgroundColor: "#C0392B" }}
                                  >
                                    Add Product
                                  </button>
                                </div>
                              )}
                              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onProductDragEnd(c.id)}>
                                <SortableContext items={colProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                                  {colProducts.map((p) => (
                                    <SortableProduct key={p.id} id={p.id}>
                                      {({ handle }) => (
                                        <ProductRow
                                          product={p}
                                          highlighted={highlightProductId === p.id}
                                          menuOpen={productMenuOpen === `col-${p.id}`}
                                          onToggleMenu={() => onSetProductMenuOpen(productMenuOpen === `col-${p.id}` ? null : `col-${p.id}`)}
                                          onCloseMenu={() => onSetProductMenuOpen(null)}
                                          onEdit={() => onEditProduct(p)}
                                          onArchive={() => onArchiveProduct(p)}
                                          showDragHandle={handle}
                                          className="rounded-md px-3 py-2 hover:bg-neutral-50"
                                        />
                                      )}
                                    </SortableProduct>
                                  ))}
                                </SortableContext>
                              </DndContext>
                            </div>
                          )}
                        </div>
                      )}
                    </SortableCollection>
                  );
                })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
