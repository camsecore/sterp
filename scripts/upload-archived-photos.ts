/**
 * Batch upload product photos for archived products.
 *
 * Reads images from a local folder, fuzzy-matches filenames to archived
 * products with no photo_url, shows a match table for review, then
 * center-crops to 4:3, converts to WebP, and uploads to Supabase Storage.
 *
 * Run with:
 *   npx tsx scripts/upload-archived-photos.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import sharp from "sharp";

// ---------------------------------------------------------------------------
// Load env
// ---------------------------------------------------------------------------
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
} catch {
  console.error("dotenv is not installed. Run: npm install --save-dev dotenv");
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PHOTOS_DIR =
  "/Users/camsecore/Library/Mobile Documents/com~apple~CloudDocs/Sterp/cam's products";
const BUCKET = "product-photos";
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".heic", ".webp"]);

// ---------------------------------------------------------------------------
// String similarity (Dice coefficient on bigrams — simple, no deps)
// ---------------------------------------------------------------------------
function bigrams(str: string): Set<string> {
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  const set = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    set.add(s.slice(i, i + 2));
  }
  return set;
}

function similarity(a: string, b: string): number {
  const aGrams = bigrams(a);
  const bGrams = bigrams(b);
  if (aGrams.size === 0 && bGrams.size === 0) return 1;
  if (aGrams.size === 0 || bGrams.size === 0) return 0;
  let intersection = 0;
  for (const g of aGrams) {
    if (bGrams.has(g)) intersection++;
  }
  return (2 * intersection) / (aGrams.size + bGrams.size);
}

// Also check if one string contains the other (handles "iphone11" matching "iPhone 11")
function containsScore(filename: string, productName: string): number {
  const f = filename.toLowerCase().replace(/[^a-z0-9]/g, "");
  const p = productName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (f.includes(p) || p.includes(f)) return 1;
  return 0;
}

function matchScore(filename: string, productName: string): number {
  const dice = similarity(filename, productName);
  const contains = containsScore(filename, productName);
  // Weighted: containment is a strong signal
  return Math.max(dice, contains * 0.95);
}

// ---------------------------------------------------------------------------
// Prompt helper
// ---------------------------------------------------------------------------
function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ---------------------------------------------------------------------------
// Image processing: center-crop to 4:3, convert to WebP, compress < 5 MB
// ---------------------------------------------------------------------------
async function processImage(filePath: string): Promise<Buffer> {
  const img = sharp(filePath);
  const meta = await img.metadata();
  const w = meta.width!;
  const h = meta.height!;

  const targetRatio = 4 / 3;
  const currentRatio = w / h;

  let cropW = w;
  let cropH = h;

  if (currentRatio > targetRatio) {
    // Too wide — crop sides
    cropW = Math.round(h * targetRatio);
  } else {
    // Too tall — crop top/bottom
    cropH = Math.round(w / targetRatio);
  }

  const left = Math.round((w - cropW) / 2);
  const top = Math.round((h - cropH) / 2);

  // Cap output width at 1600px for reasonable file sizes
  const outputWidth = Math.min(cropW, 1600);
  const outputHeight = Math.round(outputWidth / targetRatio);

  let quality = 85;
  let buf: Buffer;

  // Try compressing, lower quality if over 5 MB
  while (true) {
    buf = await sharp(filePath)
      .extract({ left, top, width: cropW, height: cropH })
      .resize(outputWidth, outputHeight)
      .webp({ quality })
      .toBuffer();

    if (buf.length <= 5 * 1024 * 1024 || quality <= 30) break;
    quality -= 10;
  }

  return buf;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // 1. Fetch archived products with no photo
  console.log("Fetching archived products with no photo_url...\n");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, user_id, status, photo_url")
    .eq("status", "archived")
    .is("photo_url", null);

  if (error) {
    console.error("Supabase query error:", error.message);
    process.exit(1);
  }
  if (!products || products.length === 0) {
    console.log("No archived products without photos found.");
    return;
  }
  console.log(`Found ${products.length} archived products without photos.\n`);

  // 2. Read image files from folder
  const allFiles = fs.readdirSync(PHOTOS_DIR);
  const imageFiles = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTS.has(ext);
  });
  console.log(`Found ${imageFiles.length} image files in photos folder.\n`);

  // 3. Fuzzy-match each product to best file
  type Match = {
    product: (typeof products)[0];
    file: string | null;
    score: number;
  };

  const matches: Match[] = [];
  const usedFiles = new Set<string>();

  for (const product of products) {
    let bestFile: string | null = null;
    let bestScore = 0;

    for (const file of imageFiles) {
      const baseName = path.basename(file, path.extname(file));
      const score = matchScore(baseName, product.name);
      if (score > bestScore) {
        bestScore = score;
        bestFile = file;
      }
    }

    matches.push({ product, file: bestFile, score: bestScore });
  }

  // Sort by score descending for readability
  matches.sort((a, b) => b.score - a.score);

  // Deduplicate: if two products matched the same file, keep the higher score
  for (const m of matches) {
    if (m.file && usedFiles.has(m.file)) {
      m.file = null;
      m.score = 0;
    } else if (m.file) {
      usedFiles.add(m.file);
    }
  }

  // 4. Print match table
  const MIN_CONFIDENCE = 0.3;
  console.log("=" .repeat(90));
  console.log(
    "Product Name".padEnd(35) +
    "Matched File".padEnd(35) +
    "Score".padEnd(10) +
    "Action"
  );
  console.log("-".repeat(90));

  for (const m of matches) {
    const name = m.product.name.slice(0, 33).padEnd(35);
    const file = (m.file ?? "—").slice(0, 33).padEnd(35);
    const score = m.score.toFixed(2).padEnd(10);
    const action = m.file && m.score >= MIN_CONFIDENCE ? "UPLOAD" : "SKIP";
    console.log(`${name}${file}${score}${action}`);
  }
  console.log("=".repeat(90));

  const toUpload = matches.filter((m) => m.file && m.score >= MIN_CONFIDENCE);
  const skipped = matches.length - toUpload.length;
  console.log(`\n${toUpload.length} to upload, ${skipped} skipped (low confidence or no match).`);

  if (toUpload.length === 0) {
    console.log("Nothing to upload.");
    return;
  }

  // 5. Wait for confirmation
  const answer = await ask("\nProceed with upload? (y/N): ");
  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");
    return;
  }

  // 6. Process and upload each matched pair
  console.log("\nUploading...\n");
  let success = 0;
  let failed = 0;

  for (const m of toUpload) {
    const filePath = path.join(PHOTOS_DIR, m.file!);
    const storagePath = `${m.product.user_id}/${m.product.id}.webp`;

    try {
      process.stdout.write(`  ${m.product.name} ... `);

      // Process image
      const webpBuffer = await processImage(filePath);
      const sizeMB = (webpBuffer.length / (1024 * 1024)).toFixed(2);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, webpBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Build the CDN URL (matches existing pattern)
      const photoUrl = `https://images.sterp.com/${storagePath}`;

      // Update the product row (status stays archived)
      const { error: updateError } = await supabase
        .from("products")
        .update({ photo_url: photoUrl })
        .eq("id", m.product.id);

      if (updateError) throw updateError;

      console.log(`✓ (${sizeMB} MB)`);
      success++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗ ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} uploaded, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
