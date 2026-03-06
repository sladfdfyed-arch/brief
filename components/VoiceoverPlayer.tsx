"use client";

import { useCallback, useEffect, useRef } from "react";
import { Product } from "@/lib/types";
import styles from "./VoiceoverPlayer.module.css";

interface VoiceoverPlayerProps {
  product: Product | null;
  setAudioElementRef?: (el: HTMLAudioElement | null) => void;
}

export default function VoiceoverPlayer({
  product,
  setAudioElementRef,
}: VoiceoverPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setAudioRef = useCallback(
    (el: HTMLAudioElement | null) => {
      audioRef.current = el;
      setAudioElementRef?.(el);
    },
    [setAudioElementRef],
  );

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (product?.audioFile) {
      audioRef.current.src = product.audioFile;
    }
  }, [product]);

  if (!product) {
    return (
      <aside className={styles.panel}>
        <p className={styles.placeholder}>
          Hover or click an item to play a voice note and read the caption.
        </p>
      </aside>
    );
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{product.name}</h2>
        {product.username ? (
          <span className={styles.username}>{product.username}</span>
        ) : null}
      </div>
      <p className={styles.caption}>{product.voiceoverText}</p>
      <audio ref={setAudioRef} preload="auto" />
    </aside>
  );
}
