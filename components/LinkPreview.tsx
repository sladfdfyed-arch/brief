"use client";

import { useEffect, useState } from "react";
import styles from "./LinkPreview.module.css";

interface PreviewData {
  image: string | null;
  title: string | null;
}

interface Props {
  url: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LinkPreview({ url }: Props) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData(null);
    setImgError(false);

    fetch(`/api/preview?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d: PreviewData) => setData(d))
      .catch(() => setData({ image: null, title: null }))
      .finally(() => setLoading(false));
  }, [url]);

  const domain = getDomain(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Open ${domain}`}
    >
      <div className={styles.thumb}>
        {loading ? (
          <div className={styles.skeleton} />
        ) : data?.image && !imgError ? (
          <img
            src={data.image}
            alt={data.title ?? domain}
            className={styles.img}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.fallback}>
            <span className={styles.fallbackDomain}>{domain}</span>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <span className={styles.domain}>{domain}</span>
        <span className={styles.arrow}>↗</span>
      </div>
    </a>
  );
}
