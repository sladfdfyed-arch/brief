/**
 * Extract Twitter/X tweet ID from a status URL.
 * Supports twitter.com and x.com URLs (with or without query/hash).
 */
export function getTweetId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  // Match /status/123456 or /status/123456?...
  const match = trimmed.match(/\/status\/(\d+)(?:\?|$|\/)/) ?? trimmed.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

export const TWEET_EMBED_BASE = "https://platform.twitter.com/embed/tweet.html";

export function getTweetEmbedUrl(
  url: string | null | undefined,
): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }
  const trimmed = url.trim();
  if (!trimmed.includes("/status/")) {
    return null;
  }

  // twitframe is generally more reliable for iframe-based tweet embeds.
  const normalized = trimmed.replace("https://x.com/", "https://twitter.com/");
  return `https://twitframe.com/show?url=${encodeURIComponent(normalized)}`;
}
