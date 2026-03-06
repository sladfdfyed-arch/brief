import { NextResponse } from "next/server";
import { deleteAudioFile, deleteProductById } from "@/lib/products";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteProductById(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    if (deleted.audioFile) {
      await deleteAudioFile(deleted.audioFile);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
