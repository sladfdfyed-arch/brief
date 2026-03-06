#!/usr/bin/env node
/**
 * Overwrite the products blob with the local data/products.json file.
 * Usage:
 *   node --env-file=.vercel/.env.production.local scripts/push-local-products-to-blob.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const productsPath = join(__dirname, "..", "data", "products.json");
const productsRaw = readFileSync(productsPath, "utf8");
const products = JSON.parse(productsRaw);

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN is required.");
}

await put("data/products.json", JSON.stringify(products, null, 2), {
  token: process.env.BLOB_READ_WRITE_TOKEN,
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
  cacheControlMaxAge: 60,
});

console.log(`Uploaded ${products.length} products to Blob.`);
