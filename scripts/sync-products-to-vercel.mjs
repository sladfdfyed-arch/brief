#!/usr/bin/env node
/**
 * Sync local data/products.json to the deployed Vercel app's Blob storage.
 * Usage: node scripts/sync-products-to-vercel.mjs [BASE_URL]
 * Example: node scripts/sync-products-to-vercel.mjs https://brief-wheel-20260305193023.vercel.app
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseUrl = process.argv[2] || process.env.VERCEL_URL || "https://brief-wheel-20260305193023.vercel.app";
const apiUrl = baseUrl.replace(/\/$/, "") + "/api/products";

const productsPath = join(__dirname, "..", "data", "products.json");
const products = JSON.parse(readFileSync(productsPath, "utf8"));

console.log(`Syncing ${products.length} products to ${apiUrl}...`);

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const body = {
    id: p.id,
    name: p.name ?? "",
    icon: p.icon ?? "",
    shortDescription: p.shortDescription ?? "",
    voiceoverText: p.voiceoverText ?? "",
    url: p.url ?? "",
    tweetUrl: p.tweetUrl ?? null,
    username: p.username ?? null,
  };
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(`Failed to sync "${p.name}" (${p.id}):`, err.error || res.statusText);
    process.exit(1);
  }
  console.log(`  ✓ ${p.name}`);
}

console.log(`Done! Synced ${products.length} products.`);
