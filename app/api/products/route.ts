import { NextResponse } from "next/server";
import { readProducts, upsertProduct } from "@/lib/products";
import { ProductInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json(products);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load products.";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ProductInput>;

    const saved = await upsertProduct({
      id: body.id,
      name: body.name ?? "",
      icon: body.icon ?? "",
      shortDescription: body.shortDescription ?? "",
      voiceoverText: body.voiceoverText ?? "",
      audioFile: body.audioFile ?? null,
      url: body.url ?? "",
      tweetUrl: body.tweetUrl ?? null,
      username: body.username ?? null,
    });

    return NextResponse.json(saved);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save product.";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
