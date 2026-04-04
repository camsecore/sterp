"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
  created_at: string;
  archive_note: string | null;
  archived_at: string | null;
  acquired_at: string | null;
}

interface Obsession {
  id: string;
  product_id: string;
  sort_order: number;
}

type Tab =
  | { kind: "favorites" }
  | { kind: "collection"; collectionId: string }
  | { kind: "archive" };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

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
  rank,
}: {
  name: string;
  photo: string;
  oneLiner: string;
  url: string | null;
  productId: string;
  userId: string;
  rank?: number;
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
    <div className={`group flex flex-col rounded-md overflow-hidden border bg-[#F0F4F8] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${rank != null ? "border-[#C0392B]/25" : "border-gray-200"}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
        {rank != null && (
          <span className="absolute top-2 right-2 w-[26px] h-[26px] rounded-full text-white text-[13px] font-semibold flex items-center justify-center backdrop-blur-[4px] [font-family:var(--font-space-grotesk)]" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
            {rank}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[18px] font-semibold text-neutral-900 leading-snug [font-family:var(--font-space-grotesk)]">
          {name}
        </h3>
        <p className="mt-1 text-[15px] text-neutral-700 leading-relaxed flex-grow">
          {oneLiner}
        </p>
        {url && (
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
        )}
      </div>
    </div>
  );
}

function formatDuration(createdAt: string, archivedAt: string): string {
  const start = new Date(createdAt);
  const end = new Date(archivedAt);
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (totalMonths < 1) return "Owned for < 1 month";
  if (totalMonths < 12) return `Owned for ${totalMonths} month${totalMonths === 1 ? "" : "s"}`;
  const years = totalMonths / 12;
  const cleanHalf = totalMonths % 6 === 0;
  if (cleanHalf && totalMonths % 12 !== 0) return `Owned for ${years} years`;
  const wholeYears = Math.round(years);
  return `Owned for ${wholeYears} year${wholeYears === 1 ? "" : "s"}`;
}

function ArchiveCard({
  name,
  photo,
  archiveNote,
  createdAt,
  archivedAt,
}: {
  name: string;
  photo: string;
  archiveNote: string | null;
  createdAt: string;
  archivedAt: string | null;
}) {
  return (
    <div className="group flex flex-col rounded-md overflow-hidden border border-gray-200 bg-[#F0F4F8] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[18px] font-semibold text-neutral-900 leading-snug [font-family:var(--font-space-grotesk)]">
          {name}
        </h3>
        {archivedAt && (
          <span className="inline-block mt-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full w-fit">
            {formatDuration(createdAt, archivedAt)}
          </span>
        )}
        {archiveNote && (
          <p className="mt-2.5 text-[15px] text-neutral-700 leading-relaxed flex-grow">
            {archiveNote}
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
  obsessions,
}: {
  user: User;
  collections: Collection[];
  products: Product[];
  obsessions: Obsession[];
}) {
  // Build lookup maps
  const productMap = new Map(products.map((p) => [p.id, p]));
  const collectionMap = new Map(collections.map((c) => [c.id, c]));

  // Derive favorites from obsessions
  const favorites = obsessions
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((tp) => productMap.get(tp.product_id))
    .filter((p): p is Product => !!p && p.status === "current");

  // Current (non-archived) products per collection
  const currentProducts = products.filter((p) => p.status === "current");
  const archivedProducts = products
    .filter((p) => p.status === "archived")
    .sort((a, b) => new Date(b.archived_at ?? 0).getTime() - new Date(a.archived_at ?? 0).getTime());

  // Sorted collections — only show those with at least one current product
  const collectionsWithProducts = new Set(currentProducts.map((p) => p.collection_id));
  const sortedCollections = [...collections]
    .filter((c) => collectionsWithProducts.has(c.id))
    .sort((a, b) => a.sort_order - b.sort_order);

  const resolveTabFromHash = useCallback((): Tab => {
    if (typeof window === "undefined") return favorites.length > 0 ? { kind: "favorites" } : sortedCollections.length > 0 ? { kind: "collection", collectionId: sortedCollections[0].id } : { kind: "favorites" };
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return favorites.length > 0 ? { kind: "favorites" } : sortedCollections.length > 0 ? { kind: "collection", collectionId: sortedCollections[0].id } : { kind: "favorites" };
    if (hash === "top" || hash === "favorites") return { kind: "favorites" };
    if (hash === "archive") return { kind: "archive" };
    const match = sortedCollections.find((c) => slugify(c.name) === hash);
    if (match) return { kind: "collection", collectionId: match.id };
    return favorites.length > 0 ? { kind: "favorites" } : sortedCollections.length > 0 ? { kind: "collection", collectionId: sortedCollections[0].id } : { kind: "favorites" };
  }, [favorites.length, sortedCollections]);

  const [activeTab, setActiveTabState] = useState<Tab>(resolveTabFromHash);

  const setActiveTab = useCallback((tab: Tab) => {
    setActiveTabState(tab);
    let hash = "";
    if (tab.kind === "favorites") hash = "top";
    else if (tab.kind === "archive") hash = "archive";
    else {
      const col = collections.find((c) => c.id === tab.collectionId);
      if (col) hash = slugify(col.name);
    }
    window.history.replaceState(null, "", hash ? `#${hash}` : window.location.pathname);
  }, [collections]);

  useEffect(() => {
    function onHashChange() {
      setActiveTabState(resolveTabFromHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [resolveTabFromHash]);

  const isActive = (tab: Tab) => {
    if (activeTab.kind !== tab.kind) return false;
    if (tab.kind === "collection" && activeTab.kind === "collection") {
      return tab.collectionId === activeTab.collectionId;
    }
    return true;
  };

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

  // Named collections only (exclude default "Products" bucket)
  const namedCollections = sortedCollections.filter((c) => c.name !== "Products");

  const tabs: { tab: Tab; label: string; activeClass: string; activeStyle?: React.CSSProperties }[] = [
    ...(favorites.length > 0
      ? [{
          tab: { kind: "favorites" as const },
          label: "Obsessions",
          activeClass: "",
          activeStyle: { backgroundColor: "#FDECEA", color: "#C0392B" },
        }]
      : []),
    ...namedCollections.map((c, i) => ({
      tab: { kind: "collection" as const, collectionId: c.id },
      label: c.name,
      activeClass: collectionColors[i % collectionColors.length],
    })),
    ...(archivedProducts.length > 0
      ? [{
          tab: { kind: "archive" as const },
          label: "Archive",
          activeClass: "bg-neutral-900 text-white",
        }]
      : []),
  ];

  // Grid class shared across all content views
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5 items-stretch [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:sm:justify-self-center [&>*:last-child:nth-child(odd)]:sm:w-1/2";

  let content: React.ReactNode;

  if (activeTab.kind === "favorites") {
    content = (
      <div className={gridClass}>
        {favorites.map((p, i) => (
          <ProductCard
            key={p.id}
            name={p.name}
            photo={p.photo_url ?? ""}
            oneLiner={p.one_liner ?? ""}
            url={p.affiliate_url ?? null}
            productId={p.id}
            userId={user.id}
            rank={i + 1}
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
            url={p.affiliate_url ?? null}
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
            archiveNote={p.archive_note}
            createdAt={p.acquired_at ?? p.created_at}
            archivedAt={p.archived_at}
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
              <Image
                src={user.avatar_url}
                alt={user.name ?? user.username}
                width={96}
                height={96}
                sizes="96px"
                className="rounded-full object-cover flex-shrink-0 ring-4 ring-white/80 shadow-sm"
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
                  <a href={user.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
                    className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <IconX />
                  </a>
                )}
                {user.instagram_url && (
                  <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <IconInstagram />
                  </a>
                )}
                {user.youtube_url && (
                  <a href={user.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
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

      <footer className="mt-16 mb-8 flex flex-col items-center gap-3">
        <Image
          src="/logo-charcoal.png"
          alt="Sterp"
          width={72}
          height={24}
          className="h-[24px] w-auto opacity-40"
        />
        <span className="text-[13px] text-gray-300">
          &copy; Sterp 2026 &middot; <Link href="/terms" className="underline hover:text-gray-400 transition-colors">Terms</Link> &middot; <Link href="/privacy" className="underline hover:text-gray-400 transition-colors">Privacy</Link>
        </span>
      </footer>
    </div>
  );
}
