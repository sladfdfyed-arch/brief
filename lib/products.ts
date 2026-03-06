import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { del, head, put } from "@vercel/blob";
import { unstable_noStore as noStore } from "next/cache";
import { Product, ProductInput } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "products.json");
const blobProductsPath = "data/products.json";
const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

export async function readProducts(): Promise<Product[]> {
  noStore();
  const parsed = await readProductsStore();
  return parsed.sort(
    (a, b) =>
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
  );
}

async function writeProducts(products: Product[]): Promise<void> {
  await writeProductsStore(products);
}

async function readProductsStore(): Promise<Product[]> {
  // Production: Blob is the source of truth. Code deploys never overwrite Blob.
  if (hasBlobToken) {
    try {
      const entry = await head(blobProductsPath);
      const url = new URL(entry.url);
      // Bust public blob caches for this mutable JSON document.
      url.searchParams.set("v", Date.now().toString());
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        return (await res.json()) as Product[];
      }
    } catch {
      // Fall through to local store on network/token errors.
    }
  }

  // Local fallback only. Never used to overwrite Blob.
  try {
    await ensureDataFile();
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

async function writeProductsStore(products: Product[]): Promise<void> {
  if (process.env.VERCEL && !hasBlobToken) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Link a Vercel Blob store in your project settings (Storage tab) and redeploy.",
    );
  }

  if (hasBlobToken) {
    try {
      await put(blobProductsPath, JSON.stringify(products, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
      });
      return;
    } catch (err) {
      // On Vercel, local fallback fails. Surface the Blob error.
      throw err;
    }
  }

  try {
    await ensureDataFile();
    await fs.writeFile(dataFile, JSON.stringify(products, null, 2), "utf8");
  } catch (err) {
    throw new Error(
      "Cannot write products: no Blob token and local filesystem unavailable. " +
        "Link a Vercel Blob store to your project.",
    );
  }
}

export async function upsertProduct(input: ProductInput): Promise<Product> {
  const products = await readProducts();
  const product: Product = {
    id: input.id ?? randomUUID(),
    name: (input.name ?? "").trim(),
    icon: (input.icon ?? "").trim(),
    shortDescription: (input.shortDescription ?? "").trim(),
    voiceoverText: (input.voiceoverText ?? "").trim(),
    audioFile: input.audioFile ?? null,
    url: (input.url ?? "").trim(),
    tweetUrl: input.tweetUrl?.trim() || null,
    username: input.username?.trim() || null,
    dateAdded: new Date().toISOString(),
  };

  const idx = products.findIndex((existing) => existing.id === product.id);
  if (idx >= 0) {
    const previous = products[idx];
    products[idx] = {
      ...previous,
      ...product,
      dateAdded: previous.dateAdded,
    };
  } else {
    products.push(product);
  }

  await writeProducts(products);
  return product;
}

export async function deleteProductById(id: string): Promise<Product | null> {
  const products = await readProducts();
  const toDelete = products.find((product) => product.id === id) ?? null;
  if (!toDelete) {
    return null;
  }

  const next = products.filter((product) => product.id !== id);
  await writeProducts(next);
  return toDelete;
}

export async function saveAudioFile(
  productId: string,
  audio: Blob,
): Promise<string> {
  if (hasBlobToken) {
    const uploaded = await put(`audio/${productId}.webm`, audio, {
      access: "public",
      addRandomSuffix: true,
      contentType: "audio/webm",
    });
    return uploaded.url;
  }

  const audioDir = path.join(process.cwd(), "public", "audio");
  await fs.mkdir(audioDir, { recursive: true });
  const filename = `${productId}-${Date.now()}.webm`;
  const target = path.join(audioDir, filename);
  const buffer = Buffer.from(await audio.arrayBuffer());
  await fs.writeFile(target, buffer);
  return `/audio/${filename}`;
}

export async function deleteAudioFile(audioFile: string): Promise<void> {
  if (!audioFile) {
    return;
  }

  if (/^https?:\/\//i.test(audioFile) && hasBlobToken) {
    try {
      await del(audioFile);
    } catch {
      // Ignore: already missing or inaccessible.
    }
    return;
  }

  if (audioFile.startsWith("/audio/")) {
    const relative = audioFile.replace(/^\//, "");
    const filePath = path.join(process.cwd(), "public", relative);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore: already missing.
    }
  }
}
