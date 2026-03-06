"use client";

import { FormEvent, useEffect, useState } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import { Product } from "@/lib/types";
import styles from "./page.module.css";

interface ProductDraft {
  id?: string;
  name: string;
  icon: string;
  shortDescription: string;
  voiceoverText: string;
  url: string;
  tweetUrl: string;
  username: string;
}

const emptyDraft: ProductDraft = {
  name: "",
  icon: "",
  shortDescription: "",
  voiceoverText: "",
  url: "",
  tweetUrl: "",
  username: "",
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const res = await fetch("/api/products");
    const data = (await res.json()) as Product[] | { error?: string };
    if (!res.ok) {
      setError(
        (typeof data === "object" && data !== null && "error" in data
          ? (data as { error: string }).error
          : null) ?? "Failed to load products."
      );
      setProducts([]);
      return;
    }
    setProducts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch(() => {
      setProducts([]);
      setError("Failed to load products.");
    });
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          tweetUrl: draft.tweetUrl.trim() || null,
          username: draft.username.trim() || null,
        }),
      });
      const data = (await res.json()) as Product | { error?: string };
      if (!res.ok) {
        setError(
          (typeof data === "object" && "error" in data
            ? (data as { error: string }).error
            : null) ?? "Failed to save product."
        );
        return;
      }
      setDraft(emptyDraft);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    setError(null);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok) {
      setError(
        (typeof data === "object" && "error" in data
          ? (data as { error: string }).error
          : null) ?? "Failed to delete product."
      );
      return;
    }
    await load();
  };

  const onRecord = async (productId: string, blob: Blob) => {
    setError(null);
    const body = new FormData();
    body.append("productId", productId);
    body.append("audio", blob, `${productId}.webm`);
    const res = await fetch("/api/audio", { method: "POST", body });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(
        (typeof data === "object" && "error" in data
          ? (data as { error: string }).error
          : null) ?? "Failed to upload audio."
      );
      return;
    }
    await load();
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Admin</h1>
      <p className={styles.subtitle}>
        Add products and record voiceovers from this page.
      </p>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>New / Edit Product</h2>
          <form className={styles.form} onSubmit={onSubmit}>
            <input
              placeholder="Name"
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            <input
              placeholder="Icon (emoji or short text)"
              value={draft.icon}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, icon: event.target.value }))
              }
            />
            <input
              placeholder="Short description"
              value={draft.shortDescription}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  shortDescription: event.target.value,
                }))
              }
            />
            <textarea
              placeholder="Voiceover caption text"
              value={draft.voiceoverText}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  voiceoverText: event.target.value,
                }))
              }
            />
            <input
              placeholder="Product URL"
              value={draft.url}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, url: event.target.value }))
              }
            />
            <input
              placeholder="Tweet URL (optional – embed a tweet)"
              value={draft.tweetUrl}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, tweetUrl: event.target.value }))
              }
            />
            <input
              placeholder="Username (optional – e.g. Slayed, alex_curator)"
              value={draft.username}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, username: event.target.value }))
              }
            />
            <div className={styles.actions}>
              <button className={styles.save} disabled={loading} type="submit">
                {loading ? "Saving..." : draft.id ? "Update Product" : "Add Product"}
              </button>
              <button
                className={styles.ghost}
                type="button"
                onClick={() => setDraft(emptyDraft)}
              >
                Clear
              </button>
            </div>
          </form>
        </article>

        <article className={styles.card}>
          <h2>Products</h2>
          <div className={styles.list}>
            {products.map((product) => (
              <div key={product.id} className={styles.item}>
                <div className={styles.itemTop}>
                  <strong>
                    {product.icon} {product.name}
                  </strong>
                  <div className={styles.tinyActions}>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          id: product.id,
                          name: product.name,
                          icon: product.icon,
                          shortDescription: product.shortDescription,
                          voiceoverText: product.voiceoverText,
                          url: product.url,
                          tweetUrl: product.tweetUrl ?? "",
                          username: product.username ?? "",
                        })
                      }
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(product.id)}>
                      Delete
                    </button>
                  </div>
                </div>
                <p className={styles.itemDescription}>{product.shortDescription}</p>
                <AudioRecorder
                  onRecorded={(blob) => onRecord(product.id, blob)}
                />
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
