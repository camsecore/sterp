/**
 * Re-crop and re-upload specific product photos with zoom adjustments.
 *
 * Run with:
 *   npx tsx scripts/recrop-photos.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
} catch {
  console.error("dotenv is not installed. Run: npm install --save-dev dotenv");
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PHOTOS_DIR =
  "/Users/camsecore/Library/Mobile Documents/com~apple~CloudDocs/Sterp/cam's products";
const BUCKET = "product-photos";

// Zoom factor: 1.0 = no zoom, 2.0 = 2x zoom (crop to 50% of each dimension)
const ZOOM_LEVELS: Record<string, { file: string; zoom: number }> = {
  // Tiny zoom
  "Casper Glow Lights": { file: "casperlights.jpg", zoom: 1.15 },

  // Zoom in a lot more
  "iPad Pro 11\" (2018)": { file: "ipadpro.jpg", zoom: 2.5 },
  "Eero WiFi (2nd Gen)": { file: "eerowifi.jpg", zoom: 2.5 },
  "Bose SoundSport Free": { file: "soundsport.jpg", zoom: 2.5 },
  "iPhone XS Max": { file: "iphonexsmax.jpg", zoom: 2.5 },
  "iPhone 11 Pro": { file: "iphone11.jpeg", zoom: 2.5 },
  "Eero Pro WiFi (2nd Gen)": { file: "eeropro.jpg", zoom: 2.5 },
  "Upright GO": { file: "uprightgo.jpg", zoom: 2.5 },
  "Apple HomePod": { file: "homepod.jpg", zoom: 2.5 },
  "iPhone 12 Pro": { file: "iphone12.jpeg", zoom: 2.5 },
  "Apple Watch Series 5": { file: "series5.jpg", zoom: 2.5 },
  "Philips Hue Lights": { file: "hue.jpg", zoom: 2.5 },
  "Sonos Beam": { file: "sonosbeam.jpg", zoom: 2.5 },
  "OXO On Barista Brain Coffee": { file: "oxocoffee.jpg", zoom: 2.5 },

  // Double zoom
  "AirPods 2": { file: "airpods2.jpg", zoom: 2.0 },
  "Oura Ring (Gen 3)": { file: "ouraring3.jpg", zoom: 2.0 },
  "Apple TV 4K (Gen 2)": { file: "appletv4kgen2.jpg", zoom: 2.0 },
};

async function processImage(filePath: string, zoom: number): Promise<Buffer> {
  const meta = await sharp(filePath).metadata();
  const w = meta.width!;
  const h = meta.height!;

  const targetRatio = 4 / 3;
  const currentRatio = w / h;

  // First compute the 4:3 crop region
  let cropW = w;
  let cropH = h;
  if (currentRatio > targetRatio) {
    cropW = Math.round(h * targetRatio);
  } else {
    cropH = Math.round(w / targetRatio);
  }

  // Apply zoom: shrink the crop region by the zoom factor
  cropW = Math.round(cropW / zoom);
  cropH = Math.round(cropH / zoom);

  // Ensure minimum dimensions
  cropW = Math.max(cropW, 100);
  cropH = Math.max(cropH, 75);

  const left = Math.round((w - cropW) / 2);
  const top = Math.round((h - cropH) / 2);

  const outputWidth = Math.min(cropW, 1600);
  const outputHeight = Math.round(outputWidth / targetRatio);

  let quality = 85;
  let buf: Buffer;
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

async function main() {
  const productNames = Object.keys(ZOOM_LEVELS);

  // Fetch all archived products, then filter client-side
  // (avoids issues with special chars in .in() filter)
  const { data: allProducts, error } = await supabase
    .from("products")
    .select("id, name, user_id")
    .eq("status", "archived");

  const products = allProducts?.filter((p) => productNames.includes(p.name));

  if (error) {
    console.error("Query error:", error.message);
    process.exit(1);
  }

  console.log(`Found ${products!.length} products to re-crop.\n`);

  let success = 0;
  let failed = 0;

  for (const product of products!) {
    const config = ZOOM_LEVELS[product.name];
    if (!config) continue;

    const filePath = path.join(PHOTOS_DIR, config.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ${product.name} ... ✗ file not found: ${config.file}`);
      failed++;
      continue;
    }

    try {
      process.stdout.write(`  ${product.name} (${config.zoom}x zoom) ... `);
      const buf = await processImage(filePath, config.zoom);
      const sizeMB = (buf.length / (1024 * 1024)).toFixed(2);

      const storagePath = `${product.user_id}/${product.id}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buf, { contentType: "image/webp", upsert: true });

      if (uploadError) throw uploadError;
      console.log(`✓ (${sizeMB} MB)`);
      success++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗ ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} re-cropped, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
