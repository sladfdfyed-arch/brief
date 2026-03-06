"use client";

import { useEffect, useState } from "react";
import { VideoEmbedInfo } from "@/lib/video";
import styles from "./VideoEmbed.module.css";

interface VideoEmbedProps {
  info: VideoEmbedInfo;
}

export default function VideoEmbed({ info }: VideoEmbedProps) {
  const [src, setSrc] = useState<string | null>(
    info.requiresParent ? null : info.embedUrl,
  );

  useEffect(() => {
    if (info.requiresParent && typeof window !== "undefined") {
      const sep = info.embedUrl.includes("?") ? "&" : "?";
      setSrc(`${info.embedUrl}${sep}parent=${window.location.hostname}`);
    }
  }, [info.embedUrl, info.requiresParent]);

  if (!src) {
    return <div className={styles.wrapper} />;
  }

  return (
    <div className={styles.wrapper}>
      <iframe
        src={src}
        title="Video embed"
        className={styles.iframe}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
