/**
 * Seed script for Sterp v2
 *
 * Prerequisites:
 *   npm install dotenv tsx    (dotenv and tsx are needed as dev deps)
 *
 * Run with:
 *   npx tsx scripts/seed.ts
 *
 * Uses the SERVICE_ROLE_KEY to bypass RLS.
 * Uploads images from public/cam/ to Supabase Storage, then seeds
 * user, collections, products, and top_picks.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// ---------------------------------------------------------------------------
// Load env
// ---------------------------------------------------------------------------
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
} catch {
  console.error(
    "dotenv is not installed. Run: npm install --save-dev dotenv"
  );
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = "product-photos";
const PUBLIC_DIR = path.resolve(__dirname, "../public/cam");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function uuid(): string {
  return crypto.randomUUID();
}

async function uploadImage(filename: string): Promise<string> {
  const filePath = path.join(PUBLIC_DIR, filename);
  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = `cam/${filename}`;

  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const contentType = mimeMap[ext ?? ""] ?? "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed for ${filename}: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------
const USER_ID = "5397d2b3-a7bb-4fd5-be9c-e1bbdb9931bb";

const COLLECTIONS_DEF = [
  { name: "Daily Tech", sort_order: 0 },
  { name: "Health & Fitness", sort_order: 1 },
  { name: "Smart Home", sort_order: 2 },
  { name: "Clothes", sort_order: 3 },
  { name: "Supplements", sort_order: 4 },
] as const;

// We'll populate IDs after insert
const collectionIds: Record<string, string> = {};

// Products grouped by collection name
// Each entry: { name, photo, one_liner?, status?, archive_note?, archived_at? }
interface ProductDef {
  name: string;
  photo: string;
  collection: string;
  one_liner?: string;
  status: "current" | "archived";
  archive_note?: string;
  archived_at?: string;
  isFavorite?: boolean;
  favoriteSortOrder?: number;
}

const PRODUCTS: ProductDef[] = [
  // ---- Favorites (also in their respective collections) ----
  // ---- Favorites (also in their respective collections) ----
  {
    name: "Eight Sleep Pod Pro Cover",
    photo: "IMG_0443.jpeg",
    collection: "Health & Fitness",
    one_liner: "Temperature control changed my sleep more than anything I've tried — supplements, blackout curtains, all of it. Only $2K purchase I'd repeat.",
    status: "current",
    isFavorite: true,
    favoriteSortOrder: 1,
  },
  {
    name: "MacBook Pro M1 (2020)",
    photo: "macbook2018.jpg",
    collection: "Daily Tech",
    one_liner: "The first laptop I've owned where I've never once thought about upgrading. Two years in and the battery still does 10 hours.",
    status: "current",
    isFavorite: true,
    favoriteSortOrder: 2,
  },
  {
    name: "Bertello Outdoor Pizza Oven",
    photo: "bertello.jpeg",
    collection: "Smart Home",
    one_liner: "Makes a better pizza than most restaurants I've been to. The 900° stone is the whole game.",
    status: "current",
    isFavorite: true,
    favoriteSortOrder: 3,
  },
  {
    name: "Oura Ring Gen 3",
    photo: "IMG_0419.jpeg",
    collection: "Health & Fitness",
    one_liner: "More honest about my recovery than I want it to be. If I slept badly, it tells me.",
    status: "current",
    isFavorite: true,
    favoriteSortOrder: 4,
  },
  {
    name: "Sony A6100",
    photo: "a6100.jpg",
    collection: "Daily Tech",
    one_liner: "The camera I recommend to anyone who asks. Fast autofocus, real image quality, doesn't cost a kidney.",
    status: "current",
    isFavorite: true,
    favoriteSortOrder: 5,
  },

  // ---- Daily Tech ----
  {
    name: "iPhone 12 Pro",
    photo: "iphone12.jpeg",
    collection: "Daily Tech",
    one_liner: "Pacific Blue was the right call. I use ProRAW maybe once a month but it's there when it counts.",
    status: "current",
  },
  {
    name: "Apple TV 4K Gen 2",
    photo: "appletv4k.jpg",
    collection: "Daily Tech",
    one_liner: "Small box, massive upgrade. Everything is snappier and the new Siri remote is finally usable.",
    status: "current",
  },
  {
    name: "Eero Pro 6",
    photo: "eeropro.jpg",
    collection: "Daily Tech",
    one_liner: "Set it up once, never thought about wifi again. Dead zones in a 2,400sqft house completely gone.",
    status: "current",
  },
  {
    name: "HomePod mini",
    photo: "IMG_0433.jpeg",
    collection: "Daily Tech",
    one_liner: "Sounds way better than it has any right to at $99. Use it more as a desk speaker than a smart speaker.",
    status: "current",
  },

  // ---- Health & Fitness ----
  {
    name: "Peloton Bike",
    photo: "IMG_0434.jpeg",
    collection: "Health & Fitness",
    one_liner: "The only piece of fitness equipment I've used consistently for 3+ years. The subscription is the deal I had to make.",
    status: "current",
  },
  {
    name: "Dyson V15",
    photo: "dysonv11.jpg",
    collection: "Health & Fitness",
    one_liner: "Replaced our upright vacuum entirely. Two floors twice a week on a single charge, still have battery left.",
    status: "current",
  },
  {
    name: "Apple Watch Series 7",
    photo: "IMG_0422.jpeg",
    collection: "Health & Fitness",
    one_liner: "Upgraded from Series 5 for the bigger screen. Not sure the jump was worth $400 but I wear it every single day.",
    status: "current",
  },
  {
    name: "eufy Smart Scale C1",
    photo: "IMG_0414.jpeg",
    collection: "Health & Fitness",
    one_liner: "Tracks body fat, muscle mass, the works. App is clean, no subscription required, just works.",
    status: "current",
  },

  // ---- Smart Home ----
  {
    name: "Nanoleaf Smart Lights",
    photo: "IMG_0432.jpeg",
    collection: "Smart Home",
    one_liner: "Installed these as a gimmick, now I can't imagine the office without them. Better than Hue for the price.",
    status: "current",
  },
  {
    name: "Sonos Roam",
    photo: "IMG_0415.jpeg",
    collection: "Smart Home",
    one_liner: "The Bluetooth/wifi hybrid is the feature everyone overlooks. Sounds great for the size and works everywhere.",
    status: "current",
  },

  // ---- Archived ----
  {
    name: "iPhone 11 Pro",
    photo: "iphone11.jpeg",
    collection: "Daily Tech",
    status: "archived",
    archive_note: "Owned 2 years, 1 month. Midnight Green was peak Apple color design. Nothing since has looked as good.",
    archived_at: "2021-10-15T00:00:00Z",
  },
  {
    name: "Apple Watch Series 5",
    photo: "series5.jpg",
    collection: "Health & Fitness",
    status: "archived",
    archive_note: "Owned 2 years, 3 months.",
    archived_at: "2021-09-20T00:00:00Z",
  },
  {
    name: 'MacBook Pro 15" (Intel)',
    photo: "macbookpro15.jpg",
    collection: "Daily Tech",
    status: "archived",
    archive_note: "Owned 3 years. Powerful machine but the battery was embarrassing by the end. M1 made it feel like a toy.",
    archived_at: "2020-12-01T00:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Starting seed...\n");

  // 1. Upload all images we need
  const neededImages = new Set<string>();
  neededImages.add("cam.jpg"); // avatar
  for (const p of PRODUCTS) {
    neededImages.add(p.photo);
  }

  console.log(`Uploading ${neededImages.size} images to Storage...`);
  const imageUrls: Record<string, string> = {};
  for (const img of neededImages) {
    try {
      const url = await uploadImage(img);
      imageUrls[img] = url;
      console.log(`  Uploaded: ${img}`);
    } catch (err) {
      console.error(`  FAILED: ${img} — ${err}`);
    }
  }
  console.log("");

  // 2. Insert user into public.users
  console.log("Inserting user...");
  const { error: userErr } = await supabase.from("users").upsert(
    {
      id: USER_ID,
      username: "cam",
      email: "cam@sterp.com",
      name: "Cam Secore",
      bio: "I spend an unreasonable amount of time researching everything I buy. My wife is tired of hearing about it. This is the result.",
      avatar_url: imageUrls["cam.jpg"] ?? null,
      twitter_url: "https://x.com/camsecore",
      instagram_url: "https://instagram.com/camsecore",
      youtube_url: "https://youtube.com/@camsecore",
    },
    { onConflict: "id" }
  );
  if (userErr) {
    console.error("User insert failed:", userErr.message);
    process.exit(1);
  }
  console.log(`  User "cam" inserted (id: ${USER_ID})\n`);

  // 3. Insert collections
  console.log("Inserting collections...");
  for (const col of COLLECTIONS_DEF) {
    const id = uuid();
    collectionIds[col.name] = id;

    const { error: colErr } = await supabase.from("collections").upsert(
      {
        id,
        name: col.name,
        sort_order: col.sort_order,
        user_id: USER_ID,
      },
      { onConflict: "id" }
    );
    if (colErr) {
      console.error(`  Collection "${col.name}" failed:`, colErr.message);
    } else {
      console.log(`  Collection "${col.name}" (sort_order: ${col.sort_order})`);
    }
  }
  console.log("");

  // 4. Insert products
  console.log("Inserting products...");
  const productIds: Record<string, string> = {}; // product name -> id
  // Track sort_order per collection for active products, and per collection for archived
  const sortCounters: Record<string, number> = {};

  for (const p of PRODUCTS) {
    const id = uuid();
    productIds[p.name] = id;

    const collId = collectionIds[p.collection];
    if (!collId) {
      console.error(`  No collection found for "${p.collection}" — skipping ${p.name}`);
      continue;
    }

    // Compute sort_order within collection
    const sortKey = `${p.collection}:${p.status}`;
    sortCounters[sortKey] = (sortCounters[sortKey] ?? 0);
    const sortOrder = sortCounters[sortKey];
    sortCounters[sortKey]++;

    const { error: prodErr } = await supabase.from("products").upsert(
      {
        id,
        name: p.name,
        photo_url: imageUrls[p.photo] ?? null,
        one_liner: p.one_liner ?? null,
        collection_id: collId,
        user_id: USER_ID,
        status: p.status,
        sort_order: sortOrder,
        archive_note: p.archive_note ?? null,
        archived_at: p.archived_at ?? null,
      },
      { onConflict: "id" }
    );
    if (prodErr) {
      console.error(`  Product "${p.name}" failed:`, prodErr.message);
    } else {
      console.log(`  Product "${p.name}" [${p.status}] → ${p.collection}`);
    }
  }
  console.log("");

  // 5. Insert top_picks
  console.log("Inserting top picks...");
  const favorites = PRODUCTS.filter((p) => p.isFavorite);
  for (const fav of favorites) {
    const prodId = productIds[fav.name];
    if (!prodId) {
      console.error(`  No product ID for favorite "${fav.name}"`);
      continue;
    }

    const { error: tpErr } = await supabase.from("top_picks").upsert(
      {
        id: uuid(),
        product_id: prodId,
        user_id: USER_ID,
        sort_order: fav.favoriteSortOrder!,
      },
      { onConflict: "id" }
    );
    if (tpErr) {
      console.error(`  Top pick "${fav.name}" failed:`, tpErr.message);
    } else {
      console.log(`  Top pick #${fav.favoriteSortOrder}: ${fav.name}`);
    }
  }

  console.log("\nSeed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
