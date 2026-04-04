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
import { Thumbnail } from "./thumbnail";
import { CustomDropdown } from "./custom-dropdown";
import { SortableObsession } from "./sortable-wrappers";
import type { Product, Collection, Obsession } from "../lib/types";

interface ObsessionsSectionProps {
  products: Product[];
  collections: Collection[];
  obsessions: Obsession[];
  currentProducts: Product[];
  phase: number;
  highlightProductId: string | null;
  productMenuOpen: string | null;
  showAddObsession: boolean;
  obsessionSearch: string;
  obsessionFilter: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: SensorDescriptor<any>[];
  collectionMap: Map<string, Collection>;
  onSetProductMenuOpen: (id: string | null) => void;
  onSetShowAddObsession: (v: boolean) => void;
  onSetObsessionSearch: (v: string) => void;
  onSetObsessionFilter: (v: string) => void;
  onEditProduct: (product: Product) => void;
  onRemoveObsession: (productId: string) => void;
  onAddObsession: (productId: string) => void;
  onObsessionDragEnd: (event: DragEndEvent) => void;
}

export function ObsessionsSection({
  products,
  collections,
  obsessions,
  currentProducts,
  phase,
  highlightProductId,
  productMenuOpen,
  showAddObsession,
  obsessionSearch,
  obsessionFilter,
  sensors,
  collectionMap,
  onSetProductMenuOpen,
  onSetShowAddObsession,
  onSetObsessionSearch,
  onSetObsessionFilter,
  onEditProduct,
  onRemoveObsession,
  onAddObsession,
  onObsessionDragEnd,
}: ObsessionsSectionProps) {
  const sorted = [...obsessions].sort((a, b) => a.sort_order - b.sort_order).slice(0, 5);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[20px] font-semibold text-neutral-900">
            Obsessions
          </h2>
          <span className="text-[13px] text-neutral-400 font-medium">
            {obsessions.length}/5
          </span>
        </div>
        {phase >= 3 && (
          <button
            onClick={() => {
              if (obsessions.length < 5) {
                onSetShowAddObsession(!showAddObsession);
                onSetObsessionSearch("");
                onSetObsessionFilter("");
              }
            }}
            disabled={obsessions.length >= 5}
            className="text-[13px] font-medium transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            style={{ color: "#C0392B" }}
            title={obsessions.length >= 5 ? "Maximum 5 obsessions" : undefined}
          >
            {showAddObsession ? "Cancel" : "+ Add to Obsessions"}
          </button>
        )}
      </div>

      {/* Add to Obsessions dropdown */}
      {showAddObsession && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={obsessionSearch}
              onChange={(e) => onSetObsessionSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-[14px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]/40"
            />
            <CustomDropdown
              value={obsessionFilter}
              options={[
                { value: "", label: "All collections" },
                ...collections.map((c) => ({ value: c.id, label: c.name })),
              ]}
              onChange={onSetObsessionFilter}
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {(() => {
              const obsessionProductIds = new Set(obsessions.map((tp) => tp.product_id));
              const eligible = currentProducts
                .filter((p) => !obsessionProductIds.has(p.id))
                .filter((p) => !obsessionSearch || p.name.toLowerCase().includes(obsessionSearch.toLowerCase()))
                .filter((p) => !obsessionFilter || p.collection_id === obsessionFilter);
              return eligible.length === 0 ? (
                <p className="text-[13px] text-neutral-400 py-2 text-center">No matching products</p>
              ) : (
                eligible.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onAddObsession(p.id)}
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

      {obsessions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-6 text-center">
          <p className="text-[15px] text-neutral-500">
            Add products to your Obsessions — these are the first thing visitors see.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onObsessionDragEnd}>
          <SortableContext items={sorted.map((tp) => tp.product_id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sorted.map((tp, i) => (
                <SortableObsession key={tp.product_id} id={tp.product_id}>
                  {({ handle }) => {
                    const tpProduct = products.find((p) => p.id === tp.product_id);
                    const menuId = `tp-${tp.product_id}`;
                    return (
                      <div data-product-id={tp.product_id} className={`flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200 transition-all duration-700 ${highlightProductId === tp.product_id ? "ring-2 ring-emerald-400 bg-emerald-50" : ""}`}>
                        {handle}
                        <span className="text-[15px] font-semibold text-neutral-300 w-5 text-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <Thumbnail
                          src={tp.products?.photo_url ?? null}
                          alt={tp.products?.name ?? ""}
                        />
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (tpProduct) onEditProduct(tpProduct);
                          }}
                        >
                          <span className="text-[15px] font-medium text-neutral-900 truncate block">
                            {tp.products?.name ?? "Unknown product"}
                          </span>
                          {(() => {
                            const col = tpProduct ? collectionMap.get(tpProduct.collection_id) : null;
                            return col ? (
                              <span className="text-[12px] text-neutral-400">{col.name === "Products" && collections.length >= 2 ? "Uncategorized" : col.name}</span>
                            ) : null;
                          })()}
                        </div>
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => onSetProductMenuOpen(productMenuOpen === menuId ? null : menuId)}
                            aria-label={`${tp.products?.name ?? "Product"} options`}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="3" r="1.5" />
                              <circle cx="8" cy="8" r="1.5" />
                              <circle cx="8" cy="13" r="1.5" />
                            </svg>
                          </button>
                          {productMenuOpen === menuId && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => onSetProductMenuOpen(null)} />
                              <div className="absolute right-0 top-8 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 w-56">
                                <button
                                  onClick={() => { onSetProductMenuOpen(null); if (tpProduct) onEditProduct(tpProduct); }}
                                  className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => { onSetProductMenuOpen(null); onRemoveObsession(tp.product_id); }}
                                  className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                                >
                                  Remove from Obsessions
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }}
                </SortableObsession>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
