/**
 * Detect video URLs and return embed info.
 * Supports YouTube, Vimeo, Loom, Streamable, Wistia, Dailymotion, and Twitch.
 */

export type VideoProvider =
  | "youtube"
  | "vimeo"
  | "loom"
  | "streamable"
  | "wistia"
  | "dailymotion"
  | "twitch";

export interface VideoEmbedInfo {
  provider: VideoProvider;
  id: string;
  embedUrl: string;
  /** Twitch requires parent domain; client must append &parent=hostname */
  requiresParent?: boolean;
}

/**
 * Extract YouTube video ID from various URL formats.
 */
function getYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  const short = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?|$|\/)/);
  if (short) return short[1];
  const watch = trimmed.match(/(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/);
  if (watch) return watch[1];
  const embed = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];
  const legacy = trimmed.match(/(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
  if (legacy) return legacy[1];
  return null;
}

/**
 * Extract Vimeo video ID from URL.
 */
function getVimeoId(url: string): string | null {
  const trimmed = url.trim();
  const match = trimmed.match(/(?:vimeo\.com\/)(\d+)(?:\?|$|\/)/);
  return match ? match[1] : null;
}

/**
 * Extract Loom video ID. Share: loom.com/share/ID, embed: loom.com/embed/ID
 */
function getLoomId(url: string): string | null {
  const trimmed = url.trim();
  const share = trimmed.match(/(?:loom\.com\/share\/)([a-zA-Z0-9]+)(?:\?|$|\/)/);
  if (share) return share[1];
  const embed = trimmed.match(/(?:loom\.com\/embed\/)([a-zA-Z0-9]+)(?:\?|$|\/)/);
  if (embed) return embed[1];
  return null;
}

/**
 * Extract Streamable shortcode. streamable.com/ID
 */
function getStreamableId(url: string): string | null {
  const trimmed = url.trim();
  const match = trimmed.match(/(?:streamable\.com\/)([a-zA-Z0-9]+)(?:\?|$|\/)/);
  return match ? match[1] : null;
}

/**
 * Extract Wistia hashed ID. wistia.com/medias/ID or wi.st/medias/ID
 */
function getWistiaId(url: string): string | null {
  const trimmed = url.trim();
  const wistia = trimmed.match(/(?:wistia\.com\/medias\/)([a-zA-Z0-9]+)(?:\?|$|\/)/);
  if (wistia) return wistia[1];
  const wist = trimmed.match(/(?:wi\.st\/medias\/)([a-zA-Z0-9]+)(?:\?|$|\/)/);
  if (wist) return wist[1];
  return null;
}

/**
 * Extract Dailymotion video ID. dailymotion.com/video/ID
 */
function getDailymotionId(url: string): string | null {
  const trimmed = url.trim();
  const match = trimmed.match(/(?:dailymotion\.com\/video\/)([a-zA-Z0-9]+)(?:\?|$|\/)/);
  return match ? match[1] : null;
}

/**
 * Extract Twitch ID and type. Supports videos, clips, and live channels.
 */
function getTwitchInfo(url: string): { id: string; type: "video" | "clip" | "channel" } | null {
  const trimmed = url.trim();
  const videos = trimmed.match(/(?:twitch\.tv\/videos\/)(\d+)(?:\?|$|\/)/);
  if (videos) return { id: videos[1], type: "video" };
  const clip = trimmed.match(/(?:twitch\.tv\/[^/]+\/clip\/)([a-zA-Z0-9_-]+)(?:\?|$|\/)/);
  if (clip) return { id: clip[1], type: "clip" };
  // twitch.tv/channelname (live stream)
  const channel = trimmed.match(/(?:twitch\.tv\/)([a-zA-Z0-9_]+)(?:\?|$|\/)/);
  if (channel && !trimmed.includes("/videos/") && !trimmed.includes("/clip/")) {
    return { id: channel[1], type: "channel" };
  }
  return null;
}

/**
 * Check if URL is a video link and return embed info.
 */
export function getVideoEmbedInfo(url: string | null | undefined): VideoEmbedInfo | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const ytId = getYouTubeId(trimmed);
  if (ytId) {
    return {
      provider: "youtube",
      id: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`,
    };
  }

  const vimeoId = getVimeoId(trimmed);
  if (vimeoId) {
    return {
      provider: "vimeo",
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  const loomId = getLoomId(trimmed);
  if (loomId) {
    return {
      provider: "loom",
      id: loomId,
      embedUrl: `https://www.loom.com/embed/${loomId}`,
    };
  }

  const streamableId = getStreamableId(trimmed);
  if (streamableId) {
    return {
      provider: "streamable",
      id: streamableId,
      embedUrl: `https://streamable.com/e/${streamableId}`,
    };
  }

  const wistiaId = getWistiaId(trimmed);
  if (wistiaId) {
    return {
      provider: "wistia",
      id: wistiaId,
      embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaId}`,
    };
  }

  const dailymotionId = getDailymotionId(trimmed);
  if (dailymotionId) {
    return {
      provider: "dailymotion",
      id: dailymotionId,
      embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionId}`,
    };
  }

  const twitch = getTwitchInfo(trimmed);
  if (twitch) {
    const param = twitch.type === "channel" ? "channel" : twitch.type;
    return {
      provider: "twitch",
      id: twitch.id,
      embedUrl: `https://player.twitch.tv/?${param}=${twitch.id}`,
      requiresParent: true,
    };
  }

  return null;
}
