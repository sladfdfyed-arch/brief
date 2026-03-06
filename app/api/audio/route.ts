import { NextResponse } from "next/server";
import {
  deleteAudioFile,
  readProducts,
  saveAudioFile,
  upsertProduct,
} from "@/lib/products";

export async function POST(req: Request) {
  const formData = await req.formData();
  const productId = formData.get("productId");
  const audio = formData.get("audio");

  if (
    typeof productId !== "string" ||
    productId.length === 0 ||
    !(audio instanceof Blob)
  ) {
    return NextResponse.json(
      { error: "productId and audio are required." },
      { status: 400 },
    );
  }

  const products = await readProducts();
  const current = products.find((product) => product.id === productId);
  if (!current) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (current.audioFile) {
    await deleteAudioFile(current.audioFile);
  }
  const audioFile = await saveAudioFile(productId, audio);
  await upsertProduct({
    id: current.id,
    name: current.name,
    icon: current.icon,
    shortDescription: current.shortDescription,
    voiceoverText: current.voiceoverText,
    audioFile,
    url: current.url,
    tweetUrl: current.tweetUrl ?? null,
  });

  return NextResponse.json({ audioFile });
}
