"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

interface User {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

interface Collection {
  id: string;
  name: string;
  sort_order: number;
}

interface Product {
  id: string;
  collection_id: string;
  name: string;
  photo_url: string | null;
  one_liner: string | null;
  affiliate_url: string | null;
  status: string;
  sort_order: number;
  archive_note: string | null;
  archived_at: string | null;
}

interface TopPick {
  id: string;
  product_id: string;
  sort_order: number;
}

type Tab =
  | { kind: "favorites" }
  | { kind: "collection"; collectionId: string }
  | { kind: "archive" };

// ─── Social icons ────────────────────────────────────────────────────

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ─── Components ──────────────────────────────────────────────────────

function ProductCard({
  name,
  photo,
  oneLiner,
  url,
  productId,
  userId,
}: {
  name: string;
  photo: string;
  oneLiner: string;
  url: string;
  productId: string;
  userId: string;
}) {
  const handleClick = () => {
    fetch("/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        user_id: userId,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
      }),
    }).catch(() => {});
  };

  return (
    <div className="group flex flex-col rounded-md overflow-hidden border border-gray-200 bg-[#F0F4F8] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[18px] font-semibold text-neutral-900 leading-snug [font-family:var(--font-space-grotesk)]">
          {name}
        </h3>
        <p className="mt-1 text-[15px] text-neutral-700 leading-relaxed flex-grow">
          {oneLiner}
        </p>
        <a
          href={url}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-[13px] hover:opacity-70 transition-opacity"
          style={{ color: "#C0392B" }}
        >
          View Product →
        </a>
      </div>
    </div>
  );
}

function ArchiveCard({
  name,
  photo,
  collectionName,
  archiveNote,
}: {
  name: string;
  photo: string;
  collectionName: string;
  archiveNote: string | null;
}) {
  return (
    <div className="group flex flex-col rounded-md overflow-hidden border border-gray-200 bg-[#F0F4F8] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100 grayscale-[20%]">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="text-[18px] font-semibold text-neutral-900 leading-snug [font-family:var(--font-space-grotesk)]">
          {name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            {collectionName}
          </span>
        </div>
        {archiveNote && (
          <p className="text-[15px] text-neutral-500 italic leading-relaxed">
            &ldquo;{archiveNote}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main client component ───────────────────────────────────────────

export default function ProfileClient({
  user,
  collections,
  products,
  topPicks,
}: {
  user: User;
  collections: Collection[];
  products: Product[];
  topPicks: TopPick[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>({ kind: "favorites" });

  const isActive = (tab: Tab) => {
    if (activeTab.kind !== tab.kind) return false;
    if (tab.kind === "collection" && activeTab.kind === "collection") {
      return tab.collectionId === activeTab.collectionId;
    }
    return true;
  };

  // Build lookup maps
  const productMap = new Map(products.map((p) => [p.id, p]));
  const collectionMap = new Map(collections.map((c) => [c.id, c]));

  // Derive favorites from top_picks
  const favorites = topPicks
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((tp) => productMap.get(tp.product_id))
    .filter((p): p is Product => !!p);

  // Current (non-archived) products per collection
  const currentProducts = products.filter((p) => p.status === "current");
  const archivedProducts = products.filter((p) => p.status === "archived");

  // Sorted collections (only those with current products or in the sort order)
  const sortedCollections = [...collections].sort((a, b) => a.sort_order - b.sort_order);

  // Tab colors
  const collectionColors = [
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-yellow-100 text-yellow-700",
    "bg-fuchsia-100 text-fuchsia-700",
    "bg-teal-100 text-teal-700",
  ];

  const tabs: { tab: Tab; label: string; activeClass: string; activeStyle?: React.CSSProperties }[] = [
    {
      tab: { kind: "favorites" },
      label: `Top ${topPicks.length}`,
      activeClass: "",
      activeStyle: { backgroundColor: "#FDECEA", color: "#C0392B" },
    },
    ...sortedCollections.map((c, i) => ({
      tab: { kind: "collection" as const, collectionId: c.id },
      label: c.name,
      activeClass: collectionColors[i % collectionColors.length],
    })),
    {
      tab: { kind: "archive" },
      label: "Archive",
      activeClass: "bg-neutral-900 text-white",
    },
  ];

  // Grid class shared across all content views
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5 items-stretch [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:sm:justify-self-center [&>*:last-child:nth-child(odd)]:sm:w-1/2";

  let content: React.ReactNode;

  if (activeTab.kind === "favorites") {
    content = (
      <div className={gridClass}>
        {favorites.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            photo={p.photo_url ?? ""}
            oneLiner={p.one_liner ?? ""}
            url={p.affiliate_url ?? "#"}
            productId={p.id}
            userId={user.id}
          />
        ))}
      </div>
    );
  } else if (activeTab.kind === "collection") {
    const colProducts = currentProducts
      .filter((p) => p.collection_id === activeTab.collectionId)
      .sort((a, b) => a.sort_order - b.sort_order);
    content = colProducts.length > 0 ? (
      <div className={gridClass}>
        {colProducts.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            photo={p.photo_url ?? ""}
            oneLiner={p.one_liner ?? ""}
            url={p.affiliate_url ?? "#"}
            productId={p.id}
            userId={user.id}
          />
        ))}
      </div>
    ) : (
      <p className="text-[15px] text-neutral-400 py-8">Nothing here yet.</p>
    );
  } else {
    content = (
      <div className={gridClass}>
        {archivedProducts.map((p) => (
          <ArchiveCard
            key={p.id}
            name={p.name}
            photo={p.photo_url ?? ""}
            collectionName={collectionMap.get(p.collection_id)?.name ?? ""}
            archiveNote={p.archive_note}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      <div className="w-full">
        <header className="mx-auto max-w-2xl px-4 pt-10 sm:pt-16 pb-8">
          <div className="flex items-center gap-5">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.name ?? user.username}
                className="h-24 w-24 rounded-full object-cover flex-shrink-0 ring-4 ring-white/80 shadow-sm"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-neutral-900 leading-tight [font-family:var(--font-space-grotesk)]">
                {user.name ?? user.username}
              </h1>
              {user.bio && (
                <p className="text-[16px] text-neutral-600 mt-1 leading-relaxed">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {user.twitter_url && (
                  <a href={user.twitter_url} target="_blank" rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <IconX />
                  </a>
                )}
                {user.instagram_url && (
                  <a href={user.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <IconInstagram />
                  </a>
                )}
                {user.youtube_url && (
                  <a href={user.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <IconYouTube />
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="mx-auto w-full max-w-2xl px-4 pb-10 sm:pb-16">
        <div className="relative mb-8 -mx-4">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#EEF2F7] to-transparent z-10" />
          <nav className="flex overflow-x-auto tab-scrollbar px-4">
            <div className="flex items-center gap-1.5 pb-2 mx-auto">
              {tabs.map(({ tab, label, activeClass, activeStyle }, i) => {
                const isArchive = tab.kind === "archive";
                const active = isActive(tab);

                return (
                  <button
                    key={i}
                    onClick={() => setActiveTab(tab)}
                    style={active && activeStyle ? activeStyle : undefined}
                    className={`
                      whitespace-nowrap rounded-full px-4 py-1.5 text-[15px] font-semibold [font-family:var(--font-space-grotesk)] transition-all duration-150
                      ${isArchive ? "ml-4" : ""}
                      ${active
                        ? activeClass
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                      }
                    `}
                  >
                    {isArchive ? (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Archive
                      </span>
                    ) : label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <section>{content}</section>
      </main>
    </div>
  );
}
