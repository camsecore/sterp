"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

// ─── Real product data ────────────────────────────────────────────────

const user = {
  name: "Cam Secore",
  username: "cam",
  bio: "I spend an unreasonable amount of time researching everything I buy. My wife is tired of hearing about it. This is the result.",
  avatarUrl: "/cam/cam.jpg",
  socials: {
    x: "https://x.com/camsecore",
    instagram: "https://instagram.com/camsecore",
    youtube: "https://youtube.com/@camsecore",
  },
};

const favorites = [
  {
    id: "f1",
    name: "Eight Sleep Pod Pro Cover",
    photo: "/cam/IMG_0443.jpeg",
    oneLiner: "Temperature control changed my sleep more than anything I've tried — supplements, blackout curtains, all of it. Only $2K purchase I'd repeat.",
    url: "#",
  },
  {
    id: "f2",
    name: "MacBook Pro M1 (2020)",
    photo: "/cam/macbook2018.jpg",
    oneLiner: "The first laptop I've owned where I've never once thought about upgrading. Two years in and the battery still does 10 hours.",
    url: "#",
  },
  {
    id: "f3",
    name: "Bertello Outdoor Pizza Oven",
    photo: "/cam/bertello.jpeg",
    oneLiner: "Makes a better pizza than most restaurants I've been to. The 900° stone is the whole game.",
    url: "#",
  },
  {
    id: "f4",
    name: "Oura Ring Gen 3",
    photo: "/cam/IMG_0419.jpeg",
    oneLiner: "More honest about my recovery than I want it to be. If I slept badly, it tells me.",
    url: "#",
  },
  {
    id: "f5",
    name: "Sony A6100",
    photo: "/cam/a6100.jpg",
    oneLiner: "The camera I recommend to anyone who asks. Fast autofocus, real image quality, doesn't cost a kidney.",
    url: "#",
  },
];

const collections = [
  {
    id: "c1",
    name: "Daily Tech",
    products: [
      {
        id: "p1",
        name: "iPhone 12 Pro",
        photo: "/cam/iphone12.jpeg",
        oneLiner: "Pacific Blue was the right call. I use ProRAW maybe once a month but it's there when it counts.",
        url: "#",
      },
      {
        id: "p2",
        name: "Apple TV 4K Gen 2",
        photo: "/cam/appletv4k.jpg",
        oneLiner: "Small box, massive upgrade. Everything is snappier and the new Siri remote is finally usable.",
        url: "#",
      },
      {
        id: "p3",
        name: "Eero Pro 6",
        photo: "/cam/eeropro.jpg",
        oneLiner: "Set it up once, never thought about wifi again. Dead zones in a 2,400sqft house completely gone.",
        url: "#",
      },
      {
        id: "p4",
        name: "HomePod mini",
        photo: "/cam/IMG_0433.jpeg",
        oneLiner: "Sounds way better than it has any right to at $99. Use it more as a desk speaker than a smart speaker.",
        url: "#",
      },
    ],
  },
  {
    id: "c2",
    name: "Health & Fitness",
    products: [
      {
        id: "p5",
        name: "Peloton Bike",
        photo: "/cam/IMG_0434.jpeg",
        oneLiner: "The only piece of fitness equipment I've used consistently for 3+ years. The subscription is the deal I had to make.",
        url: "#",
      },
      {
        id: "p6",
        name: "Dyson V15",
        photo: "/cam/dysonv11.jpg",
        oneLiner: "Replaced our upright vacuum entirely. Two floors twice a week on a single charge, still have battery left.",
        url: "#",
      },
      {
        id: "p7",
        name: "Apple Watch Series 7",
        photo: "/cam/IMG_0422.jpeg",
        oneLiner: "Upgraded from Series 5 for the bigger screen. Not sure the jump was worth $400 but I wear it every single day.",
        url: "#",
      },
      {
        id: "p8",
        name: "eufy Smart Scale C1",
        photo: "/cam/IMG_0414.jpeg",
        oneLiner: "Tracks body fat, muscle mass, the works. App is clean, no subscription required, just works.",
        url: "#",
      },
    ],
  },
  {
    id: "c3",
    name: "Smart Home",
    products: [
      {
        id: "p9",
        name: "Nanoleaf Smart Lights",
        photo: "/cam/IMG_0432.jpeg",
        oneLiner: "Installed these as a gimmick, now I can't imagine the office without them. Better than Hue for the price.",
        url: "#",
      },
      {
        id: "p10",
        name: "Sonos Roam",
        photo: "/cam/IMG_0415.jpeg",
        oneLiner: "The Bluetooth/wifi hybrid is the feature everyone overlooks. Sounds great for the size and works everywhere.",
        url: "#",
      },
    ],
  },
  {
    id: "c4",
    name: "Clothes",
    products: [],
  },
  {
    id: "c5",
    name: "Supplements",
    products: [],
  },
];

const archivedProducts = [
  {
    id: "a1",
    name: "iPhone 11 Pro",
    photo: "/cam/iphone11.jpeg",
    formerCollection: "Daily Tech",
    ownedDuration: "2 years, 1 month",
    archiveNote: "Midnight Green was peak Apple color design. Nothing since has looked as good.",
  },
  {
    id: "a2",
    name: "Apple Watch Series 5",
    photo: "/cam/series5.jpg",
    formerCollection: "Fitness & Health",
    ownedDuration: "2 years, 3 months",
    archiveNote: null,
  },
  {
    id: "a3",
    name: "MacBook Pro 15\" (Intel)",
    photo: "/cam/macbookpro15.jpg",
    formerCollection: "Daily Tech",
    ownedDuration: "3 years",
    archiveNote: "Powerful machine but the battery was embarrassing by the end. M1 made it feel like a toy.",
  },
];

// ─── Types for tabs ──────────────────────────────────────────────────

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
}: {
  name: string;
  photo: string;
  oneLiner: string;
  url: string;
}) {
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
        <div className="flex items-center justify-between mt-2">
          <a
            href={url}
            className="text-[13px] hover:opacity-70 transition-opacity"
            style={{ color: "#C0392B" }}
          >
            View Product →
          </a>
          <span className="text-[14px] font-bold opacity-30 [font-family:var(--font-space-grotesk)]" style={{ color: "#C0392B" }}>S</span>
        </div>
      </div>
    </div>
  );
}

function ArchiveCard({
  name,
  photo,
  formerCollection,
  ownedDuration,
  archiveNote,
}: {
  name: string;
  photo: string;
  formerCollection: string;
  ownedDuration: string;
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
            {ownedDuration}
          </span>
          <span className="text-[13px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            {formerCollection}
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

// ─── Page ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>({ kind: "favorites" });

  const isActive = (tab: Tab) => {
    if (activeTab.kind !== tab.kind) return false;
    if (tab.kind === "collection" && activeTab.kind === "collection") {
      return tab.collectionId === activeTab.collectionId;
    }
    return true;
  };

  // Each tab gets its own active color — cycles through the palette for collections
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
      label: "Top 5",
      activeClass: "",
      activeStyle: { backgroundColor: "#FDECEA", color: "#C0392B" },
    },
    ...collections.map((c, i) => ({
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

  // Resolve which products to show
  let content: React.ReactNode;

  if (activeTab.kind === "favorites") {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5 items-stretch [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:sm:justify-self-center [&>*:last-child:nth-child(odd)]:sm:w-1/2">
        {favorites.map((f) => (
          <ProductCard
            key={f.id}
            name={f.name}
            photo={f.photo}
            oneLiner={f.oneLiner}
            url={f.url}
          />
        ))}
      </div>
    );
  } else if (activeTab.kind === "collection") {
    const col = collections.find((c) => c.id === activeTab.collectionId);
    content = col && col.products.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5 items-stretch [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:sm:justify-self-center [&>*:last-child:nth-child(odd)]:sm:w-1/2">
        {col.products.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            photo={p.photo}
            oneLiner={p.oneLiner}
            url={p.url}
          />
        ))}
      </div>
    ) : (
      <p className="text-[15px] text-neutral-400 py-8">Nothing here yet.</p>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5 items-stretch [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:sm:justify-self-center [&>*:last-child:nth-child(odd)]:sm:w-1/2">
        {archivedProducts.map((a) => (
          <ArchiveCard
            key={a.id}
            name={a.name}
            photo={a.photo}
            formerCollection={a.formerCollection}
            ownedDuration={a.ownedDuration}
            archiveNote={a.archiveNote}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      {/* ── Profile header — white zone ── */}
      <div className="w-full">
        <header className="mx-auto max-w-2xl px-4 pt-10 sm:pt-16 pb-8">
          <div className="flex items-center gap-5">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-24 w-24 rounded-full object-cover flex-shrink-0 ring-4 ring-white/80 shadow-sm"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-neutral-900 leading-tight [font-family:var(--font-space-grotesk)]">
                {user.name}
              </h1>
              <p className="text-[16px] text-neutral-600 mt-1 leading-relaxed">
                {user.bio}
              </p>
              <div className="flex items-center gap-3 mt-3">
                {user.socials.x && (
                  <a href={user.socials.x} target="_blank" rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <IconX />
                  </a>
                )}
                {user.socials.instagram && (
                  <a href={user.socials.instagram} target="_blank" rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <IconInstagram />
                  </a>
                )}
                {user.socials.youtube && (
                  <a href={user.socials.youtube} target="_blank" rel="noopener noreferrer"
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
      {/* ── Tab bar ── */}
      <div className="relative mb-8 -mx-4">
        {/* Right fade gradient — scroll hint */}
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

      {/* ── Content grid ── */}
      <section>{content}</section>
    </main>
    </div>
  );
}
