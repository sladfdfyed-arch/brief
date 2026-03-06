"use client";

import { useEffect, useMemo, useRef } from "react";
import styles from "./TweetEmbed.module.css";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => Promise<void> | void;
      };
    };
  }
}

interface TweetEmbedProps {
  tweetUrl: string;
}

export default function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const normalizedUrl = useMemo(
    () => tweetUrl.replace("https://x.com/", "https://twitter.com/"),
    [tweetUrl],
  );

  useEffect(() => {
    const mount = rootRef.current;
    if (!mount) {
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://platform.twitter.com/widgets.js"]',
    );

    const load = () => {
      window.twttr?.widgets?.load(mount);
    };

    if (existing) {
      load();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = load;
    document.body.appendChild(script);
  }, [normalizedUrl]);

  return (
    <div className={styles.wrapper} ref={rootRef}>
      <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true">
        <a href={normalizedUrl}>View tweet</a>
      </blockquote>
    </div>
  );
}
