import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function extractMeta(html: string, property: string): string | null {
  // Handle both attribute orders and quote styles
  const patterns = [
    new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+property=["']${property}["']`, "i"),
    new RegExp(`<meta\\s+[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta\\s+[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractTitle(html: string): string | null {
  const og = extractMeta(html, "og:title");
  if (og) return og;
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return t?.[1]?.trim() ?? null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BriefPreviewBot/1.0; +https://brief-wheel.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ image: null, title: null }, { headers: cacheHeaders() });
    }

    // Only read first 80 KB — og tags are always in <head>
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    if (reader) {
      while (bytes < 80_000) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        bytes += value.byteLength;
      }
      reader.cancel();
    }
    const html = new TextDecoder().decode(
      chunks.reduce((acc, c) => {
        const merged = new Uint8Array(acc.byteLength + c.byteLength);
        merged.set(acc);
        merged.set(c, acc.byteLength);
        return merged;
      }, new Uint8Array()),
    );

    const image = extractMeta(html, "og:image");
    const title = extractTitle(html);

    return NextResponse.json({ image, title }, { headers: cacheHeaders() });
  } catch {
    return NextResponse.json({ image: null, title: null }, { headers: cacheHeaders() });
  }
}

function cacheHeaders() {
  return { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" };
}
